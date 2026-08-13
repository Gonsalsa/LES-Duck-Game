// 8x8 pixel-art sprites for Duck Escape. Each sprite is a set of rows plus a
// character -> color palette. Colors are literal here because this is raster
// artwork data, not UI styling.

export type Sprite = { rows: string[]; palette: Record<string, string> };

const s = (rows: string[], palette: Record<string, string>): Sprite => ({ rows, palette });

export const DUCK = s(
  [
    "...oo...",
    "..wwww..",
    ".wwwwww.",
    ".wkwwkw.",
    "wwwwwwww",
    "wwwwwwww",
    ".ww..ww.",
    ".oo..oo.",
  ],
  { o: "#ff9d24", w: "#f8f4dc", k: "#1b1b1b" },
);

export const DUCK_FLAP = s(
  [
    "...oo...",
    "..wwww..",
    "wwwwwwww",
    "wkwwwwkw",
    "wwwwwwww",
    ".wwwwww.",
    "..w..w..",
    ".oo..oo.",
  ],
  { o: "#ff9d24", w: "#f8f4dc", k: "#1b1b1b" },
);

export const BREAD = s(
  [
    "..bbbb..",
    ".bBBBBb.",
    "bBBBBBBb",
    "bBBBBBBb",
    "bBBBBBBb",
    ".bBBBBb.",
    "..bbbb..",
    "........",
  ],
  { b: "#8a5a2b", B: "#efc984" },
);

export const TRACTOR = s(
  [
    "..ggggg.",
    "..gyyyg.",
    ".ggggggg",
    "kgggggkk",
    "kkgggkkk",
    "kkgggkkk",
    ".kk...kk",
    "..k...k.",
  ],
  { g: "#2f9e44", y: "#ffe066", k: "#1b1b1b" },
);

export const DOG = s(
  [
    "........",
    "..kk..k.",
    ".kkkkkk.",
    ".kkkkkkk",
    "kkkkkkk.",
    ".k.k.k..",
    "........",
    "........",
  ],
  { k: "#7a4a1e" },
);

export const FARMER = s(
  [
    "..rrrr..",
    "..ssss..",
    "..sksk..",
    ".bbbbbb.",
    "sbbbbbbs",
    "..bbbb..",
    "..b..b..",
    "..d..d..",
  ],
  { r: "#c92a2a", s: "#f2c49b", k: "#1b1b1b", b: "#1864ab", d: "#495057" },
);

export const TREE = s(
  [
    "...gg...",
    "..gggg..",
    ".gggggg.",
    "gggggggg",
    ".gggggg.",
    "...tt...",
    "...tt...",
    "...tt...",
  ],
  { g: "#2b8a3e", t: "#6b3f1d" },
);

export const ROCK = s(
  [
    "........",
    "..aaa...",
    ".aaaaaa.",
    "aaaaaaaa",
    "aaaaaaaa",
    ".aaaaaa.",
    "........",
    "........",
  ],
  { a: "#adb5bd" },
);

export const HAY = s(
  [
    "........",
    ".yyyyyy.",
    "yYyyYyyY",
    "yyYyyyYy",
    "yYyyYyyy",
    ".yyyyyy.",
    "........",
    "........",
  ],
  { y: "#e0b256", Y: "#b8862f" },
);

export const FENCE = s(
  [
    "........",
    "wwwwwwww",
    ".w....w.",
    "wwwwwwww",
    ".w....w.",
    ".w....w.",
    "........",
    "........",
  ],
  { w: "#a9754a" },
);

export const PUDDLE = s(
  [
    "........",
    "..cccc..",
    ".cccccc.",
    "cccCcccc",
    ".cccccc.",
    "..cccc..",
    "........",
    "........",
  ],
  { c: "#3f8fd0", C: "#a5d8ff" },
);

export const CAR = s(
  [
    "..rrrr..",
    ".rrrrrr.",
    ".rccccr.",
    "rrrrrrrr",
    "rrrrrrrr",
    ".rrrrrr.",
    "k......k",
    "........",
  ],
  { r: "#e03131", c: "#a5d8ff", k: "#1b1b1b" },
);

export const TRUCK = s(
  [
    ".pppppp.",
    ".pccccp.",
    "pppppppp",
    "pppppppp",
    "pppppppp",
    "pppppppp",
    "k.pppp.k",
    "k......k",
  ],
  { p: "#4c6ef5", c: "#a5d8ff", k: "#1b1b1b" },
);

export const BOAR = s(
  [
    "........",
    "..kkkk..",
    ".kkkkkkw",
    "kkkkkkkw",
    "kkkkkkk.",
    ".k.kk.k.",
    "........",
    "........",
  ],
  { k: "#4a3728", w: "#e9ecef" },
);

export const BOSS = s(
  [
    "...rr...",
    "..ssss..",
    ".gggggg.",
    "ggyyyygg",
    "gggggggg",
    "kkggggkk",
    "kkkggkkk",
    "kkk..kkk",
  ],
  { r: "#c92a2a", s: "#f2c49b", g: "#2f9e44", y: "#ffe066", k: "#1b1b1b" },
);

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const rows = sprite.rows;
  const px = w / 8;
  const py = h / rows.length;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? "";
    for (let c = 0; c < row.length; c++) {
      const color = sprite.palette[row[c] ?? "."];

      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x + c * px), Math.floor(y + r * py), Math.ceil(px), Math.ceil(py));
    }
  }
}
