import {
  onMount,
  onCleanup,
  createSignal,
  createEffect,
  Show,
  createMemo,
} from "solid-js";
import { isGameOver, isSameGrid, slide, spawnTile } from "./Grid";
import type { Grid, TileState, SlideDir } from "./Grid";

function BoardContainer(props: { cellRefs: HTMLElement[]; children?: any }) {
  const pos1D = [0, 1, 2, 3];
  const positions = pos1D.flatMap((row) =>
    pos1D.map((col) => [col, row] as const)
  );

  return (
    <div className="board">
      {positions.map((pos, index) => (
        <div
          className="cell"
          style={{
            "grid-column": `${pos[0] + 1} / span 1`,
            "grid-row": `${pos[1] + 1} / span 1`,
          }}
          ref={(el) => {
            props.cellRefs[index] = el;
          }}
        />
      ))}
      {props.children}
    </div>
  );
}

function initialState(): {
  readonly grid: Grid;
  readonly states: readonly TileState[];
} {
  return { grid: Array(16).fill(null), states: [] };
}

export default function Board(props: {
  onScore: (value: number) => void;
  onReset: () => void;
}) {
  let initState = initialState();
  {
    const storedState = localStorage.getItem("gameState");
    if (storedState !== null) {
      initState = JSON.parse(storedState);
    } else {
      onMount(() => {
        setStore((state) => {
          const grid = [...state.grid];
          return { ...state, grid, states: [spawnTile(grid), spawnTile(grid)] };
        });
      });
    }
  }

  function resetGame() {
    setStore((state) => {
      const grid = Array(16).fill(null);
      return { ...state, grid, states: [spawnTile(grid), spawnTile(grid)] };
    });
    props.onReset();
    setKeepGoing(false);
  }

  const [store, setStore] = createSignal(initState);
  const pauseGame = createMemo(() => isGameOver(store().grid));
  const [keepGoing, setKeepGoing] = createSignal(false);

  const cellRefs: HTMLElement[] = [];

  createEffect(() => {
    const currentState = store();
    const savedState: ReturnType<typeof initialState> = {
      ...currentState,
      states: currentState.states.map((value) => ({
        change: "none",
        rank: value.rank,
        index: value.change === "move" ? value.destIndex : value.index,
      })),
    };
    localStorage.setItem("gameState", JSON.stringify(savedState));
  });

  {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (pauseGame() === false || (pauseGame() === "win" && keepGoing())) {
        const move = getSlideDir(event.key);
        if (move) {
          event.preventDefault();
          setStore((state) => {
            let { grid, states } = slide(move)(state.grid);
            if (!isSameGrid(grid, state.grid)) {
              states.push(spawnTile(grid));
            }
            const scoreChange = states
              .filter((state) => state.change === "merge")
              .map((state) => getValue(state.rank))
              .reduce((value, sum) => sum + value, 0);
            props.onScore(scoreChange);
            return { ...state, grid, states };
          });
          return;
        }
      }
      if (event.key === "r") {
        resetGame();
      }
    }
    onMount(() => {
      document.addEventListener("keydown", onKeyDown);
    });
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown);
    });
  }

  return (
    <>
      <div className="reset-btn-container">
        <button type="button" className="reset-btn" onClick={resetGame}>
          New Game
        </button>
      </div>
      <BoardContainer cellRefs={cellRefs}>
        {store().states.map((state) => (
          <Tile cellRefs={cellRefs} state={state} />
        ))}
        <Show when={!keepGoing() && pauseGame() === "win"}>
          <PauseScreen>
            <p>You win!</p>
            <div style={{ display: "flex", gap: "40px" }}>
              <button
                type="button"
                className="reset-btn"
                onClick={() => setKeepGoing(() => true)}
              >
                Keep going
              </button>
              <button type="button" className="reset-btn" onClick={resetGame}>
                Try again
              </button>
            </div>
          </PauseScreen>
        </Show>
        <Show when={pauseGame() === "lose"}>
          <PauseScreen>
            <p>Game over!</p>
            <button type="button" className="reset-btn" onClick={resetGame}>
              Try again
            </button>
          </PauseScreen>
        </Show>
      </BoardContainer>
    </>
  );
}

function PauseScreen(props: { children?: any }) {
  return <div className="pause-screen">{props.children}</div>;
}

function Tile(props: { cellRefs: readonly HTMLElement[]; state: TileState }) {
  const [pos, setPos] = createSignal<[number, number] | null>(null);

  createEffect(() => {
    let index: number;
    if (props.state.change === "move") {
      index = props.state.startIndex;
      const destIndex = props.state.destIndex;
      requestAnimationFrame(() => {
        const cell = props.cellRefs[destIndex];
        setPos([cell.offsetLeft, cell.offsetTop]);
      });
    } else {
      index = props.state.index;
    }
    const cell = props.cellRefs[index];
    setPos([cell.offsetLeft, cell.offsetTop]);
  });

  function transform() {
    const p = pos();
    return p === null ? undefined : `translate(${p[0]}px, ${p[1]}px)`;
  }

  return (
    <Show when={pos() !== null}>
      <div className="tile-pos" style={{ transform: transform() }}>
        <div
          className={["tile", `tile-${props.state.change}`].join(" ")}
          data-rank={Math.min(props.state.rank, 12)}
        >
          {getValue(props.state.rank)}
        </div>
      </div>
    </Show>
  );
}

function getSlideDir(key: string): SlideDir | undefined {
  // NOTE: supports (arrow key, wasd, vim)
  switch (key) {
    case "ArrowLeft":
    case "a":
    case "h":
      return "left";
    case "ArrowRight":
    case "d":
    case "l":
      return "right";
    case "ArrowDown":
    case "s":
    case "j":
      return "down";
    case "ArrowUp":
    case "w":
    case "k":
      return "up";
  }
}

const values = [1];
function getValue(rank: number) {
  for (let i = values.length; i <= rank; i++) {
    values[i] = values[i - 1] * 2;
  }
  return values[rank];
}
