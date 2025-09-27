import { BatteryPack } from '../data/packs';
import { pricePerWh } from '../lib/runtime';

interface PricePerWhProps {
  packs: BatteryPack[];
}

export function PricePerWh({ packs }: PricePerWhProps) {
  const packsWithPrice = packs.filter(p => p.price > 0);
  
  if (packsWithPrice.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Нет аккумуляторов с указанной ценой
      </div>
    );
  }

  const sortedPacks = [...packsWithPrice].sort((a, b) => 
    pricePerWh(a.price, a.wh) - pricePerWh(b.price, b.wh)
  );

  const cheapest = sortedPacks[0];
  const mostExpensive = sortedPacks[sortedPacks.length - 1];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">Стоимость за Вт·ч</h3>
        <div className="text-sm text-gray-400">Сравнение цены за единицу энергии</div>
      </div>

      {/* Лучшие предложения */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="text-sm text-green-400 font-medium mb-1">🏆 Лучшая цена</div>
          <div className="font-semibold text-white">{cheapest.name}</div>
          <div className="text-lg font-bold text-green-400">
            {pricePerWh(cheapest.price, cheapest.wh).toFixed(1)} ₽/Вт·ч
          </div>
          <div className="text-xs text-gray-400">
            {cheapest.price.toLocaleString('ru-RU')} ₽ за {cheapest.wh} Вт·ч
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="text-sm text-red-400 font-medium mb-1">💰 Дороже всего</div>
          <div className="font-semibold text-white">{mostExpensive.name}</div>
          <div className="text-lg font-bold text-red-400">
            {pricePerWh(mostExpensive.price, mostExpensive.wh).toFixed(1)} ₽/Вт·ч
          </div>
          <div className="text-xs text-gray-400">
            {mostExpensive.price.toLocaleString('ru-RU')} ₽ за {mostExpensive.wh} Вт·ч
          </div>
        </div>
      </div>

      {/* Полный список */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Все аккумуляторы</h4>
        <div className="space-y-3">
          {sortedPacks.map((pack, index) => {
            const pricePerWhValue = pricePerWh(pack.price, pack.wh);
            const savings = pack === cheapest ? 0 : 
              ((pricePerWhValue - pricePerWh(cheapest.price, cheapest.wh)) / pricePerWh(cheapest.price, cheapest.wh)) * 100;
            
            return (
              <div key={pack.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-white">{pack.name}</div>
                    <div className="text-sm text-gray-400">{pack.brand} • {pack.wh} Вт·ч</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {pricePerWhValue.toFixed(1)} ₽/Вт·ч
                  </div>
                  <div className="text-sm text-gray-400">
                    {pack.price.toLocaleString('ru-RU')} ₽
                  </div>
                  {savings > 0 && (
                    <div className="text-xs text-red-400">
                      +{savings.toFixed(0)}% дороже
                    </div>
                  )}
                  {pack === cheapest && (
                    <div className="text-xs text-green-400">
                      лучшее предложение
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Окупаемость UPI */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 Окупаемость UPI</h4>
        <div className="text-sm text-blue-300 space-y-2">
          {(() => {
            const upiPacks = packs.filter(p => p.brand === 'UPI' && p.price > 0);
            const cheapestCompetitor = sortedPacks.find(p => p.brand !== 'UPI');
            
            if (upiPacks.length > 0 && cheapestCompetitor) {
              const upiPack = upiPacks[0];
              const upiPricePerWh = pricePerWh(upiPack.price, upiPack.wh);
              const competitorPricePerWh = pricePerWh(cheapestCompetitor.price, cheapestCompetitor.wh);
              const savings = competitorPricePerWh - upiPricePerWh;
              
              return (
                <div>
                  <div>UPI {upiPack.name}: {upiPricePerWh.toFixed(1)} ₽/Вт·ч</div>
                  <div>vs {cheapestCompetitor.name}: {competitorPricePerWh.toFixed(1)} ₽/Вт·ч</div>
                  <div className="font-medium">
                    Экономия: {savings.toFixed(1)} ₽/Вт·ч ({((savings/competitorPricePerWh)*100).toFixed(0)}%)
                  </div>
                </div>
              );
            }
            
            return <div>Сравните цены UPI с конкурентами выше</div>;
          })()}
        </div>
      </div>
    </div>
  );
}

