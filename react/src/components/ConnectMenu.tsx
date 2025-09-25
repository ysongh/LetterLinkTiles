import {
  useAccount,
  useChains,
  useChainId
} from "wagmi";

import { formatAddress } from "../utils/format";

export function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const chains = useChains();
  const chainId = useChainId();

  const currentChain = chains.find(chain => chain.id === chainId);

  return (
    <header className="bg-teal-700 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Letter Link Tiles
          </h1>
          
          {!isConnected ? (
            <appkit-button />
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-sm bg-white/10 px-3 py-1 rounded-full">
                <p className="font-mono text-sm">{formatAddress(address || "")}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-sm text-gray-300">Connected: {currentChain ? currentChain.name : 'Not connected'}</span>
              </div>
            </div>
          )}
        </div>
      </header>
  );
}