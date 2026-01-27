import React from 'react';
import { 
  Activity, 
  Droplets, 
  Cpu, 
  Play, 
  Square, 
  RotateCcw,
  Zap,
  Settings
} from 'lucide-react';
import StatCard from './components/StatCard';
import SystemLog from './components/SystemLog';
import { ConcentrationChart, SaturationChart } from './components/Charts';
import { useIoTSystem } from './hooks/useIoTSystem';

const App: React.FC = () => {
  const { 
    active, 
    toggleSystem, 
    resetSystem, 
    dataHistory, 
    status, 
    logs, 
    currentSaturation,
    CAPACITY_THRESHOLD,
    flowRate,
    setFlowRate
  } = useIoTSystem();

  const latestData = dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : { inletConcentration: 0, outletConcentration: 0 };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-10">
      {/* 头部 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">MOF 智能监测系统</h1>
              <p className="text-xs text-slate-500 font-medium">IoT 重金属吸附监测平台</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  {active ? '系统运行中' : '待机'}
                </span>
             </div>
             <button 
               onClick={toggleSystem}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                 active 
                   ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                   : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
               }`}
             >
               {active ? <><Square size={16} fill="currentColor" /> 停止监测</> : <><Play size={16} fill="currentColor" /> 启动系统</>}
             </button>
             <button 
                onClick={resetSystem}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="重置系统"
             >
               <RotateCcw size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* 顶部统计栏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="入口 Cu²⁺" 
            value={latestData.inletConcentration.toFixed(2)} 
            unit="mg/L" 
            icon={Droplets}
            description="未处理废水流"
          />
          <StatCard 
            title="出口 Cu²⁺" 
            value={latestData.outletConcentration.toFixed(2)} 
            unit="mg/L" 
            icon={Droplets}
            status={latestData.outletConcentration > 25 ? 'warning' : 'normal'}
            description="MOF 处理后"
          />
          <StatCard 
            title="MOF 饱和度" 
            value={(currentSaturation * 100).toFixed(1)} 
            unit="%" 
            icon={Activity}
            status={status === 'CRITICAL' ? 'critical' : status === 'WARNING' ? 'warning' : 'normal'}
            description="模型预测容量"
          />
           <StatCard 
            title="系统状态" 
            value={status === 'CRITICAL' ? '紧急' : status === 'WARNING' ? '警告' : status === 'NORMAL' ? '正常' : '离线'} 
            icon={Zap}
            status={status === 'CRITICAL' ? 'critical' : status === 'WARNING' ? 'warning' : 'normal'}
            description={status === 'CRITICAL' ? '自动切换已触发' : '运行最佳'}
          />
        </div>

        {/* 图表与日志栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 图表列 (大屏占 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <ConcentrationChart data={dataHistory} threshold={0} />
            <SaturationChart data={dataHistory} threshold={CAPACITY_THRESHOLD} />
          </div>

          {/* 日志与调试列 (占 1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
             {/* 调试模块 */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <Settings className="text-indigo-600" size={18} />
                     <h3 className="text-sm font-bold text-slate-800">调试模块: 流量控制</h3>
                  </div>
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 font-semibold">
                    当前: {flowRate} L/min
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">设定流量:</span>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      step="5" 
                      value={flowRate}
                      onChange={(e) => setFlowRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-12 text-right font-mono text-sm font-bold text-slate-700">
                      {flowRate}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                    <span className="font-semibold text-slate-700">说明:</span> 该值模拟流经 MOF 吸附柱的废水流速。增加流量将显著加快饱和速度，可用于快速测试闭环控制逻辑。
                  </p>
                </div>
             </div>

             {/* 日志模块 */}
             <div className="flex-1 min-h-[300px]">
                <SystemLog logs={logs} />
             </div>
          </div>

        </div>

        {/* 底部信息 */}
        <div className="border-t border-slate-200 pt-6 mt-8">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">演示备注</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
                <div className="flex items-start gap-2">
                    <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-xs font-mono font-bold whitespace-nowrap">时间加速</span>
                    <p>为快速演示 40+ 小时的完整吸附周期，时间已加速：<span className="font-semibold text-slate-700">现实 1 秒 ≈ 模拟 1 小时</span>。</p>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">计算模型</span>
                    <p>饱和度基于质量守恒积分法计算 (250mg/g 容量)，而非瞬时浓度比。</p>
                </div>
                <div className="flex items-start gap-2">
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">闭环控制</span>
                    <p>当饱和度达到 90% 时，数字系统将自动触发阀门切换与预警。</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;