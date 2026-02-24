import { useState, useEffect, useRef } from 'react';
import { TOKENS, TRANSLATIONS, DEFAULT_CONFIG } from './constants';
import HelpPopover from './components/HelpPopover';
import LogViewer from './components/LogViewer';
import { useAutoSwapBot } from './hooks/useAutoSwapBot';

const AutoSwapBot = () => {
  // --- 配置状态 ---
  // 建议去 helius.dev 或 quicknode.com 申请一个免费的 RPC URL，公共节点 100% 会挂
  const [rpcUrl, setRpcUrl] = useState(DEFAULT_CONFIG.RPC_URL);
  const [privateKey, setPrivateKey] = useState(''); // 填入 Phantom 导出的私钥 (Base58字符串)
  const [apiKey, setApiKey] = useState(''); // Jupiter API Key (可选，但推荐)

  const [inputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);
  const [minAmount, setMinAmount] = useState(DEFAULT_CONFIG.AMOUNT);
  const [maxAmount, setMaxAmount] = useState(Number((DEFAULT_CONFIG.AMOUNT * 1.2).toFixed(4)));
  const [tradeCount, setTradeCount] = useState(DEFAULT_CONFIG.TRADE_COUNT);
  const [minInterval, setMinInterval] = useState(DEFAULT_CONFIG.INTERVAL_MS); // 最小交易间隔(毫秒)
  const [maxInterval, setMaxInterval] = useState(Number((DEFAULT_CONFIG.INTERVAL_MS * 1.5).toFixed(0))); // 最大交易间隔(毫秒)
  const [slippage, setSlippage] = useState(DEFAULT_CONFIG.SLIPPAGE); // %
  const [priorityFee, setPriorityFee] = useState(DEFAULT_CONFIG.PRIORITY_FEE); // SOL
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const hasInitConfigRef = useRef(false);

  const {
    logs,
    logFilter,
    setLogFilter,
    isRunning,
    startBot,
    stopBot,
  } = useAutoSwapBot();

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('solana-auto-swap-config-v1');
      if (!raw) return;
      if (hasInitConfigRef.current) return;
      hasInitConfigRef.current = true;

      const saved = JSON.parse(raw) || {};
      const msg = t.configRestorePrompt;
      if (!window.confirm(msg)) return;

      setLang(saved.lang || 'zh');
      setRpcUrl(saved.rpcUrl || DEFAULT_CONFIG.RPC_URL);
      setApiKey(saved.apiKey || '');
      setInputToken(saved.inputToken || TOKENS.SOL);
      setOutputToken(saved.outputToken || TOKENS.USDC);
      setMinAmount(typeof saved.minAmount === 'number' ? saved.minAmount : DEFAULT_CONFIG.AMOUNT);
      setMaxAmount(typeof saved.maxAmount === 'number' ? saved.maxAmount : Number((DEFAULT_CONFIG.AMOUNT * 1.2).toFixed(4)));
      setTradeCount(typeof saved.tradeCount === 'number' ? saved.tradeCount : DEFAULT_CONFIG.TRADE_COUNT);
      setMinInterval(typeof saved.minInterval === 'number' ? saved.minInterval : DEFAULT_CONFIG.INTERVAL_MS);
      setMaxInterval(typeof saved.maxInterval === 'number' ? saved.maxInterval : Number((DEFAULT_CONFIG.INTERVAL_MS * 1.5).toFixed(0)));
      setSlippage(typeof saved.slippage === 'number' ? saved.slippage : DEFAULT_CONFIG.SLIPPAGE);
      setPriorityFee(typeof saved.priorityFee === 'number' ? saved.priorityFee : DEFAULT_CONFIG.PRIORITY_FEE);
    } catch {
      // ignore
    }
  }, []);

  const handleSaveConfig = () => {
    try {
      const config = {
        rpcUrl,
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
        lang,
      };
      localStorage.setItem('solana-auto-swap-config-v1', JSON.stringify(config));
      alert(t.saveConfigSuccess);
    } catch {
      alert(t.saveConfigError);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white max-w-2xl mx-auto rounded-lg font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-400">{t.title}</h2>
        <button
          onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
          className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-600 transition"
        >
          {lang === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <span className="text-xs text-yellow-500 font-bold">{t.rpcLabel}</span>
          <input
            className="w-full bg-black border border-gray-700 p-2 rounded text-sm"
            value={rpcUrl}
            onChange={e => setRpcUrl(e.target.value)}
            placeholder="https://mainnet.helius-rpc.com/..."
          />
        </div>
        <div>
          <span className="text-xs text-red-400 font-bold">{t.privateKeyLabel}</span>
          <input
            type="password"
            className="w-full bg-black border border-red-900 p-2 rounded text-sm"
            value={privateKey}
            onChange={e => setPrivateKey(e.target.value)}
            placeholder={t.privateKeyPlaceholder}
          />
        </div>
        <div>
          <span className="text-xs text-gray-400">{t.apiKeyLabel}</span>
          <input
            className="w-full bg-black border border-gray-700 p-2 rounded text-sm"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={t.apiKeyPlaceholder}
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <select
          className="bg-gray-800 p-2 rounded flex-1 text-white border border-gray-700"
          value={inputToken}
          onChange={e => setInputToken(e.target.value)}
        >
          <option value={TOKENS.SOL}>SOL</option>
          <option value={TOKENS.USDC}>USDC</option>
          <option value={TOKENS.USDT}>USDT</option>
        </select>

        <span className="p-2 text-gray-500">➔</span>

        <select
          className="bg-gray-800 p-2 rounded flex-1 text-white border border-gray-700"
          value={outputToken}
          onChange={e => setOutputToken(e.target.value)}
        >
          <option value={TOKENS.SOL}>SOL</option>
          <option value={TOKENS.USDC}>USDC</option>
          <option value={TOKENS.USDT}>USDT</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.minAmountLabel} / {t.maxAmountLabel}
            <HelpPopover content={t.amountHelp} />
          </span>
          <div className="flex gap-2">
            <input
              className="w-full bg-gray-800 p-2 rounded text-sm"
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={e => setMinAmount(Number(e.target.value))}
            />
            <input
              className="w-full bg-gray-800 p-2 rounded text-sm"
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={e => setMaxAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.countLabel}
            <HelpPopover content={t.countHelp} />
          </span>
          <input className="w-full bg-gray-800 p-2 rounded" type="number" value={tradeCount} onChange={e => setTradeCount(Number(e.target.value))} />
        </div>
        <div>
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.minIntervalLabel} / {t.maxIntervalLabel}
            <HelpPopover content={t.intervalHelp} />
          </span>
          <div className="flex gap-2">
            <input
              className="w-full bg-gray-800 p-2 rounded text-sm"
              type="number"
              placeholder="Min"
              value={minInterval}
              onChange={e => setMinInterval(Number(e.target.value))}
            />
            <input
              className="w-full bg-gray-800 p-2 rounded text-sm"
              type="number"
              placeholder="Max"
              value={maxInterval}
              onChange={e => setMaxInterval(Number(e.target.value))}
            />
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.slippageLabel}
            <HelpPopover content={t.slippageHelp} />
          </span>
          <input className="w-full bg-gray-800 p-2 rounded" type="number" value={slippage} onChange={e => setSlippage(Number(e.target.value))} />
        </div>
        <div>
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.priorityFeeLabel}
            <HelpPopover content={t.priorityFeeHelp} />
          </span>
          <input className="w-full bg-gray-800 p-2 rounded" type="number" value={priorityFee} onChange={e => setPriorityFee(Number(e.target.value))} />
        </div>
        <div>
          <span className="text-xs text-gray-400 flex items-center h-5">
            {t.saveConfigBtn}
            <HelpPopover content={t.saveConfigHelp} />
          </span>
          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded text-gray-200 hover:bg-gray-700"
          >
            {t.saveConfigBtn}
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => {
            if (isRunning) {
              stopBot();
              return;
            }
            startBot({
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
            });
          }}
          className={`flex-1 py-3 font-bold rounded ${isRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`}
        >
          {isRunning ? t.stopBtn : t.startBtn}
        </button>
      </div>

      <LogViewer
        logs={logs}
        filter={logFilter}
        onFilterChange={setLogFilter}
        t={t}
      />
    </div>
  );
};

export default AutoSwapBot;