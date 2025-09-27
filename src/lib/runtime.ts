import { BatteryPack } from '../data/packs';

/**
 * Время работы инструмента от аккумулятора в минутах
 * @param wh Энергия аккумулятора в Вт·ч
 * @param powerW Мощность инструмента в Вт
 * @param loss Коэффициент потерь (по умолчанию 0.85)
 * @returns Время работы в минутах
 */
export function runtimeMinutes(wh: number, powerW: number, loss = 0.85): number {
  if (powerW <= 0) return 0;
  return (60 * wh * loss) / powerW;
}

/**
 * Цена за Вт·ч
 * @param price Цена аккумулятора в рублях
 * @param wh Энергия аккумулятора в Вт·ч
 * @returns Цена за Вт·ч
 */
export function pricePerWh(price: number, wh: number): number {
  if (wh <= 0) return 0;
  return price / wh;
}

/**
 * Корректировка Wh при изменении LVC
 * @param wh Исходная энергия до 15.0 В
 * @param lvc Новый порог отсечки
 * @returns Корректированная энергия
 */
export function adjustWhForLVC(wh: number, lvc: number): number {
  if (lvc >= 15.0) return wh;
  
  // Упрощённые поправки
  if (lvc <= 14.0) return wh * 1.10; // +10% для 14.0 В
  if (lvc <= 14.5) return wh * 1.06; // +6% для 14.5 В
  
  return wh;
}

/**
 * Форматирование времени в минутах
 * @param minutes Время в минутах
 * @returns Отформатированная строка
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} сек`;
  }
  
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  
  if (secs === 0) {
    return `${mins} мин`;
  }
  
  return `${mins} мин ${secs} сек`;
}

/**
 * Получение эффективной энергии с учётом LVC
 * @param pack Аккумулятор
 * @param targetLVC Целевой LVC (если отличается от pack.lvc)
 * @returns Эффективная энергия в Вт·ч
 */
export function getEffectiveWh(pack: BatteryPack, targetLVC?: number): number {
  const baseWh = pack.wh;
  const lvc = targetLVC ?? pack.lvc;
  return adjustWhForLVC(baseWh, lvc);
}

/**
 * Рекомендация по количеству аккумуляторов для бригады
 * @param tools Инструменты и время работы каждого
 * @param packs Доступные аккумуляторы
 * @param efficiency Коэффициент эффективности
 * @returns Рекомендации
 */
export function recommendPacksForCrew(
  tools: Array<{ powerW: number; hoursPerDay: number }>,
  packs: BatteryPack[],
  efficiency = 0.85
) {
  const totalWhPerDay = tools.reduce((sum, tool) => {
    return sum + (tool.powerW * tool.hoursPerDay);
  }, 0);

  return packs.map(pack => {
    const effectiveWh = getEffectiveWh(pack);
    const runtimePerPack = (effectiveWh * efficiency) / 1000; // кВт·ч
    const packsNeeded = Math.ceil(totalWhPerDay / (runtimePerPack * 1000));
    
    return {
      pack,
      runtimePerPack,
      packsNeeded,
      totalCost: packsNeeded * pack.price
    };
  }).sort((a, b) => a.totalCost - b.totalCost);
}
