import ScoreBoard from "./ScoreBoard";
import Board from "./Board";
import { createSignal } from "solid-js";

export default function App() {
  const [score, setScore] = createSignal(0);
  return (
    <div id="app">
      <header>
        <h1>
          2048
          <a className="subtitle" href="https://www.solidjs.com/">
            w/solid-js
          </a>
        </h1>
        <ScoreBoard score={score()} bestScore={0} />
      </header>
      <main>
        <Board onScore={(value) => setScore((score) => score + value)} />
      </main>
      <p class="game-explanation">
        <strong class="important">How to play: </strong>
        Use your <strong>arrow keys </strong>
        to move the tiles. Tiles with the same number
        <strong> merge into one</strong> when they touch. Add them up to reach
        <strong> 2048!</strong>
      </p>
    </div>
  );
}
