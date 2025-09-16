import { ArrowRightLeft } from 'lucide-react';
import { useReadContract, useWriteContract } from "wagmi";

import TargetWords from "../../artifacts/contracts/TargetWords.sol/TargetWords.json";

const tileScores: { [key: number]: number } = {
  1: 1, 2: 3, 3: 3, 4: 2, 5: 1, 6: 4, 7: 2, 8: 4, 9: 1, 10: 8,
  11: 5, 12: 1, 13: 3, 14: 1, 15: 1, 16: 3, 17: 10, 18: 1, 19: 1, 20: 1,
  21: 1, 22: 4, 23: 4, 24: 8, 25: 4, 26: 10
};

const numberToLetter = (num: number): string => {
  return String.fromCharCode(64 + num); // A=1 -> 'A', B=2 -> 'B', etc.
};

function TradingTable({ playerTiles } : { playerTiles: BigInt[] }) {
  const { data: offers = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'getActiveTradeOffers',
  }) as { data: BigInt[] };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="text-blue-400" />
        <h2 className="text-xl font-semibold">Trade Offers</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-2 px-2">Player</th>
              <th className="text-center py-2 px-2">Offers</th>
              <th className="text-center py-2 px-2">Wants</th>
              <th className="text-center py-2 px-2">Status</th>
              <th className="text-center py-2 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((id) => (
              <TradingItem id={id} playerTiles={playerTiles} />
            ))}
          </tbody>
        </table>
      </div>
      {offers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No trade offers available
        </div>
      )}
    </div>
  )
}

function TradingItem({ id, playerTiles } : { id: BigInt, playerTiles: BigInt[] }) {
  const { data: offectData = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: TargetWords.abi,
    functionName: 'getTradeOffer',
    args: [id]
  }) as { data: any[] };

  const {
    writeContract,
    data: txHash,
    isPending
  } = useWriteContract();

  const acceptTradeOffer = async () => {
    writeContract({
      address: import.meta.env.VITE_GAME_CONTRACT,
      abi: TargetWords.abi,
      functionName: "acceptTradeOffer",
      args: [id]
    })
  };

  if (offectData.length === 0) return null;

  return (
    <tr key={Number(id)} className="border-b border-gray-700/50">
      <td className="py-3 px-2">
        <div className="text-xs font-mono text-gray-300">
          {offectData[0]}
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-900/30 border border-green-400 rounded text-xs font-bold">
          <div className="flex flex-col">
            <span>{numberToLetter(offectData[1])}</span>
            <span className="text-xs opacity-70">{tileScores[offectData[1]]}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 bg-red-900/30 border border-red-400 rounded text-xs font-bold">
          <div className="flex flex-col">
            <span>{numberToLetter(offectData[2])}</span>
            <span className="text-xs opacity-70">{tileScores[offectData[2]]}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          offectData[3]
            ? 'bg-green-900/30 text-green-400 border border-green-400' 
            : 'bg-gray-700/30 text-gray-400 border border-gray-600'
        }`}>
          {offectData[3] ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-3 px-2 text-center">
        <button
          onClick={acceptTradeOffer}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            offectData[3] && playerTiles.includes(BigInt(offectData[2]))
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Trade
        </button>
      </td>
    </tr>
  )
}

export default TradingTable;
