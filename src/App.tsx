import React, { useState } from 'react';
import { BatteryPack } from './data/packs';
import { Tool } from './data/tools';
import { PACKS } from './data/packs';
import { TOOLS } from './data/tools';
import { PackSelector } from './components/PackSelector';
import { ToolSelector } from './components/ToolSelector';
import { RuntimeCard } from './components/RuntimeCard';
import { VoltageCheck } from './components/VoltageCheck';
import { DIYTestWizard } from './components/DIYTestWizard';
import { ComparisonTable } from './components/ComparisonTable';
import { PricePerWh } from './components/PricePerWh';

type Tab = 'runtime' | 'voltage' | 'diy' | 'comparison';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('runtime');
  const [packs, setPacks] = useState<BatteryPack[]>(PACKS);
  const [selectedPack, setSelectedPack] = useState<BatteryPack | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [customPower, setCustomPower] = useState<number>(100);
  const [efficiency, setEfficiency] = useState<number>(0.85);
  const [targetLVC, setTargetLVC] = useState<number | undefined>(undefined);

  const handleAddPack = (newPack: BatteryPack) => {
    setPacks(prev => [...prev, newPack]);
  };

  const getCurrentTool = (): { powerW: number } => {
    if (selectedTool?.id === 'custom') {
      return { powerW: customPower };
    }
    return selectedTool || { powerW: 0 };
  };

  const tabs = [
    { id: 'runtime' as Tab, label: 'Расчёт времени', icon: '⏱️' },
    { id: 'voltage' as Tab, label: 'Проверка аккумулятора', icon: '🔋' },
    { id: 'diy' as Tab, label: 'Домашний тест', icon: '🔬' },
    { id: 'comparison' as Tab, label: 'Сравнение', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Калькулятор аккумуляторов LXT
            </h1>
            <p className="text-gray-400">
              Реальные данные из тестов BD380 • UPI vs Makita vs конкуренты
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'runtime' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Расчёт времени работы инструмента
              </h2>
              <p className="text-gray-400">
                Выберите аккумулятор и инструмент для расчёта автономности
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Выбор аккумулятора */}
              <div>
                <PackSelector
                  packs={packs}
                  selectedPack={selectedPack}
                  onSelect={setSelectedPack}
                  showPrice={true}
                />
              </div>

              {/* Выбор инструмента */}
              <div>
                <ToolSelector
                  tools={TOOLS}
                  selectedTool={selectedTool}
                  onSelect={setSelectedTool}
                  customPower={customPower}
                  onCustomPowerChange={setCustomPower}
                />
              </div>
            </div>

            {/* Настройки */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-white mb-4">Настройки расчёта</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    КПД системы
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="0.95"
                    step="0.05"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-400 text-center">
                    {(efficiency * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LVC (порог отсечки)
                  </label>
                  <select
                    value={targetLVC || ''}
                    onChange={(e) => setTargetLVC(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">По умолчанию</option>
                    <option value="15.0">15.0 В (безопасно)</option>
                    <option value="14.5">14.5 В (средне)</option>
                    <option value="14.0">14.0 В (агрессивно)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setEfficiency(0.85);
                      setTargetLVC(undefined);
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </div>

            {/* Результаты */}
            {selectedPack && getCurrentTool().powerW > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Результат</h3>
                <RuntimeCard
                  pack={selectedPack}
                  tool={getCurrentTool()}
                  efficiency={efficiency}
                  targetLVC={targetLVC}
                />
              </div>
            )}

            {/* Быстрые сценарии */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-400 mb-3">🚀 Быстрые сценарии</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setSelectedTool(TOOLS.find(t => t.id === 'grinder') || null);
                    setSelectedPack(packs.find(p => p.id === 'yup-6') || null);
                  }}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white">УШМ 125мм</div>
                  <div className="text-xs text-gray-400">YUP 6 Ah</div>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedTool(TOOLS.find(t => t.id === 'saw165') || null);
                    setSelectedPack(packs.find(p => p.id === 'yup-8') || null);
                  }}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white">Циркулярка 165</div>
                  <div className="text-xs text-gray-400">YUP 8 Ah</div>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedTool(TOOLS.find(t => t.id === 'sds') || null);
                    setSelectedPack(packs.find(p => p.id === 'mkt-6') || null);
                  }}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white">Перфоратор SDS+</div>
                  <div className="text-xs text-gray-400">Makita 6 Ah</div>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedTool(TOOLS.find(t => t.id === 'impact') || null);
                    setSelectedPack(packs.find(p => p.id === 'yup-6') || null);
                  }}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white">Импакт</div>
                  <div className="text-xs text-gray-400">YUP 6 Ah</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voltage' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Проверка аккумулятора по напряжению
              </h2>
              <p className="text-gray-400">
                Оценка заряда и оставшегося времени работы
              </p>
            </div>

            <VoltageCheck
              packs={packs}
              selectedPack={selectedPack}
              onSelectPack={setSelectedPack}
              selectedTool={selectedTool}
            />
          </div>
        )}

        {activeTab === 'diy' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Домашний тест аккумулятора
              </h2>
              <p className="text-gray-400">
                Определение реальной ёмкости без BD380
              </p>
            </div>

            <DIYTestWizard onAddPack={handleAddPack} />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Сравнение аккумуляторов
              </h2>
              <p className="text-gray-400">
                Время работы, стоимость и рекомендации
              </p>
            </div>

            <PricePerWh packs={packs} />
            
            <ComparisonTable
              packs={packs}
              tools={TOOLS}
              efficiency={efficiency}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>Калькулятор основан на реальных тестах BD380</p>
            <p className="mt-1">
              Данные UPI/YUP получены при разряде до 15.0 В • 
              Формулы учитывают КПД системы и поправки по LVC
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
