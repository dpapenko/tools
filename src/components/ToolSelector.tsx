import { Tool } from '../data/tools';

interface ToolSelectorProps {
  tools: Tool[];
  selectedTool: Tool | null;
  onSelect: (tool: Tool) => void;
  customPower: number;
  onCustomPowerChange: (power: number) => void;
}

export function ToolSelector({ 
  tools, 
  selectedTool, 
  onSelect, 
  customPower, 
  onCustomPowerChange 
}: ToolSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Выберите инструмент
      </label>
      <div className="grid gap-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelect(tool)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedTool?.id === tool.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">{tool.name}</span>
              <span className="text-sm text-gray-400">
                {tool.powerW > 0 ? `${tool.powerW} Вт` : 'настраиваемая'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {selectedTool?.id === 'custom' && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Мощность инструмента (Вт)
          </label>
          <input
            type="number"
            value={customPower}
            onChange={(e) => onCustomPowerChange(Number(e.target.value))}
            placeholder="Введите мощность в ваттах"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            min="1"
            max="2000"
          />
          <div className="text-xs text-gray-400 mt-1">
            Обычно мощность указана на инструменте или в инструкции
          </div>
        </div>
      )}
    </div>
  );
}

