import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { TOKENS } from '../constants';
import type { LogType } from '../types';

interface ExecuteSwapParams {
  index: number;
  tradeCount: number;
  connection: Connection;
  signerKeypair: Keypair;
  currentInput: string;
  currentOutput: string;
  currentAmountUi: number;
  slippage: number;
  apiKey: string;
  priorityFee: number;
  t: any; // Translation object
  onLog: (msg: string, type?: LogType, txid?: string) => void;
}

export const executeSwap = async ({
  index,
  tradeCount,
  connection,
  signerKeypair,
  currentInput,
  currentOutput,
  currentAmountUi,
  slippage,
  apiKey,
  priorityFee,
  t,
  onLog
}: ExecuteSwapParams): Promise<number | null> => {
  try {
    onLog(`🔄 [${index + 1}/${tradeCount}] ${currentInput === TOKENS.SOL ? t.buying : t.selling} | ${t.quantity}: ${currentAmountUi.toFixed(6)}...`, 'info');

    // 1. 获取 Quote (V1 API)
    const inputDecimals = currentInput === TOKENS.SOL ? 9 : 6;
    const lamports = Math.floor(currentAmountUi * Math.pow(10, inputDecimals));

    const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${currentInput}&outputMint=${currentOutput}&amount=${lamports}&slippageBps=${Math.floor(slippage * 100)}`;

    const quoteHeaders: HeadersInit = {};
    if (apiKey) quoteHeaders['x-api-key'] = apiKey;

    const quoteRes = await fetch(quoteUrl, { headers: quoteHeaders });
    const quoteData = await quoteRes.json();

    if (quoteData.error) throw new Error(quoteData.error);

    const outAmountLamports = Number(quoteData.outAmount);
    const outputDecimals = currentOutput === TOKENS.SOL ? 9 : 6;
    const outAmountUi = outAmountLamports / Math.pow(10, outputDecimals);

    // 2. 获取交易数据 (V1 API)
    const swapRes = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: signerKeypair.publicKey.toString(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: Math.floor(priorityFee * 1_000_000_000)
      })
    });

    const { swapTransaction } = await swapRes.json();

    // 3. 本地签名
    const swapTransactionBuf = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([signerKeypair]);

    // 4. 发送
    const rawTransaction = transaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2
    });

    onLog(`${t.txSuccess} ${txid.slice(0, 8)}...`, 'success', txid);

    // 5. 确认
    try {
      const confirmation = await connection.confirmTransaction(txid, 'confirmed');
      if (confirmation.value.err) throw new Error(t.txConfirmFail);
      onLog(`${t.txGet} ${outAmountUi.toFixed(6)} ${t.txGetSuffix}`, 'success-get');
    } catch (e: any) {
      onLog(`${t.txTimeout} ${e?.message || String(e)}`, 'error');
    }

    return outAmountUi;

  } catch (error: any) {
    console.error(error);
    let errorMsg = error?.message || String(error);
    if (errorMsg.includes("403") || errorMsg.includes("Access forbidden") || JSON.stringify(error).includes("Access forbidden")) {
      errorMsg = t.rpcError403;
    }
    onLog(`${t.fatalError} ${errorMsg}`, 'error');
    return null;
  }
};