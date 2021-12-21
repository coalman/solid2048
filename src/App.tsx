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
    </div>
  );
}
