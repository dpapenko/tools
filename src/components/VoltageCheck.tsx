import React, { useState } from 'react';
import { BatteryPack } from '../data/packs';
import { socFromVoltage5S, estimateRemainingTime, getBatteryStatus } from '../lib/voltage';
import { getEffectiveWh } from '../lib/runtime';

interface VoltageCheckProps {
  packs: BatteryPack[];
  selectedPack: BatteryPack | null;
  onSelectPack: (pack: BatteryPack) => void;
  selectedTool: { powerW: number } | null;
}

export function VoltageCheck({ packs, selectedPack, onSelectPack, selectedTool }: VoltageCheckProps) {
  const [voltage, setVoltage] = useState<number>(20.0);
  const [loadCurrent, setLoadCurrent] = useState<number>(0);

  if (!selectedPack) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">Выберите аккумулятор для проверки</div>
        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {packs.map((pack) => (
            <div
              key={pack.id}
              onClick={() => onSelectPack(pack)}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded cursor-pointer hover:border-gray-600"
            >
              <div className="text-sm text-white">{pack.name}</div>
              <div className="text-xs text-gray-400">{pack.wh} Вт·ч</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cRate = loadCurrent;
  const soc = socFromVoltage5S(voltage, cRate);
  const status = getBatteryStatus(voltage, cRate);
  
  const effectiveWh = getEffectiveWh(selectedPack);
  const remainingTime = selectedTool 
    ? estimateRemainingTime(voltage, cRate, effectiveWh, selectedTool.powerW)
    : 0;

  const statusColors = {
    green: 'text-green-400',
    yellow: 'text-yellow-400', 
    orange: 'text-orange-400',
    red: 'text-red-400'
  };

  return (
    <div className="space-y-4">
      {/* Выбранный аккумулятор */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <div className="text-sm font-medium text-white">{selectedPack.name}</div>
        <div className="text-xs text-gray-400">{selectedPack.wh} Вт·ч • {selectedPack.brand}</div>
      </div>

      {/* Параметры измерения */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Напряжение (В)
          </label>
          <input
            type="number"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            min="10"
            max="25"
            step="0.1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ток нагрузки (C)
          </label>
          <input
            type="number"
            value={loadCurrent}
            onChange={(e) => setLoadCurrent(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            min="0"
            max="3"
            step="0.1"
          />
          <div className="text-xs text-gray-400 mt-1">
            0 = покой, 1 = 1C, 2 = 2C
          </div>
        </div>
      </div>

      {/* Результаты */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${statusColors[status.color as keyof typeof statusColors]}`}>
              {soc.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">заряд</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {status.status}
            </div>
            <div className="text-sm text-gray-400">состояние</div>
          </div>
        </div>

        {status.warning && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-400">⚠️ {status.warning}</div>
          </div>
        )}

        {selectedTool && remainingTime > 0 && (
          <div className="border-t border-gray-700 pt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">
                {Math.round(remainingTime)} мин
              </div>
              <div className="text-sm text-gray-400">
                осталось при {selectedTool.powerW} Вт
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-3 text-center">
          Измерено при {loadCurrent === 0 ? 'покое' : `${loadCurrent}C`} • 
          Поправка: {loadCurrent > 0 ? `+${(0.35 * loadCurrent).toFixed(2)}В` : 'без нагрузки'}
        </div>
      </div>

      {/* Шкала SoC */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3">
        <div className="text-sm text-gray-300 mb-2">Шкала заряда (5S Li-ion)</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-green-400">100% - 21.0В</span>
            <span className="text-green-400">Отличное</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-400">70% - 20.2В</span>
            <span className="text-yellow-400">Хорошее</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-400">40% - 19.4В</span>
            <span className="text-orange-400">Среднее</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">20% - 19.0В</span>
            <span className="text-red-400">Низкое</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">0% - 15.0В</span>
            <span className="text-red-400">Разряжен</span>
          </div>
        </div>
      </div>
    </div>
  );
}
