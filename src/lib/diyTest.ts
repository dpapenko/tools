export interface DIYTestResult {
  ah: number;
  wh: number;
  iavg: number;
  vavg: number;
  runtime: number; // в минутах
}

export interface DIYTestInput {
  vStart: number;
  vEnd: number;
  minutes: number;
  resistance: number;
  cutoff: '15.0' | '14.5' | '14.0';
}

/**
 * Расчёт характеристик аккумулятора по резисторному тесту
 * @param input Параметры теста
 * @returns Результаты расчёта
 */
export function estimateFromResistor(input: DIYTestInput): DIYTestResult {
  const { vStart, vEnd, minutes, resistance } = input;
  
  // Расчёт токов
  const istart = vStart / resistance;
  const iend = vEnd / resistance;
  const iavg = (istart + iend) / 2;
  
  // Среднее напряжение
  const vavg = (vStart + vEnd) / 2;
  
  // Ёмкость в А·ч
  const ah = iavg * (minutes / 60);
  
  // Энергия в Вт·ч
  const wh = vavg * ah;
  
  // Примерное время работы при средней нагрузке (200 Вт)
  const runtime = (60 * wh * 0.85) / 200;
  
  return {
    ah,
    wh,
    iavg,
    vavg,
    runtime
  };
}

/**
 * Валидация входных данных для DIY теста
 * @param input Параметры теста
 * @returns Ошибки валидации
 */
export function validateDIYTestInput(input: DIYTestInput): string[] {
  const errors: string[] = [];
  
  if (input.vStart <= 0) {
    errors.push('Начальное напряжение должно быть больше 0');
  }
  
  if (input.vEnd <= 0) {
    errors.push('Конечное напряжение должно быть больше 0');
  }
  
  if (input.vStart < input.vEnd) {
    errors.push('Начальное напряжение должно быть больше конечного');
  }
  
  if (input.vEnd < 15.0) {
    errors.push('Не рекомендуется разряжать ниже 15.0 В');
  }
  
  if (input.minutes <= 0) {
    errors.push('Время теста должно быть больше 0');
  }
  
  if (input.minutes > 480) {
    errors.push('Время теста не должно превышать 8 часов');
  }
  
  if (input.resistance <= 0) {
    errors.push('Сопротивление должно быть больше 0');
  }
  
  if (input.resistance < 1) {
    errors.push('Сопротивление менее 1 Ом может быть опасно');
  }
  
  // Проверка на разумные токи
  const maxCurrent = input.vStart / input.resistance;
  if (maxCurrent > 10) {
    errors.push('Ток более 10 А может быть опасен для домашнего теста');
  }
  
  return errors;
}

/**
 * Рекомендации по выбору нагрузки для DIY теста
 * @param expectedWh Ожидаемая энергия аккумулятора
 * @returns Рекомендации
 */
export function recommendLoadForTest(expectedWh: number): {
  resistance: number;
  description: string;
  runtime: number;
} {
  // Целевое время теста: 2-4 часа
  const targetHours = 3;
  const targetMinutes = targetHours * 60;
  
  // Среднее напряжение 5S: ~19 В
  const avgVoltage = 19.0;
  
  // Целевой ток для разряда за 3 часа
  const targetCurrent = expectedWh / (avgVoltage * targetHours);
  
  // Рекомендуемое сопротивление
  const resistance = avgVoltage / targetCurrent;
  
  return {
    resistance: Math.round(resistance * 10) / 10,
    description: `Для теста за ~${targetHours} часа`,
    runtime: targetMinutes
  };
}

/**
 * Экспорт результатов теста в CSV
 * @param results Результаты теста
 * @param packName Название аккумулятора
 * @returns CSV строка
 */
export function exportTestToCSV(results: DIYTestResult, packName: string): string {
  const headers = [
    'Название',
    'Ah',
    'Wh',
    'Средний ток (A)',
    'Среднее напряжение (V)',
    'Время при 200 Вт (мин)',
    'Дата теста'
  ];
  
  const data = [
    packName,
    results.ah.toFixed(2),
    results.wh.toFixed(1),
    results.iavg.toFixed(2),
    results.vavg.toFixed(2),
    Math.round(results.runtime).toString(),
    new Date().toLocaleDateString('ru-RU')
  ];
  
  return [headers.join(','), data.join(',')].join('\n');
}

/**
 * Создание нового аккумулятора на основе DIY теста
 * @param results Результаты теста
 * @param packName Название аккумулятора
 * @param price Цена (опционально)
 * @returns Объект аккумулятора
 */
export function createPackFromTest(
  results: DIYTestResult,
  packName: string,
  price = 0
) {
  // Оценка Ah на основе результатов (округление до разумного значения)
  const estimatedAh = Math.round(results.ah * 10) / 10;
  
  return {
    id: `diy-${Date.now()}`,
    brand: 'DIY',
    name: packName,
    system: '5S',
    wh: Math.round(results.wh * 10) / 10,
    ah: estimatedAh,
    lvc: 15.0, // Безопасный LVC по умолчанию
    price,
    note: `DIY тест: ${results.iavg.toFixed(1)}A средний, ${results.vavg.toFixed(1)}V среднее`
  };
}
