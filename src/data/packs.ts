export interface BatteryPack {
  id: string;
  brand: string;
  name: string;
  system: string;
  wh: number;
  ah: number | null;
  lvc: number;
  price: number;
  note?: string;
  warn?: string;
  est?: boolean; // оценка по паспорту
}

export const PACKS: BatteryPack[] = [
  // UPI / Yupai
  { 
    id: 'yup-8', 
    brand: 'UPI', 
    name: 'YUP 8 Ah', 
    system: '5S', 
    wh: 161.7, 
    ah: 7.71, 
    lvc: 14.0, 
    price: 0, 
    note: 'BD380 CC=~8A' 
  },
  { 
    id: 'yup-6', 
    brand: 'UPI', 
    name: 'YUP 6 Ah', 
    system: '5S', 
    wh: 118.0, 
    ah: 5.71, 
    lvc: 14.0, 
    price: 0, 
    note: 'BD380 CC=~6A' 
  },
  // Конкуренты
  { 
    id: 'cn-4', 
    brand: 'Generic', 
    name: 'Китаец 4 Ah', 
    system: '5S', 
    wh: 82.0, 
    ah: null, 
    lvc: 14.5, 
    price: 4000 
  },
  { 
    id: 'deko-5', 
    brand: 'DEKO', 
    name: 'DEKO 5 Ah', 
    system: '5S', 
    wh: 72.4, 
    ah: 3.50, 
    lvc: 10.5, 
    price: 2500, 
    warn: 'низкий LVC' 
  },
  { 
    id: 'mkt-3', 
    brand: 'Makita', 
    name: 'Makita 3 Ah (тест)', 
    system: '5S', 
    wh: 48.3, 
    ah: 2.39, 
    lvc: 15.0, 
    price: 0, 
    note: 'вероятно б/у' 
  },
  // Шаблоны по паспорту (если нет замера)
  { 
    id: 'mkt-6', 
    brand: 'Makita', 
    name: 'Makita 6 Ah (реф.)', 
    system: '5S', 
    wh: 108.0, 
    ah: 6.0, 
    lvc: 15.0, 
    price: 0, 
    est: true 
  },
];
