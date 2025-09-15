import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

function TradeInterface({ selectedTile, playerTiles } : { selectedTile: number, playerTiles: BigInt[] }) {
  const [desiredTradeTile, setDesiredTradeTile] = useState<string>("");

  const numberToLetter = (num: number): string => {
    return String.fromCharCode(64 + num); // A=1 -> 'A', B=2 -> 'B', etc.
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-2">
            Desired Tile (A-Z):
          </label>
          <input
            type="text"
            maxLength={1}
            value={desiredTradeTile}
            onChange={(e) => setDesiredTradeTile(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-400"
            placeholder="Enter letter (A-Z)"
          />
        </div>
        <button
          disabled={selectedTile === -1 || !desiredTradeTile}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mt-6"
        >
          <ArrowLeftRight size={16} />
          Trade
        </button>
      </div>
      {selectedTile !== -1 && (
        <div className="mt-3 text-sm text-gray-300">
          Trading: <span className="font-bold text-orange-400">
            {numberToLetter(Number(playerTiles[selectedTile]))}
          </span>
          {desiredTradeTile && (
            <>
              {' '} → <span className="font-bold text-green-400">{desiredTradeTile}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TradeInterface;
