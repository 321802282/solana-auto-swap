import { useRef, useState, useCallback } from 'react';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import type { Translation } from '../constants';
import type { LogEntry, LogType } from '../types';
import { sleep } from '../utils';
import { executeSwap } from '../services/swap';

export type LogFilter = 'all' | 'success' | 'error' | 'success-get';

export interface AutoSwapBotConfig {
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
  t: Translation;
}

export interface UseAutoSwapBotResult {
  logs: LogEntry[];
  logFilter: LogFilter;
  setLogFilter: (filter: LogFilter) => void;
  isRunning: boolean;
  startBot: (config: AutoSwapBotConfig) => Promise<void>;
  stopBot: () => void;
}

export const useAutoSwapBot = (): UseAutoSwapBotResult => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);

  const addLog = useCallback(
    (msg: string, type: LogType = 'info', txid?: string) => {
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [{ id: Date.now() + Math.random(), time, type, message: msg, txid }, ...prev]);
    },
    [],
  );

  const stopBot = () => {
    isRunningRef.current = false;
    setIsRunning(false);
  };

  const startBot = async (config: AutoSwapBotConfig) => {
    const {
      rpcUrl,
      privateKey,
      apiKey,
      inputToken,
      outputToken,
      minAmount,
      maxAmount,
      tradeCount,
      minInterval,
      maxInterval,
      slippage,
      priorityFee,
      t,
    } = config;

    setIsRunning(true);
    isRunningRef.current = true;
    setLogs([]);

    try {
      const connection = new Connection(rpcUrl, 'confirmed');

      const secretKey = bs58.decode(privateKey);
      const keypair = Keypair.fromSecretKey(secretKey);

      addLog(`${t.scriptStart} ${keypair.publicKey.toString().slice(0, 6)}...`, 'info');

      let successCount = 0;

      let currentInToken = inputToken;
      let currentOutToken = outputToken;
      let nextReverseAmount = 0;

      while (successCount < tradeCount) {
        if (!isRunningRef.current) {
          addLog(t.scriptStop, 'info');
          break;
        }

        let tradeAmount: number;

        if (currentInToken === inputToken) {
          tradeAmount = minAmount + Math.random() * (maxAmount - minAmount);
        } else {
          tradeAmount = nextReverseAmount;
        }

        const resultOutAmount = await executeSwap({
          index: successCount,
          tradeCount,
          connection,
          signerKeypair: keypair,
          currentInput: currentInToken,
          currentOutput: currentOutToken,
          currentAmountUi: tradeAmount,
          slippage,
          apiKey,
          priorityFee,
          t,
          onLog: addLog,
        });

        if (!isRunningRef.current) break;

        if (resultOutAmount !== null) {
          successCount++;

          const temp = currentInToken;
          currentInToken = currentOutToken;
          currentOutToken = temp;

          nextReverseAmount = resultOutAmount;

          if (successCount < tradeCount) {
            const waitTimeMs = Math.floor(minInterval + Math.random() * (maxInterval - minInterval));

            addLog(`${t.coolDown} ${waitTimeMs}ms...`, 'info');
            await sleep(waitTimeMs);
          }
        } else {
          addLog(t.tradeFail, 'error');

          if (currentInToken !== inputToken) {
            addLog(t.reverseFailSkip, 'error');
            currentInToken = inputToken;
            currentOutToken = outputToken;
          }

          await sleep(3000);
        }
      }
    } catch (e: any) {
      addLog(`${t.fatalError} ${e?.message || String(e)}`, 'error');
    }

    setIsRunning(false);
    isRunningRef.current = false;
    addLog(config.t.taskEnd, 'info');
  };

  return {
    logs,
    logFilter,
    setLogFilter,
    isRunning,
    startBot,
    stopBot,
  };
};

