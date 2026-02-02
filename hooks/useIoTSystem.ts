import { useState, useEffect, useRef, useCallback } from 'react';
import { SensorData, SystemStatus, LogEntry } from '../types';

// PDF 数据: Cu2+吸附容量 >= 250 mg/g
const MOF_CAPACITY_PER_GRAM = 250; 
// 模拟设定: 10kg 的 MOF 滤芯
const MOF_TOTAL_MASS_G = 10000; 
// 计算总容量 (mg) = 10000g * 250mg/g = 2,500,000 mg
const MAX_LOAD_MG = MOF_TOTAL_MASS_G * MOF_CAPACITY_PER_GRAM;

// 默认流量: 20 L/min (假设中试规模)
const DEFAULT_FLOW_RATE = 20; 
// 模拟加速因子: 为了演示，大幅加快时间流逝
// 之前是 60 (1秒=1分钟)，现在调整为 3600 (1秒=1小时)
// 容量 2500min (约41小时) 将在约 40秒内跑完
const TIME_ACCELERATION = 3600; 

const CAPACITY_THRESHOLD = 0.90; // 90% 阈值

const MAX_HISTORY = 20;

export const useIoTSystem = () => {
  const [active, setActive] = useState(false);
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [status, setStatus] = useState<SystemStatus>('OFFLINE');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentSaturation, setCurrentSaturation] = useState(0);
  const [flowRate, setFlowRate] = useState(DEFAULT_FLOW_RATE);

  // 模拟状态引用
  const simulationState = useRef({
    accumulatedLoadMg: 0.0, // 已吸附的总质量 (mg)
    steps: 0
  });

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'INFO') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    const id = Math.random().toString(36).substring(7);
    
    setLogs(prev => [...prev.slice(-100), { id, timestamp: timeString, message, type }]); 
  }, []);

  const resetSystem = () => {
    simulationState.current = { accumulatedLoadMg: 0.0, steps: 0 };
    setDataHistory([]);
    setCurrentSaturation(0);
    setStatus('NORMAL');
    setFlowRate(DEFAULT_FLOW_RATE);
    addLog("系统重置启动。MOF 柱体再生完成。", 'ACTION');
    addLog(`参数校准: 最大吸附容量 ${MAX_LOAD_MG/1000} g (基于 250mg/g 标准)`, 'INFO');
    addLog("阀门已切换至主吸附柱 A。", 'INFO');
  };

  const confirmMaintenance = useCallback(() => {
    simulationState.current.accumulatedLoadMg = 0.0;
    setCurrentSaturation(0);
    setStatus('NORMAL');
    addLog("人工确认：滤芯更换完成。系统恢复正常运行。", 'ACTION');
  }, [addLog]);

  const toggleSystem = () => {
    if (!active) {
      setStatus('NORMAL');
      addLog("物联网系统启动。正在连接监测探头...", 'ACTION');
      addLog("传感器在线：电镀车间 1号排水口", 'INFO');
    } else {
      setStatus('OFFLINE');
      addLog("收到系统停止指令。正在关闭...", 'ACTION');
    }
    setActive(!active);
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (active) {
      intervalId = setInterval(() => {
        // 1. 模拟入口浓度 (波动在 50 mg/L 左右)
        const inlet = 50.0 + (Math.random() * 4 - 2);
        
        // 2. 计算当前饱和度 (基于质量守恒)
        // Saturation = Total Adsorbed / Max Capacity
        let saturation = simulationState.current.accumulatedLoadMg / MAX_LOAD_MG;
        if (saturation > 1.0) saturation = 1.0;

        // 3. 模拟出口浓度 (基于穿透曲线模型)
        // 当饱和度 < 80% 时，MOF 效率极高，出口浓度极低 (e.g., < 0.1 mg/L)
        // 当饱和度 > 80% 时，开始穿透，出口浓度指数上升
        // 使用简化的 Sigmoid 曲线模拟穿透
        let efficiency = 1.0;
        if (saturation < 0.8) {
            efficiency = 0.998 + (Math.random() * 0.001); // >99.8% 去除率
        } else {
            // 饱和度 0.8 -> 1.0 期间，效率急剧下降
            // 归一化这一段区间 (0 到 1)
            const p = (saturation - 0.8) / 0.2; 
            // 效率从 0.99 降到 0.0 (完全穿透)
            efficiency = 0.99 * (1 - Math.pow(p, 3)); // 三次幂曲线模拟快速穿透
        }
        
        let outlet = inlet * (1 - efficiency);
        // 确保非负且有底噪
        outlet = Math.max(0.01, outlet); 

        // 4. 更新累积吸附量 (积分步)
        // dM = (Cin - Cout) * Q * dt
        // 每次模拟间隔 1.5秒，加上时间加速因子
        const dt_minutes = (1.5 / 60) * TIME_ACCELERATION;
        // 使用动态的 flowRate 状态
        const adsorbed_mass_step = (inlet - outlet) * flowRate * dt_minutes;
        
        simulationState.current.accumulatedLoadMg += adsorbed_mass_step;

        // 5. UI 数据更新
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('zh-CN', { hour12: false, minute:'2-digit', second:'2-digit' });
        
        const newDataPoint: SensorData = {
          timestamp: Date.now(),
          timeLabel,
          inletConcentration: parseFloat(inlet.toFixed(2)),
          outletConcentration: parseFloat(outlet.toFixed(3)), // 精度提高，因为处理效果好
          saturation: parseFloat((saturation * 100).toFixed(2))
        };

        setDataHistory(prev => {
          const newHistory = [...prev, newDataPoint];
          return newHistory.length > MAX_HISTORY ? newHistory.slice(1) : newHistory;
        });
        setCurrentSaturation(saturation);

        // 6. 闭环控制逻辑
        if (saturation >= CAPACITY_THRESHOLD) {
          if (status !== 'CRITICAL') {
             setStatus('CRITICAL');
             addLog(`[紧急预警] MOF 饱和度达 ${(saturation*100).toFixed(1)}%！即将穿透。`, 'ALERT');
             addLog(`[系统通知] 已自动通知维修人员进行滤芯更换。`, 'INFO');
             addLog(`[操作请求] 请人工确认更换吸附柱。`, 'ACTION');
          }
        } else if (saturation > 0.85 && status !== 'WARNING' && status !== 'CRITICAL') {
           setStatus('WARNING');
           addLog(`饱和度接近阈值 (>${(saturation*100).toFixed(0)}%)，去除率开始下降`, 'ALERT');
        } else if (saturation < 0.85 && status === 'WARNING') {
            setStatus('NORMAL');
        }

      }, 1500); 
    }

    return () => clearInterval(intervalId);
  }, [active, status, addLog, flowRate]); // 添加 flowRate 依赖

  return {
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
  };
};