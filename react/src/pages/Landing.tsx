import { useNavigate } from 'react-router-dom';
import { Target, Boxes, Puzzle } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-20">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Welcome to Letter Link Tiles!</h2>
        <p className="text-xl text-gray-300 mb-8">
          List of games
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 p-4 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="font-semibold">Target Words</h3>
            <p className="text-sm text-gray-400">Build words for match the targets words</p>
            <button
              onClick={() => navigate("/targetwords")}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              Play
            </button>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <Boxes className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold">Stack Tiles</h3>
            <p className="text-sm text-gray-400">Submit tiles to the targets letters and earn points</p>
            <button
              onClick={() => navigate("/stacktiles")}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              Play
            </button>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <Puzzle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold">Letter Quest</h3>
            <p className="text-sm text-gray-400">Roll Dice and mint tiles</p>
            <button
              onClick={() => navigate("/letterquest")}
              className="w-full mt-3 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              Play
            </button>
          </div>
        </div>
         {/* <button
            onClick={() => navigate("/game")}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Play
          </button> */}
      </div>
    </div>
  )
}

export default Landing;