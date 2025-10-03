import { Target } from "lucide-react";

function TargetWords({ targetWord1, targetWord2, targetWord3 } : { targetWord1: string, targetWord2: string, targetWord3: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold">Target Words</h3>
      </div>
      <div className="space-y-2">
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord1}
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord2}
        </div>
        <div className="bg-green-400/20 rounded-lg p-3 text-center font-mono text-lg">
          {targetWord3}
        </div>
      </div>
    </div>
  )
}

export default TargetWords