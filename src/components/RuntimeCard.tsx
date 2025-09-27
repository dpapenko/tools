import { BatteryPack } from '../data/packs';
import { runtimeMinutes, formatMinutes, getEffectiveWh } from '../lib/runtime';

interface RuntimeCardProps {
  pack: BatteryPack;
  tool: { powerW: number };
  efficiency: number;
  targetLVC?: number;
  showComparison?: boolean;
  basePack?: BatteryPack;
}

export function RuntimeCard({ 
  pack, 
  tool, 
  efficiency, 
  targetLVC,
  showComparison = false,
  basePack
}: RuntimeCardProps) {
  const effectiveWh = getEffectiveWh(pack, targetLVC);
  const runtime = runtimeMinutes(effectiveWh, tool.powerW, efficiency);
  
  const comparison = showComparison && basePack ? {
    baseRuntime: runtimeMinutes(getEffectiveWh(basePack, targetLVC), tool.powerW, efficiency),
    whDiff: effectiveWh - getEffectiveWh(basePack, targetLVC),
    runtimeDiff: runtime - runtimeMinutes(getEffectiveWh(basePack, targetLVC), tool.powerW, efficiency)
  } : null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-white">{pack.name}</h3>
          <div className="text-sm text-gray-400">
            {effectiveWh} Вт·ч • {pack.brand}
          </div>
        </div>
        {targetLVC && targetLVC !== pack.lvc && (
          <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            LVC: {targetLVC}В
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {formatMinutes(runtime)}
          </div>
          <div className="text-xs text-gray-400">время работы</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            {tool.powerW} Вт
          </div>
          <div className="text-xs text-gray-400">мощность</div>
        </div>
      </div>
      
      {showComparison && comparison && (
        <div className="border-t border-gray-700 pt-3">
          <div className="text-sm text-gray-300 mb-2">
            Сравнение с {basePack?.name}:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Энергия:</span>
              <span className={comparison.whDiff > 0 ? 'text-green-400' : 'text-red-400'}>
                {comparison.whDiff > 0 ? '+' : ''}{comparison.whDiff.toFixed(1)} Вт·ч
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Время:</span>
              <span className={comparison.runtimeDiff > 0 ? 'text-green-400' : 'text-red-400'}>
                {comparison.runtimeDiff > 0 ? '+' : ''}{formatMinutes(comparison.runtimeDiff)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2">
        КПД: {(efficiency * 100).toFixed(0)}% • 
        {targetLVC ? `до ${targetLVC}В` : `до ${pack.lvc}В`}
      </div>
    </div>
  );
}

