// 引入依赖
import {
    restoreWallet,
    getSigningCosmWasmClient,
    getQueryClient,
} from "@sei-js/core";
import { calculateFee } from "@cosmjs/stargate";
import readline from 'readline';

// 配置信息
export const RPC_URL = "https://sei-rpc.polkachu.com/";
export const REST_URL = "https://sei-api.polkachu.com/";
export const NETWORK = "pacific-1";

// 使用readline安全地从命令行获取助记词
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 助记词安全输入
rl.question('请输入您的助记词：', async (mnemonic) => {
  try {
    // 从助记词恢复钱包
    const wallet = await restoreWallet(mnemonic, 0);
    const accounts = await wallet.getAccounts();

    // 查询余额
    const balance = await querySeiBalance(accounts[0].address);
    console.log("当前余额：", balance);

    // 批量Mint操作
    await batchMint(wallet, accounts[0].address);

    rl.close();
  } catch (error) {
    console.error("发生错误：", error);
    rl.close();
  }
});

// 查询SEI余额的函数
const querySeiBalance = async (address) => {
  const queryClient = await getQueryClient(REST_URL);
  const result = await queryClient.cosmos.bank.v1beta1.balance({
    address: address,
    denom: "usei",
  });
  return result.balance;
};

// 批量Mint操作的函数
const batchMint = async (wallet, address) => {
  // const msg = {
  //   p: "sei-20",
  //   op: "mint",
  //   tick: "seis",
  //   amt: "1000",
  // };
  const msg_base64 = "ZGF0YToseyJwIjoic2VpLTIwIiwib3AiOiJtaW50IiwidGljayI6InNlaXMiLCJhbXQiOiIxMDAwIn0=";
  const fee = calculateFee(100000, "0.1usei");

  const signingCosmWasmClient = await getSigningCosmWasmClient(RPC_URL, wallet);

  for (let i = 0; i < 26774; i++) {
    try {
      const response = await signingCosmWasmClient.sendTokens(
        address,
        address,
        [{ amount: "1", denom: "usei" }],
        fee,
        msg_base64
      );
      console.log("交易哈希：", response.transactionHash);
    } catch (error) {
      console.error("交易错误：", error);
    }
  }
};
