import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  Cpu, 
  Play, 
  Square, 
  RotateCcw,
  Zap,
  Settings,
  Wrench,
  AlertTriangle
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
    confirmMaintenance,
    dataHistory, 
    status, 
    logs, 
    currentSaturation,
    CAPACITY_THRESHOLD,
    flowRate,
    setFlowRate
  } = useIoTSystem();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // 使用本地状态管理输入框的值，以支持小数点输入和格式化
  const [localFlowRate, setLocalFlowRate] = useState(flowRate.toString());

  // 当外部 flowRate 发生变化（如重置）时，同步到本地状态
  useEffect(() => {
    // 只有当数值不相等时才更新，避免在用户输入（如 "20."）时强制覆盖
    if (Number(localFlowRate) !== flowRate) {
      setLocalFlowRate(flowRate.toString());
    }
  }, [flowRate, localFlowRate]);

  const latestData = dataHistory.length > 0 ? dataHistory[dataHistory.length - 1] : { inletConcentration: 0, outletConcentration: 0 };

  const handleMaintenance = () => {
    if (status !== 'CRITICAL') {
      setShowConfirmModal(true);
    } else {
      confirmMaintenance();
    }
  };

  const executeMaintenance = () => {
    confirmMaintenance();
    setShowConfirmModal(false);
  };

  const handleFlowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (val === '') {
      setLocalFlowRate('');
      setFlowRate(0);
      return;
    }

    // 限制只能输入数字和一个小数点，且最多两位小数
    if (!/^\d*\.?\d{0,2}$/.test(val)) {
      return;
    }

    // 处理前导零：025 -> 25
    // 如果长度大于1，且以0开头，且第二个字符不是小数点，则去除前导0
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
      if (val === '') val = '0';
    }

    setLocalFlowRate(val);
    setFlowRate(Number(val));
  };

  const handleFlowBlur = () => {
    // 失去焦点时，如果为空则显示0
    if (localFlowRate === '') {
      setLocalFlowRate('0');
    }
    // 失去焦点时，如果末尾是小数点，自动清除
    else if (localFlowRate.endsWith('.')) {
      setLocalFlowRate(localFlowRate.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-10 relative">
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
             {/* 人工维护按钮 - 始终显示 */}
             <button
               onClick={handleMaintenance}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-colors border ${
                 status === 'CRITICAL'
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
               }`}
               title={status === 'CRITICAL' ? "需要立即更换" : "人工手动维护"}
             >
               <Wrench size={16} />
               <span className="hidden md:inline">
                 {status === 'CRITICAL' ? '确认更换滤芯' : '更换滤芯'}
               </span>
             </button>

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
            value={status === 'CRITICAL' ? '维护中' : status === 'WARNING' ? '警告' : status === 'NORMAL' ? '正常' : '离线'} 
            icon={Zap}
            status={status === 'CRITICAL' ? 'critical' : status === 'WARNING' ? 'warning' : 'normal'}
            description={status === 'CRITICAL' ? '等待人工确认' : '运行最佳'}
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
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">设定流量:</span>
                    <div className="relative w-full">
                        <input 
                          type="number" 
                          min="1" 
                          max="500" 
                          step="0.01"
                          value={localFlowRate}
                          onChange={handleFlowChange}
                          onBlur={handleFlowBlur}
                          className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 pr-12 transition-colors"
                          placeholder="输入流量"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-slate-500 text-xs font-mono">L/min</span>
                        </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                    <span className="font-semibold text-slate-700">说明:</span> 该值模拟流经 MOF 吸附柱的废水流速。增加流量将显著加快饱和速度。
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
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">人工干预</span>
                    <p>当饱和度达到 90% 时，数字系统将发出预警，需<span className="font-semibold text-slate-700">人工确认更换</span>吸附柱。</p>
                </div>
            </div>
        </div>

        {/* 维护确认弹窗 */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 transform transition-all scale-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                  <AlertTriangle size={24} /> 
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">确认提前更换滤芯？</h3>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                    当前 MOF 吸附柱尚未达到饱和预警值 (90%)。提前更换可能会造成资源浪费，是否确认执行？
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={executeMaintenance}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  确认更换
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;