export interface Tool {
  id: string;
  name: string;
  powerW: number;
}

export const TOOLS: Tool[] = [
  { id: 'drv', name: 'Шуруповёрт', powerW: 100 },
  { id: 'impact', name: 'Импакт (ср.)', powerW: 200 },
  { id: 'sds', name: 'Перфоратор SDS+', powerW: 350 },
  { id: 'grinder', name: 'УШМ 125мм (ср.)', powerW: 450 },
  { id: 'saw165', name: 'Циркулярка 165мм', powerW: 600 },
  { id: 'custom', name: 'Своя мощность', powerW: 0 },
];
