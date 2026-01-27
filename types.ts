export type SystemStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface SensorData {
  timestamp: number;
  timeLabel: string;
  inletConcentration: number;
  outletConcentration: number;
  saturation: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'ACTION';
}

export interface SimulationConfig {
  inletBase: number; // 基础浓度
  noise: number; // 随机波动
  degradationRate: number; // 滤芯饱和速度
}