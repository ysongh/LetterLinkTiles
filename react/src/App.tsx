import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { ConnectMenu } from "./components/ConnectMenu";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import TargetWords from "./pages/TargetWords";
import StackTilesGame from "./pages/StackTiles";
import LetterQuest from "./pages/LetterQuest";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-green-700 text-white">
        <ConnectMenu />
        <Routes>
          <Route
            path="/letterquest"
            element={<LetterQuest />} />
          <Route
            path="/stacktiles"
            element={<StackTilesGame />} />
          <Route
            path="/targetwords"
            element={<TargetWords />} />
          <Route
            path="/game"
            element={<Game />} />
          <Route
            path="/"
            element={<Landing />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
