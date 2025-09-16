import { ArrowRightLeft } from 'lucide-react';

const tradeOffers = [
  { id: '1', address: '0xABC...123', offeredTile: 5, requestedTile: 18, isActive: true },
  { id: '2', address: '0xDEF...456', offeredTile: 10, requestedTile: 1, isActive: true },
  { id: '3', address: '0x789...XYZ', offeredTile: 26, requestedTile: 5, isActive: false },
  { id: '4', address: '0x555...777', offeredTile: 17, requestedTile: 9, isActive: true },
]

 const tileScores: { [key: number]: number } = {
    1: 1, 2: 3, 3: 3, 4: 2, 5: 1, 6: 4, 7: 2, 8: 4, 9: 1, 10: 8,
    11: 5, 12: 1, 13: 3, 14: 1, 15: 1, 16: 3, 17: 10, 18: 1, 19: 1, 20: 1,
    21: 1, 22: 4, 23: 4, 24: 8, 25: 4, 26: 10
  };

function TradingTable({ playerTiles } : { playerTiles: BigInt[] }) {
  const numberToLetter = (num: number): string => {
    return String.fromCharCode(64 + num); // A=1 -> 'A', B=2 -> 'B', etc.
  };

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
            {tradeOffers.map((trade) => (
              <tr key={trade.id} className="border-b border-gray-700/50">
                <td className="py-3 px-2">
                  <div className="text-xs font-mono text-gray-300">
                    {trade.address}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-green-900/30 border border-green-400 rounded text-xs font-bold">
                    <div className="flex flex-col">
                      <span>{numberToLetter(trade.offeredTile)}</span>
                      <span className="text-xs opacity-70">{tileScores[trade.offeredTile]}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-900/30 border border-red-400 rounded text-xs font-bold">
                    <div className="flex flex-col">
                      <span>{numberToLetter(trade.requestedTile)}</span>
                      <span className="text-xs opacity-70">{tileScores[trade.requestedTile]}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    trade.isActive 
                      ? 'bg-green-900/30 text-green-400 border border-green-400' 
                      : 'bg-gray-700/30 text-gray-400 border border-gray-600'
                  }`}>
                    {trade.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      trade.isActive && playerTiles.includes(BigInt(trade.requestedTile))
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tradeOffers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No trade offers available
        </div>
      )}
    </div>
  )
}

export default TradingTable;
