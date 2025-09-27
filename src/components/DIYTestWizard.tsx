import React, { useState } from 'react';
import { DIYTestInput, DIYTestResult, estimateFromResistor, validateDIYTestInput, createPackFromTest, exportTestToCSV } from '../lib/diyTest';
import { DIY_TEST_PRESETS } from '../data/socMaps';
import { BatteryPack } from '../data/packs';

interface DIYTestWizardProps {
  onAddPack: (pack: BatteryPack) => void;
}

export function DIYTestWizard({ onAddPack }: DIYTestWizardProps) {
  const [step, setStep] = useState<'preset' | 'input' | 'results'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [testInput, setTestInput] = useState<DIYTestInput>({
    vStart: 21.0,
    vEnd: 15.0,
    minutes: 180,
    resistance: 6.4,
    cutoff: '15.0'
  });
  const [testResults, setTestResults] = useState<DIYTestResult | null>(null);
  const [packName, setPackName] = useState<string>('');

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId !== 'custom') {
      const preset = DIY_TEST_PRESETS.find(p => p.id === presetId);
      if (preset) {
        setTestInput(prev => ({ ...prev, resistance: preset.resistance }));
      }
    }
    setStep('input');
  };

  const handleCalculate = () => {
    const errors = validateDIYTestInput(testInput);
    if (errors.length > 0) {
      alert('Ошибки в данных:\n' + errors.join('\n'));
      return;
    }

    const results = estimateFromResistor(testInput);
    setTestResults(results);
    setStep('results');
  };

  const handleAddPack = () => {
    if (!testResults || !packName.trim()) return;
    
    const newPack = createPackFromTest(testResults, packName.trim());
    onAddPack(newPack);
    alert('Аккумулятор добавлен в список!');
    
    // Сброс формы
    setStep('preset');
    setPackName('');
    setTestResults(null);
  };

  const handleExport = () => {
    if (!testResults || !packName.trim()) return;
    
    const csv = exportTestToCSV(testResults, packName.trim());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `battery_test_${packName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {step === 'preset' && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Выберите тип нагрузки</h3>
          <div className="grid gap-3">
            {DIY_TEST_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors"
              >
                <div className="font-medium text-white">{preset.name}</div>
                <div className="text-sm text-gray-300 mt-1">{preset.description}</div>
                {preset.resistance > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    R ≈ {preset.resistance} Ω
                  </div>
                )}
                {preset.note && (
                  <div className="text-xs text-gray-400 mt-1">{preset.note}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'input' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Параметры теста</h3>
            <button
              onClick={() => setStep('preset')}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Назад
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Начальное напряжение (В)
              </label>
              <input
                type="number"
                value={testInput.vStart}
                onChange={(e) => setTestInput(prev => ({ ...prev, vStart: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="18"
                max="25"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Конечное напряжение (В)
              </label>
              <input
                type="number"
                value={testInput.vEnd}
                onChange={(e) => setTestInput(prev => ({ ...prev, vEnd: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="10"
                max="20"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Время теста (мин)
              </label>
              <input
                type="number"
                value={testInput.minutes}
                onChange={(e) => setTestInput(prev => ({ ...prev, minutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="1"
                max="480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Сопротивление (Ом)
              </label>
              <input
                type="number"
                value={testInput.resistance}
                onChange={(e) => setTestInput(prev => ({ ...prev, resistance: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                min="0.1"
                max="100"
                step="0.1"
                disabled={selectedPreset !== 'custom'}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Порог отсечки
            </label>
            <select
              value={testInput.cutoff}
              onChange={(e) => setTestInput(prev => ({ ...prev, cutoff: e.target.value as '15.0' | '14.5' | '14.0' }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="15.0">15.0 В (безопасно)</option>
              <option value="14.5">14.5 В (средне)</option>
              <option value="14.0">14.0 В (агрессивно)</option>
            </select>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Рассчитать
          </button>
        </div>
      )}

      {step === 'results' && testResults && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Результаты теста</h3>
            <button
              onClick={() => setStep('input')}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Назад
            </button>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {testResults.wh.toFixed(1)} Вт·ч
                </div>
                <div className="text-sm text-gray-400">энергия</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {testResults.ah.toFixed(2)} А·ч
                </div>
                <div className="text-sm text-gray-400">ёмкость</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {testResults.iavg.toFixed(1)} А
                </div>
                <div className="text-sm text-gray-400">средний ток</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {testResults.vavg.toFixed(1)} В
                </div>
                <div className="text-sm text-gray-400">среднее напряжение</div>
              </div>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-gray-700">
              <div className="text-lg font-semibold text-yellow-400">
                ~{Math.round(testResults.runtime)} мин
              </div>
              <div className="text-sm text-gray-400">при 200 Вт</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название аккумулятора
            </label>
            <input
              type="text"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="Например: Мой аккумулятор 5S"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddPack}
              disabled={!packName.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Добавить в список
            </button>
            
            <button
              onClick={handleExport}
              disabled={!packName.trim()}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Скачать CSV
            </button>
          </div>
        </div>
      )}

      {/* Инструкция по безопасности */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="text-sm text-yellow-400 font-medium mb-2">⚠️ Меры безопасности</div>
        <ul className="text-xs text-yellow-300 space-y-1">
          <li>• Не оставляйте тест без присмотра</li>
          <li>• Резисторы могут сильно нагреваться</li>
          <li>• Не разряжайте ниже 15.0 В без необходимости</li>
          <li>• Используйте качественные измерительные приборы</li>
        </ul>
      </div>
    </div>
  );
}
