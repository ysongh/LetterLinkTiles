import { Target } from "lucide-react";
import { formatEther } from "viem";

interface TargetWordsData {
  targetWord1: string,
  targetWord2: string,
  targetWord3: string,
  prize1: BigInt,
  prize2: BigInt,
  prize3: BigInt
}

function TargetWords({
  targetWord1,
  targetWord2,
  targetWord3,
  prize1,
  prize2,
  prize3
} : TargetWordsData ) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold">Target Words</h3>
      </div>
      <div className="space-y-2">
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord1} - Win {formatEther(prize1 as bigint)} Flow
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord2} - Win {formatEther(prize2 as bigint)} Flow
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord3} - Win {formatEther(prize3 as bigint)} Flow
        </div>
      </div>
    </div>
  )
}

export default TargetWords