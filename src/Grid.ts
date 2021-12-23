const sideLen = 4;

export type TileState =
  | { change: "none"; rank: number; index: number }
  | { change: "new"; rank: number; index: number }
  | { change: "merge"; rank: number; index: number }
  | { change: "move"; rank: number; startIndex: number; destIndex: number };

export type GridTile = null | number;

export type Grid = readonly GridTile[];

export function slideLeft(
  lineIndexes: readonly number[],
  grid: GridTile[]
): TileState[] {
  const states: TileState[] = [];

  let lastEmptyIndex: number | undefined = undefined;
  let lastTileEntry: readonly [number, NonNullable<GridTile>] | undefined =
    undefined;

  for (let i of lineIndexes) {
    const tile = grid[i];
    if (tile === null) {
      if (lastEmptyIndex === undefined) {
        lastEmptyIndex = i;
      }
    } else if (lastTileEntry && lastTileEntry[1] === tile) {
      grid[i] = null;
      if (lastEmptyIndex === undefined) {
        lastEmptyIndex = i;
      }
      grid[lastTileEntry[0]] = tile + 1;
      states.push({
        change: "move",
        rank: tile,
        startIndex: i,
        destIndex: lastTileEntry[0],
      });
      states.push({ change: "merge", rank: tile + 1, index: lastTileEntry[0] });
      lastTileEntry = undefined;
    } else if (lastEmptyIndex !== undefined) {
      grid[i] = null;
      grid[lastEmptyIndex] = tile;
      lastTileEntry = [lastEmptyIndex, tile];
      states.push({
        change: "move",
        rank: tile,
        startIndex: i,
        destIndex: lastEmptyIndex,
      });
      lastEmptyIndex = lineIndexes[lineIndexes.indexOf(lastEmptyIndex) + 1];
    } else {
      states.push({ change: "none", rank: tile, index: i });
      lastTileEntry = [i, tile];
    }
  }

  return states;
}

export type SlideDir = "left" | "right" | "up" | "down";

function* takeSteps(stepCount: number, stepStart: number, step: number) {
  let n = stepStart;
  for (let i = 0; i < stepCount; i++) {
    yield n;
    n += step;
  }
}

export const slide = (dir: SlideDir) => (grid: Grid) => {
  const states: TileState[] = [];
  const nextGrid = [...grid];

  let gridStart = 0;
  let gridStep: number;
  let lineStep: number;

  if (["left", "right"].includes(dir)) {
    gridStep = sideLen;
    lineStep = 1;
  } else {
    gridStep = 1;
    lineStep = sideLen;
  }

  if (["right", "down"].includes(dir)) {
    gridStep *= -1;
    lineStep *= -1;
    gridStart = sideLen * sideLen - 1;
  }

  for (let lineStart of takeSteps(sideLen, gridStart, gridStep)) {
    const line = Array.from(takeSteps(sideLen, lineStart, lineStep));
    const newStates = slideLeft(line, nextGrid);
    states.push(...newStates);
  }

  return { grid: nextGrid, states };
};

export function isSameGrid(a: Grid, b: Grid): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function findEmptyTiles(grid: Grid): number[] {
  const emptyTiles: number[] = [];
  for (let [i, tile] of grid.entries()) {
    if (!tile) {
      emptyTiles.push(i);
    }
  }
  return emptyTiles;
}

export function spawnTile(grid: GridTile[]): TileState {
  const emptyTiles = findEmptyTiles(grid);
  const spawnIndex = emptyTiles[0 | (Math.random() * emptyTiles.length)];
  const rank = Math.random() < 0.9 ? 1 : 2;
  grid[spawnIndex] = rank;
  return { change: "new", rank, index: spawnIndex };
}

function getAdjacentGridIndexes(index: number): number[] {
  const x = index % sideLen;
  const y = Math.floor(index / sideLen);

  const adjIndexes: number[] = [];

  for (let [dX, dY] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const) {
    const adjX = x + dX;
    const adjY = y + dY;

    if (adjX >= 0 && adjX < sideLen && adjY >= 0 && adjY < sideLen) {
      adjIndexes.push(adjX + sideLen * adjY);
    }
  }

  return adjIndexes;
}

export function isGameOver(grid: Grid): "win" | "lose" | false {
  if (grid.some((tile) => tile === 11)) {
    return "win";
  }

  for (let y = 0; y < sideLen; y++) {
    for (let x = 0; x < sideLen; x++) {
      const tileIndex = x + y * sideLen;
      const tile = grid[tileIndex];
      if (tile === null) {
        return false;
      }
      const adjTiles = getAdjacentGridIndexes(tileIndex).map(
        (adjIndex) => grid[adjIndex]
      );
      if (adjTiles.some((adjTile) => adjTile === tile)) {
        return false;
      }
    }
  }

  return "lose";
}
