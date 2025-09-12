import { useState } from 'react';
import { Target } from 'lucide-react';

function EditTargetWords({ changeTargetWords } : { changeTargetWords: Function}) {
  const [newWord1, setNewWord1] = useState<string>();
  const [newWord2, setNewWord2] = useState<string>();
  const [newWord3, setNewWord3] = useState<string>();

  return (
    <div className="bg-orange-900/30 border border-orange-400 backdrop-blur rounded-lg p-6 mb-6 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-orange-400" />
        <h2 className="text-xl font-semibold text-orange-400">Owner Controls</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-orange-200">Update the target words that players need to create:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-orange-300 mb-1">
              Target Word 1
            </label>
            <input
              type="text"
              value={newWord1}
              onChange={(e) => setNewWord1(e.target.value)}
              placeholder="Enter word 1"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-300 mb-1">
              Target Word 2
            </label>
            <input
              type="text"
              value={newWord2}
              onChange={(e) => setNewWord2(e.target.value)}
              placeholder="Enter word 2"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-300 mb-1">
              Target Word 3
            </label>
            <input
              type="text"
              value={newWord3}
              onChange={(e) => setNewWord3(e.target.value)}
              placeholder="Enter word 3"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              maxLength={10}
            />
          </div>
        </div>
        <button
          onClick={() => changeTargetWords(newWord1, newWord2, newWord3)}
          className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Target size={16} />
          Update Target Words
        </button>
      </div>
    </div>
  )
}

export default EditTargetWords