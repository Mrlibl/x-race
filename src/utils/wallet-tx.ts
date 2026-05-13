// swap-and-recharge.ts
import { ethers } from "ethers";

/** ========================
 *  常量配置（按需修改）
 *  ======================== */

// 你的 swap 合约地址（包含 swapToUSDT）
export const CONTRACT_ADDRESS = "0x971Cd63cf6024F3142e9f0fbB467f60a46054C8B";

// 目标币：BSC 上 Binance-Peg USDT
export const USDT = ethers.getAddress(
  "0x55d398326f99059ff775485246999027b3197955",
);

// BSC 主网原生币包装：WBNB（用于 V3 查询/报价）
export const WBNB = ethers.getAddress(
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
);

// Pancake V3 Factory & Quoter（与你原代码一致）
export const FACTORY_ADDRESS = ethers.getAddress(
  "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
);
export const QUOTER_V2 = ethers.getAddress(
  "0x78d78e420da98ad378d7799be8f4af69933cf6a3",
);

// 支持的 V3 费档（0.01%、0.05%、0.25%、1%）
const FEE_TIERS = [100, 500, 2500, 10000];

// 滑点（基点，0.5%）
const SLIPPAGE_BPS = 50n;

// 期望连接链（BSC 主网）
const EXPECT_CHAIN_ID = 56;

let signerObj = null;

/** ========================
 *  ABIs
 *  ======================== */

const swapABI = [
  "function swapToUSDT(address tokenIn,uint256 amountIn,uint256 amountOutMinimum,uint24 fee) external payable returns (uint256 amountOut)",
];

const ERC20_DECIMALS_ABI = ["function decimals() view returns (uint8)"];

const IERC20_APPROVE_ABI = [
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
];

const FACTORY_ABI = [
  "function getPool(address tokenA,address tokenB,uint24 fee) external view returns (address)",
];

const QUOTER_ABI = [
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) view returns (uint256 amountOut,uint160,uint32,uint256)",
];

/** ========================
 *  工具：地址与链
 *  ======================== */
function isZeroAddress(addr: string) {
  try {
    return ethers.getAddress(addr) === ethers.ZeroAddress;
  } catch {
    return addr === ethers.ZeroAddress || /^0x0{40}$/i.test(addr);
  }
}

async function ensureOnBsc(provider: ethers.BrowserProvider) {
  const { chainId } = await provider.getNetwork();
  if (Number(chainId) !== EXPECT_CHAIN_ID) {
    throw new Error(
      `请切换到 BSC 主网（chainId=${EXPECT_CHAIN_ID}），当前 chainId=${chainId}`,
    );
  }
}

/** ========================
 *  主流程：Swap 到 USDT
 *  ======================== */
/**
 * @param tokenIn        输入代币地址；若为原生 BNB，请传 0x0000000000000000000000000000000000000000（ZeroAddress）
 * @param amountInHuman  人类可读数量（字符串），例如 "1.23"
 */
