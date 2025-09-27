import { SOC_5S_REST } from '../data/socMaps';

/**
 * Интерполяция SoC по напряжению
 * @param voltage Измеренное напряжение
 * @param socMap Таблица соответствия напряжение -> SoC
 * @returns Процент заряда (0-100)
 */
export function interpolateSoC(voltage: number, socMap = SOC_5S_REST): number {
  // Находим ближайшие точки для интерполяции
  let lowerPoint = null;
  let upperPoint = null;
  
  for (let i = 0; i < socMap.length; i++) {
    const point = socMap[i];
    if (point.v <= voltage) {
      lowerPoint = point;
    }
    if (point.v >= voltage && !upperPoint) {
      upperPoint = point;
      break;
    }
  }
  
  // Если напряжение вне диапазона
  if (!lowerPoint) {
    return voltage > socMap[0].v ? 100 : 0;
  }
  if (!upperPoint) {
    return voltage < socMap[socMap.length - 1].v ? 0 : 100;
  }
  
  // Линейная интерполяция
  const voltageDiff = upperPoint.v - lowerPoint.v;
  const socDiff = upperPoint.soc - lowerPoint.soc;
  const voltageRatio = (voltage - lowerPoint.v) / voltageDiff;
  
  return lowerPoint.soc + (socDiff * voltageRatio);
}

/**
 * Оценка SoC по напряжению с учётом нагрузки
 * @param voltage Измеренное напряжение
 * @param cRate Ток нагрузки в единицах C (0 = покой)
 * @returns Процент заряда (0-100)
 */
export function socFromVoltage5S(voltage: number, cRate = 0): number {
  // Коррекция под ток: deltaV ≈ k * C_rate
  const k = 0.35; // В на 1C
  const voltageAdjusted = voltage + (k * cRate);
  
  return interpolateSoC(voltageAdjusted, SOC_5S_REST);
}

/**
 * Оценка оставшегося времени работы по напряжению
 * @param voltage Текущее напряжение
 * @param cRate Ток нагрузки
 * @param packWh Энергия аккумулятора до полного разряда
 * @param powerW Мощность инструмента
 * @param efficiency Коэффициент эффективности
 * @returns Время работы в минутах
 */
export function estimateRemainingTime(
  voltage: number,
  cRate: number,
  packWh: number,
  powerW: number,
  efficiency = 0.85
): number {
  const soc = socFromVoltage5S(voltage, cRate);
  const remainingWh = (packWh * soc) / 100;
  
  if (powerW <= 0) return 0;
  return (60 * remainingWh * efficiency) / powerW;
}

/**
 * Получение напряжения для заданного SoC
 * @param soc Процент заряда (0-100)
 * @param cRate Ток нагрузки
 * @returns Напряжение
 */
export function voltageFromSoC5S(soc: number, cRate = 0): number {
  // Обратная интерполяция
  const socMap = SOC_5S_REST;
  
  for (let i = 0; i < socMap.length - 1; i++) {
    const lower = socMap[i];
    const upper = socMap[i + 1];
    
    if (soc >= lower.soc && soc <= upper.soc) {
      const socDiff = upper.soc - lower.soc;
      const voltageDiff = upper.v - lower.v;
      const socRatio = (soc - lower.soc) / socDiff;
      
      const voltage = lower.v + (voltageDiff * socRatio);
      
      // Коррекция под нагрузку
      const k = 0.35;
      return voltage - (k * cRate);
    }
  }
  
  // Если SoC вне диапазона
  return soc > 100 ? socMap[0].v : socMap[socMap.length - 1].v;
}

/**
 * Проверка состояния аккумулятора по напряжению
 * @param voltage Напряжение
 * @param cRate Ток нагрузки
 * @returns Описание состояния
 */
export function getBatteryStatus(voltage: number, cRate = 0): {
  soc: number;
  status: string;
  color: string;
  warning?: string;
} {
  const soc = socFromVoltage5S(voltage, cRate);
  
  let status = '';
  let color = '';
  let warning = '';
  
  if (soc >= 80) {
    status = 'Отличное';
    color = 'green';
  } else if (soc >= 50) {
    status = 'Хорошее';
    color = 'yellow';
  } else if (soc >= 20) {
    status = 'Среднее';
    color = 'orange';
  } else if (soc >= 5) {
    status = 'Низкое';
    color = 'red';
    warning = 'Рекомендуется подзарядка';
  } else {
    status = 'Критическое';
    color = 'red';
    warning = 'Требуется немедленная зарядка';
  }
  
  return { soc, status, color, warning };
}
