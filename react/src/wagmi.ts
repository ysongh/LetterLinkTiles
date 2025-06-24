import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base, mainnet, hardhat, flowTestnet } from "wagmi/chains";

export const config = createConfig({
  chains: [base, mainnet, hardhat, flowTestnet],
  connectors: [farcasterFrame()],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [hardhat.id]: http(),
    [flowTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