export async function swapAndRecharge(tokenIn: string, amountInHuman: string) {
  if (!amountInHuman || Number(amountInHuman) <= 0) {
    throw new Error("amountInHuman 必须为正数的字符串，例如 '1.23'");
  }
  if (!tokenIn) {
    throw new Error("tokenIn 不能为空");
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await ensureOnBsc(provider);
  const signer = await provider.getSigner();
  signerObj = signer;
  const caller = await signer.getAddress();

  // 你的聚合/路由合约实例
  const swapContract = new ethers.Contract(CONTRACT_ADDRESS, swapABI, signer);

  // ===== 1) 计算 amountIn（BNB 与 ERC20 分开） =====
  let decimals: number;
  let tokenForQuote: string; // 报价/查池用的 token（BNB -> WBNB）
  if (isZeroAddress(tokenIn)) {
    decimals = 18; // 原生 BNB
    tokenForQuote = WBNB;
  } else {
    const tokenDecimals = new ethers.Contract(
      tokenIn,
      ERC20_DECIMALS_ABI,
      provider,
    );
    decimals = await tokenDecimals.decimals();
    tokenForQuote = ethers.getAddress(tokenIn);
  }
  const amountIn = ethers.parseUnits(String(amountInHuman), decimals);

  // ===== 2) ERC20 才需要 approve（spender = 实际扣款方） =====
  const SPENDER = ethers.getAddress(CONTRACT_ADDRESS);
  if (!isZeroAddress(tokenIn)) {
    await approveIfNeeded(tokenForQuote, SPENDER, amountIn, signer, caller);
  }

  // ===== 3) 选择 fee 档（存在池的第一个；可扩展为挑流动性更好的） =====
  let fee;
  if (isSameAddress(tokenForQuote, USDT)) {
    fee = 100;
  } else {
    fee = await getPoolFeeTier(tokenForQuote, USDT, provider);
  }
  console.log("picked fee =", fee);

  // ===== 4) 预估并计算最小可接受输出 =====
  // const amountOutMinimum = await getAmountOutMinimum(
  //   tokenForQuote,
  //   USDT,
  //   amountIn,
  //   fee,
  //   provider,
  // );
  // if (!amountOutMinimum || amountOutMinimum <= 0n) {
  //   throw new Error("报价失败：amountOutMinimum 无效");
  // }

  // ===== 5) 发起交易（BNB 通过 value 传入） =====
  let tx;
  if (
    isZeroAddress(tokenIn)
    // || tokenIn.toLowerCase() === "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
  ) {
    // const gasPrice = BigInt(await provider.send("eth_gasPrice", []));
    // const data = swapContract.interface.encodeFunctionData("swapToUSDT", [
    //   tokenIn,
    //   amountIn,
    //   0,
    //   fee,
    // ]);
    // let gasLimit = await provider.estimateGas({
    //   from: await signer.getAddress(),
    //   to: CONTRACT_ADDRESS,
    //   data,
    //   value: isZeroAddress(tokenIn) ? amountIn : 0n,
    //   // 估算时也带上 legacy 字段，和真实发送一致
    //   type: 0,
    //   gasPrice,
    // });
    // const overrides = {
    //   value: amountIn,
    //   gasPrice,
    //   type: 0, // wei
    //   gasLimit,
    // };

    // 纯BNB
    tx = await swapContract.swapToUSDT(tokenIn, amountIn, 0, fee, {
      value: amountIn,
    });
  } else {
    tx = await swapContract.swapToUSDT(tokenIn, amountIn, 0, fee);
  }

  console.log("交易已发送:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ 成功，交易回执:", receipt);

  return {
    hash: tx.hash,
    status: receipt.status,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed?.toString?.() ?? String(receipt.gasUsed ?? ""),
    effectiveGasPrice:
      receipt.effectiveGasPrice?.toString?.() ??
      String(receipt.effectiveGasPrice ?? ""),
    logs: receipt.logs,
  };
}

/** ========================
 *  授权：仅在 allowance 不足时批量
 *  ======================== */
// async function approveIfNeeded(
//   token: string,
//   spender: string,
//   amount: bigint,
//   signer: ethers.Signer,
//   owner: string,
// ) {
//   const erc20 = new ethers.Contract(token, IERC20_APPROVE_ABI, signer);
//   const allowance: bigint = await erc20.allowance(owner, spender);
//   if (allowance >= amount) {
//     console.log("已授权足够额度，无需再次授权");
//     return;
//   }
//   const tx = await erc20.approve(spender, amount);
//   console.log("授权交易已发送，tx hash:", tx.hash);
//   await tx.wait();
//   console.log("授权完成");
// }

async function approveIfNeeded(
  token: string,
  spender: string,
  amount: bigint,
  signer: ethers.Signer,
  owner: string,
) {
  const erc20 = new ethers.Contract(token, IERC20_APPROVE_ABI, signer);

  const before = await erc20.allowance(owner, spender);
  console.log(`[approveIfNeeded] before allowance -> ${before.toString()}`);

  if (before >= amount) {
    console.log("[approveIfNeeded] 已授权足够额度，无需再次授权");
    return;
  }

  // USDT 风格：若已有旧额度，先清零
  if (before > 0n) {
    const tx0 = await erc20.approve(spender, 0n);
    console.log(`[approveIfNeeded] 先清零授权 tx0 = ${tx0.hash}`);
    await tx0.wait();
  }

  const tx = await erc20.approve(spender, amount);
  console.log(`[approveIfNeeded] 授权交易已发送 tx = ${tx.hash}`);
  await tx.wait();
  console.log("[approveIfNeeded] 授权完成");

  // --- 强校验：再次读取并校验 ---
  const after = await erc20.allowance(owner, spender);
  console.log(`[approveIfNeeded] after allowance -> ${after.toString()}`);
  if (after < amount) {
    throw new Error(
      `授权后额度仍不足：需要 ${amount.toString()}，当前 ${after.toString()}。请检查 spender 是否正确（应为 ${spender}），以及钱包确认情况。`,
    );
  }
}


/** ========================
 *  费档探测：找到存在池的 fee
 *  ======================== */
async function getPoolFeeTier(
  tokenA: string,
  tokenB: string,
  provider: ethers.Provider,
): Promise<number | null> {
  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
  const a = ethers.getAddress(tokenA);
  const b = ethers.getAddress(tokenB);
  for (const fee of FEE_TIERS) {
    const pool = await factory.getPool(a, b, fee);
    if (pool !== ethers.ZeroAddress) {
      console.log(`Found pool: ${a} / ${b} at fee ${fee / 10000}% -> ${pool}`);
      return fee;
    }
  }
  return null;
}

/** ========================
 *  报价：Quoter 计算 amountOutMinimum（含滑点）
 *  ======================== */
async function getAmountOutMinimum(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  fee: number,
  provider: ethers.Provider,
): Promise<bigint> {
  try {
    // exactInputSingle 仅用于执行交易，这里我们用 quoter
    const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"; // Uniswap V3/BSC V3 Quoter
    const quoterABI = [
      "function quoteExactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
    ];
    const quoter = new ethers.Contract(quoterAddress, quoterABI, signerObj);

    let amountOut = await quoter.quoteExactInputSingle(
      tokenIn,
      tokenOut,
      fee,
      amountIn,
      0,
    );
    amountOut = BigInt(amountOut);
    const SLIPPAGE = 0.005; // 0.5% 滑点
    // 扣除滑点
    const amountOutMin =
      amountOut - (amountOut * BigInt(Math.floor(SLIPPAGE * 10000))) / 10000n;
    return amountOutMin;
  } catch (err) {
    console.error("获取 amountOutMinimum 失败:", err);
    return null;
  }
}

const isSameAddress = (a?: string, b?: string) => {
  try {
    return ethers.getAddress(a!) === ethers.getAddress(b!);
  } catch {
    return false;
  }
};
