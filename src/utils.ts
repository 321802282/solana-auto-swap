export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

import { Buffer } from 'buffer';

// 环境兼容
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
}