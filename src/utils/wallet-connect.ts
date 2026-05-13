import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, bsc, mainnet, optimism, polygon } from "@reown/appkit/networks";
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
} from "@reown/appkit/vue";
import { reconnect, signMessage } from "@wagmi/core";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { CreateConnectorFn } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "@wagmi/connectors";

export const walletAddress = ref("");
export const signer = ref<any>(null);
export const contract = ref<any>(null);
export const isLoginWallet = ref(false);

const projectId = "102255437892be053779ff0848924976";

const metadata = {
  name: "XRace",
  description: "XRace Wallet ",
  url: "https://xrace.market/",
  icons: ["https://xrace.market/favicon.png"],
};

const connectors = [
  injected({ shimDisconnect: true }), // 桌面插件 + 钱包内置浏览器
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
  }),
  // walletConnect({
  //   projectId,
  //   metadata,
  // }), // 普通手机浏览器拉起钱包 App
];
connectors.push();
const wagmiAdapter = new WagmiAdapter({
  connectors,
  projectId,
  networks: [bsc],
});
export let config = wagmiAdapter.wagmiConfig;
// 创建 AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc],
  metadata,
  projectId,
  showWallets: true,
  allowUnsupportedChain: false,
  features: {
    analytics: true,
    connectMethodsOrder: ["wallet"],
    connectorTypeOrder: [
      "recent",
      "injected",
      "featured",
      "custom",
      "external",
      "recommended",
      "walletConnect",
    ],
  },
  featuredWalletIds: [
    "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
    "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // okx
    "aba1f652e61fd536e8a7a5cd5e0319c9047c435ef8f7e907717361ff33bb3588", // gate
  ],
});

const { open, close } = useAppKit();
const accountData = useAppKitAccount();
const events = useAppKitEvents();
const networkData = useAppKitNetwork();

const platform = ref("");
const signature = ref("");
const isSigning = ref(false);

export const chainId = ref(networkData.value.chainId);

export const connectWallet = async () => {
  open();
};

export const signWalletMessage = async (message) => {
  return await signMessage(config, { message });
};

export const reconnectallet = async () => {
  const isLoginWalletA = localStorage.getItem("walletAddress");
  if (isLoginWalletA) {
    const a = await reconnect(config);
  }
};

watch(
  events,
  async (newValue) => {
    if (accountData.value.address) {
      walletAddress.value = accountData.value.address;
    }
    if (newValue.data?.properties?.platform) {
      platform.value = newValue.data.properties.platform;
    }
    if (newValue.data.event === "CONNECT_SUCCESS") {
      if (accountData.value.address) {
        walletAddress.value = accountData.value.address;
        const isLogin = localStorage.getItem("isLoginWallet");
        if (!isLogin || isLogin === "0") {
          localStorage.setItem("walletAddress", walletAddress.value);
          await getWebTokenF();
          // localStorage.setItem("isLoginWallet", "0");
        }
      }
    } else if (newValue.data.event === "MODAL_CLOSE") {
      if (
        newValue.data.properties?.connected &&
        (platform.value === "mobile" || platform.value === "qrcode")
      ) {
        if (!localStorage.getItem("walletAddress")) {
          if (walletAddress.value) {
            localStorage.setItem("walletAddress", walletAddress.value);
            await getWebTokenF();
            // localStorage.setItem("isLoginWallet", "0");
          }
        }
      }
    } else if (newValue.data.event === "SELECT_WALLET") {
      isSigning.value = false;
    } else if (newValue.data.event === "DISCONNECT_SUCCESS") {
      walletAddress.value = "";
      localStorage.clear();
      localStorage.setItem("isLoginWallet", "0");
      location.reload();
    }
  },
  { deep: true },
);

export const loginInSystem = async () => {
  // await reconnect(config);
  await getWebTokenF();
};

const getWebTokenF = async () => {
  console.log("执行getWebTokenF");
  if (isSigning.value) return;
  isSigning.value = true;
  const wa = localStorage.getItem("walletAddress");
  console.log("walletAddress为", wa);
  const url = `https://nodeapi.carx.cz/wallet/getWebToken?wallet=${wa}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "请求失败");
  if (data.code != 200 && !data.data) return;
  console.log("执行完成getWebTokenF", data.data);
  const signStr =
    `verifywalletwallet:${wa}token:${data.data}`.toLocaleLowerCase();

  await signMessageF(signStr);
};

const signMessageF = async (message: string) => {
  const flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
  // if (flag) {
  //   Swal.fire({
  //     width: 720,
  //     html: `<div style="color:rgb(var(--v-swalContentColor))">Switch to your wallet app to continue.</div>`,
  //     background: "rgba(var(--v-notiveBackground))",
  //     timer: 4000,
  //     showCloseButton: false,
  //     showCancelButton: false,
  //     focusConfirm: true,
  //     confirmButtonText: `<div style="color:white">OK</div>`,
  //     confirmButtonColor: "rgb(var(--v-theme-primary))",
  //     customClass: {
  //       popup: "custom-swal-popup",
  //       confirmButton: "custom-confirm-btn",
  //     },
  //   });
  // }
  console.log("开始签名", message);
  try {
    signature.value = await signMessage(config, { message });
  } catch (error) {
    if (flag) {
      alert("unsigned");
    }
    console.error("签名失败", error);
    isSigning.value = false;
    return;
  }
  isSigning.value = false;
  console.log("签名完成登陆钱包", signature.value);
  localStorage.setItem("signature", signature.value);
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const requestOptions: any = { method: "POST", headers, redirect: "follow" };
  const params = new URLSearchParams(window.location.search);
  const inviteCode = params.get("code");
  const url = new URL("https://nodeapi.carx.cz/login_wallet");
  const loginWalletBody = {
    wallet: localStorage.getItem("walletAddress"),
    signature: signature.value,
    namespace: "eip155",
    invite_code: inviteCode,
  };
  requestOptions.body = JSON.stringify(loginWalletBody);

  const res = await fetch(url, requestOptions);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const resJson = await res.json();
  if (resJson.code === 200 && resJson.data) {
    localStorage.setItem("namespace", "eip155");
    await userLogin(resJson);
  }
};

const userLogin = async (res: any) => {
  localStorage.setItem("userData", JSON.stringify(res.data));
  localStorage.setItem("coin", JSON.stringify(res.data.coin));
  localStorage.setItem("walletAddress", walletAddress.value);
  close();
  signature.value = "";
  localStorage.setItem("indexFlag", "false");
  isLoginWallet.value = true;
  localStorage.setItem("isLoginWallet", "1");
  getProfileInfo(res.data);
};

const getProfileInfo = async (userInfo: any) => {
  try {
    const url = `https://nodeapi.carx.cz/lottery/user/balance`;
    const payload = {
      userId: userInfo.id,
      page: 1,
      limit: 10,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    if (data.code === 200 && data.data) {
      localStorage.setItem(
        "currentBalance",
        JSON.stringify(data.data.currentBalance),
      );
      location.reload();
    }
  } catch (err) {
    console.error("请求失败:", err);
  }
};
