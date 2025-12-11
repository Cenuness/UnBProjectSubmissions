import { configureChains, createConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// RPC oficial da CESS Testnet - corrigindo para endpoint HTTP
const RPC_ENDPOINT = "https://testnet-rpc.cess.network";

// Definição da chain da CESS Testnet
export const cessTestnet = {
  id: 11330,
  name: "CESS Testnet",
  network: "cess-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CESS Token",
    symbol: "TCESS",
  },
  rpcUrls: {
    default: {
      http: [RPC_ENDPOINT],
    },
    public: {
      http: [RPC_ENDPOINT],
    },
  },
  blockExplorers: {
    default: {
      name: "CESS Explorer",
      url: "https://testnet.cesscan.io",
    },
  },
  testnet: true,
};

// Configuração Wagmi
const { publicClient, webSocketPublicClient } = configureChains(
  [cessTestnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === cessTestnet.id) {
          return {
            http: RPC_ENDPOINT,
          };
        }
        return null;
      },
    }),
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});