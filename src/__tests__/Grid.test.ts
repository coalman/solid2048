import { slideLeft, slide } from "../Grid";
import type { GridTile, TileState } from "../Grid";

type RankGrid = readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number]
];

function createGrid(ranks: RankGrid): GridTile[] {
  return ranks.map(createRow).flat();
}

function createRow(ranks: readonly number[]): GridTile[] {
  return ranks.map((rank) => (rank === 0 ? undefined : rank));
}

function createGridFromStates(states: readonly TileState[], gridLength = 16) {
  const row: GridTile[] = Array(gridLength).fill(undefined);

  for (const state of states) {
    if (state.change === "move") {
      row[state.destIndex] = state.rank;
    } else {
      row[state.index] = state.rank;
    }
  }

  return row;
}

function createRowFromStates(states: readonly TileState[]) {
  return createGridFromStates(states, 4);
}

describe("slideLeft", () => {
  it.each([
    [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
    [
      [1, 2, 3, 4],
      [1, 2, 3, 4],
    ],
    [
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ],
    [
      [0, 2, 1, 0],
      [2, 1, 0, 0],
    ],
    [
      [2, 0, 3, 1],
      [2, 3, 1, 0],
    ],
    [
      [0, 1, 1, 0],
      [2, 0, 0, 0],
    ],
    [
      [0, 1, 1, 2],
      [2, 2, 0, 0],
    ],
    [
      [0, 1, 1, 1],
      [2, 1, 0, 0],
    ],
    [
      [1, 1, 1, 1],
      [2, 2, 0, 0],
    ],
    [
      [1, 1, 0, 1],
      [2, 1, 0, 0],
    ],
    [
      [3, 2, 2, 1],
      [3, 3, 1, 0],
    ],
  ])("should slide %s to %s", (row, expected) => {
    const gridRow = createRow(row);
    const states = slideLeft([0, 1, 2, 3], gridRow);
    const actual = createRowFromStates(states);
    const expectedRow = createRow(expected);
    expect(actual).toStrictEqual(expectedRow);
    expect(gridRow).toStrictEqual(expectedRow);
  });
});

describe("slide", () => {
  const grid = createGrid([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);

  it.each([
    [
      "right",
      [
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
      ],
    ],
    [
      "left",
      [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
      ],
    ],
    [
      "up",
      [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    [
      "down",
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
      ],
    ],
  ] as const)("should slide %s", (dir, expected) => {
    const result = slide(dir)(grid);
    const expectedGrid = createGrid(expected);
    expect(createGridFromStates(result.states)).toStrictEqual(expectedGrid);
    expect(result.grid).toStrictEqual(expectedGrid);
  });
});
