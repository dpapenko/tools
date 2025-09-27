import { BatteryPack } from '../data/packs';

interface PackSelectorProps {
  packs: BatteryPack[];
  selectedPack: BatteryPack | null;
  onSelect: (pack: BatteryPack) => void;
  showPrice?: boolean;
}

export function PackSelector({ packs, selectedPack, onSelect, showPrice = true }: PackSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Выберите аккумулятор
      </label>
      <div className="grid gap-2 max-h-60 overflow-y-auto">
        {packs.map((pack) => (
          <div
            key={pack.id}
            onClick={() => onSelect(pack)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedPack?.id === pack.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{pack.name}</span>
                  <span className="text-xs text-gray-400">({pack.brand})</span>
                  {pack.est && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      оценка
                    </span>
                  )}
                  {pack.warn && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {pack.warn}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {pack.wh} Вт·ч
                  {pack.ah && ` • ${pack.ah} А·ч`}
                  {` • LVC: ${pack.lvc} В`}
                </div>
                {pack.note && (
                  <div className="text-xs text-gray-400 mt-1">{pack.note}</div>
                )}
              </div>
              {showPrice && pack.price > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {pack.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-xs text-gray-400">
                    {(pack.price / pack.wh).toFixed(1)} ₽/Вт·ч
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

