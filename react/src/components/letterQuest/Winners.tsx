import { Gift } from "lucide-react";

import { formatAddress } from "../../utils/format";

interface Winners {
  winner1: string,
  winner2: string,
  winner3: string,
  claimPrize: Function
}

function Winners({
  winner1,
  winner2,
  winner3,
  claimPrize
}: Winners) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold">Winners</h3>
      </div>
      <div className="space-y-2">
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg" onClick={() => claimPrize(1)}>
          {formatAddress(winner1)}
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg" onClick={() => claimPrize(2)}>
          {formatAddress(winner2)}
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg" onClick={() => claimPrize(3)}>
          {formatAddress(winner3)}
        </div>
      </div>
    </div>
  )
}

export default Winners