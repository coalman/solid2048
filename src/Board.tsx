import {
  onMount,
  onCleanup,
  createSignal,
  createEffect,
  Show,
  For,
} from "solid-js";
import { createStore } from "solid-js/store";
import { isGameOver, isSameGrid, slide, SlideDir, spawnTile } from "./Grid";
import type { Grid, TileState } from "./Grid";

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
  return { grid: Array(16).fill(undefined), states: [] };
}

export default function Board(props: { onScore: (value: number) => void }) {
  const [store, setStore] = createStore(initialState());
  const cellRefs: HTMLElement[] = [];

  onMount(() => {
    setStore((state) => {
      const grid = [...state.grid];
      return { ...state, grid, states: [spawnTile(grid), spawnTile(grid)] };
    });
  });

  {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      {
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
            const result = isGameOver(grid);
            if (result === "win") {
              console.log("win");
            } else if (result === "lose") {
              console.log("lose");
            }
            return { ...state, grid, states };
          });
          return;
        }
      }
      if (event.key === "r") {
        setStore((state) => {
          const grid = Array(16);
          return { ...state, grid, states: [spawnTile(grid), spawnTile(grid)] };
        });
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
    <BoardContainer cellRefs={cellRefs}>
      {store.states.map((state) => (
        <Tile cellRefs={cellRefs} state={state} />
      ))}
    </BoardContainer>
  );
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
          data-rank={props.state.rank}
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
