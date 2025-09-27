export interface SocPoint {
  v: number;
  soc: number;
}

// SoC по напряжению для 5S Li-ion (покой)
export const SOC_5S_REST: SocPoint[] = [
  { v: 21.0, soc: 100 },
  { v: 20.6, soc: 85 },
  { v: 20.2, soc: 70 },
  { v: 19.8, soc: 55 },
  { v: 19.4, soc: 40 },
  { v: 19.0, soc: 30 },
  { v: 18.6, soc: 20 },
  { v: 18.2, soc: 10 },
  { v: 15.0, soc: 0 },
];

// Пресеты для домашнего теста
export const DIY_TEST_PRESETS = [
  {
    id: 'lamps-h7',
    name: '2 лампы H7 55 Вт последовательно',
    description: 'R ≈ 6.4 Ω при прогреве (приближение)',
    resistance: 6.4,
    note: 'Резистор зависит от температуры нити'
  },
  {
    id: 'resistor-10',
    name: 'Резистор 10 Ом',
    description: 'Точное сопротивление',
    resistance: 10.0,
    note: 'Постоянное сопротивление'
  },
  {
    id: 'resistor-5',
    name: 'Резистор 5 Ом',
    description: 'Большая нагрузка',
    resistance: 5.0,
    note: 'Быстрый разряд'
  },
  {
    id: 'custom',
    name: 'Свой резистор',
    description: 'Введите сопротивление вручную',
    resistance: 0,
    note: 'Настраиваемый'
  }
];

