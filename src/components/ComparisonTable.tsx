import { BatteryPack } from '../data/packs';
import { Tool } from '../data/tools';
import { runtimeMinutes, formatMinutes, pricePerWh } from '../lib/runtime';

interface ComparisonTableProps {
  packs: BatteryPack[];
  tools: Tool[];
  efficiency: number;
}

export function ComparisonTable({ packs, tools, efficiency }: ComparisonTableProps) {
  const filteredPacks = packs.filter(p => p.price > 0 || p.est); // Только с ценой или оценкой
  const filteredTools = tools.filter(t => t.powerW > 0); // Только с мощностью

  if (filteredPacks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Нет аккумуляторов для сравнения (требуется цена или оценка)
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">Сравнение аккумуляторов</h3>
        <div className="text-sm text-gray-400">Время работы и стоимость</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left text-gray-300">Аккумулятор</th>
              <th className="p-3 text-center text-gray-300">Вт·ч</th>
              <th className="p-3 text-center text-gray-300">₽/Вт·ч</th>
              {filteredTools.map(tool => (
                <th key={tool.id} className="p-3 text-center text-gray-300">
                  {tool.name}<br />
                  <span className="text-xs text-gray-400">{tool.powerW} Вт</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPacks.map((pack) => {
              const runtimeData = filteredTools.map(tool => ({
                tool: tool.name,
                runtime: runtimeMinutes(pack.wh, tool.powerW, efficiency)
              }));

              return (
                <tr key={pack.id} className="border-t border-gray-700">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{pack.name}</span>
                      <span className="text-xs text-gray-400">({pack.brand})</span>
                      {pack.est && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                          оценка
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      LVC: {pack.lvc}В {pack.ah && `• ${pack.ah} А·ч`}
                    </div>
                  </td>
                  
                  <td className="p-3 text-center">
                    <span className="text-white">{pack.wh}</span>
                  </td>
                  
                  <td className="p-3 text-center">
                    {pack.price > 0 ? (
                      <span className="text-white">{pricePerWh(pack.price, pack.wh).toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  
                  {runtimeData.map((data, index) => (
                    <td key={index} className="p-3 text-center">
                      <span className="text-blue-400">
                        {formatMinutes(data.runtime)}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Сводка по ценам */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Сравнение по стоимости</h4>
        <div className="space-y-2">
          {filteredPacks
            .filter(p => p.price > 0)
            .sort((a, b) => pricePerWh(a.price, a.wh) - pricePerWh(b.price, b.wh))
            .map((pack) => (
              <div key={pack.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{pack.name}</span>
                <div className="text-right">
                  <span className="text-sm text-white">
                    {pricePerWh(pack.price, pack.wh).toFixed(1)} ₽/Вт·ч
                  </span>
                  <div className="text-xs text-gray-400">
                    {pack.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Рекомендации */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 Рекомендации</h4>
        <div className="text-sm text-blue-300 space-y-1">
          <div>• UPI аккумуляторы показывают реальную энергию по тестам BD380</div>
          <div>• Более низкий LVC даёт больше времени работы</div>
          <div>• Учитывайте вес и эргономику при выборе</div>
        </div>
      </div>
    </div>
  );
}

