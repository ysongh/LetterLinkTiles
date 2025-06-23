import { useReadContract } from "wagmi";

import OnChainScrabble from "../artifacts/contracts/OnChainScrabble.sol/OnChainScrabble.json";

function SubmissionCard({ id }: { id: number }){
  const { data: wordSubmission = [] } = useReadContract({
    address: import.meta.env.VITE_GAME_CONTRACT,
    abi: OnChainScrabble.abi,
    functionName: 'getWordSubmission',
    args: [id]
  }) as { data: any  };

  console.log(wordSubmission);

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-lg">{wordSubmission[1]}</div>
          <div className="text-xs text-gray-400">
            {wordSubmission[0]?.slice(0, 8)}...
          </div>
        </div>
        <div className="text-right">
          {wordSubmission[4] ? (
            <div className="text-green-400 font-bold">
              +{Number(wordSubmission[5])} pts
            </div>
          ) : (
            <div className="text-yellow-400 text-sm">
              Pending...
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(Number(wordSubmission[3])).toLocaleTimeString()}
      </div>
    </div>
  )
}

export default SubmissionCard;