import { useNavigate } from 'react-router-dom';
import { Coins, Users, Trophy } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-20">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Welcome to Letter Link Tiles!</h2>
        <p className="text-xl text-gray-300 mb-8">
          Play Scrabble on the blockchain with unlimited grid and AI verification
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 p-4 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <h3 className="font-semibold">Join Anytime</h3>
            <p className="text-sm text-gray-400">Get 7 random tiles to start</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="font-semibold">Buy More Tiles</h3>
            <p className="text-sm text-gray-400">0.001 ETH per tile</p>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h3 className="font-semibold">AI Verified</h3>
            <p className="text-sm text-gray-400">Smart word validation</p>
          </div>
        </div>
        <center>
          <button
            onClick={() => navigate("/game")}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Play
          </button>
          <button
            onClick={() => navigate("/targetwords")}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Play Target Words
          </button>
           <button
            onClick={() => navigate("/stacktiles")}
            className="mt-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Play Stack Tiles
          </button>
        </center>
      </div>
    </div>
  )
}

export default Landing;