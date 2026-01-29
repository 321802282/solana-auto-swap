export type LogType = 'info' | 'success' | 'error' | 'success-get';

export interface LogEntry {
  id: number;
  time: string;
  type: LogType;
  message: string;
  txid?: string;
}

export interface SwapConfig {
  rpcUrl: string;
  privateKey: string;
  apiKey: string;
  inputToken: string;
  outputToken: string;
  minAmount: number;
  maxAmount: number;
  tradeCount: number;
  minInterval: number;
  maxInterval: number;
  slippage: number;
  priorityFee: number;
}