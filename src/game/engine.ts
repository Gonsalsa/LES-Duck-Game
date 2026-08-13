import { sfx } from "./audio";
import {
  BOAR,
  BOSS,
  BREAD,
  CAR,
  DOG,
  DUCK,
  DUCK_FLAP,
  FARMER,
  FENCE,
  HAY,
  PUDDLE,
  ROCK,
  TRACTOR,
  TREE,
  TRUCK,
  drawSprite,
  type Sprite,
} from "./sprites";

export const W = 480;
export const H = 640;

export type Kind =
  | "bread"
  | "tractor"
  | "fence"
  | "hay"
  | "puddle"
  | "rock"
  | "tree"
  | "car"
  | "truck"
  | "dog"
  | "farmer"
  | "boar"
  | "boss"
  | "bale";

type Ent = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  ttl: number;
  t: number;
};

export type Phase = "start" | "playing" | "dead" | "over";

export type Snapshot = {
  phase: Phase;
  score: number;
  lives: number;
  level: number;
  levelName: string;
  banner: string | null;
  high: number;
};

const LEVELS = [
  { name: "THE FARM", until: 900, bg: "#4f8f3a", stripe: "#468032" },
  { name: "THE ROAD", until: 2000, bg: "#3d3d47", stripe: "#33333c" },
  { name: "THE FOREST", until: 3400, bg: "#1f4025", stripe: "#1a3620" },
  { name: "FREEDOM?", until: Infinity, bg: "#2b3b63", stripe: "#243357" },
] as const;

const SPRITES: Record<Kind, Sprite> = {
  bread: BREAD,
  tractor: TRACTOR,
  fence: FENCE,
  hay: HAY,
  puddle: PUDDLE,
  rock: ROCK,
  tree: TREE,
  car: CAR,
  truck: TRUCK,
  dog: DOG,
  farmer: FARMER,
  boar: BOAR,
  boss: BOSS,
  bale: HAY,
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

export class Game {
  duck = { x: W / 2 - 20, y: H - 140, w: 40, h: 40 };
  ents: Ent[] = [];
  keys = new Set<string>();
  distance = 0;
  breadScore = 0;
  lives = 3;
  phase: Phase = "start";
  invuln = 0;
  banner: string | null = null;
  bannerT = 0;
  spawnT = 0;
  breadT = 0;
  chaserT = 4;
  bossSpawned = false;
  bossShotT = 0;
  time = 0;
  high = 0;
  shake = 0;
  onChange: (s: Snapshot) => void = () => {};

  constructor(high: number) {
    this.high = high;
  }

  get level() {
    return LEVELS.findIndex((l) => this.distance < l.until) + 1 || 4;
  }

  get score() {
    return Math.floor(this.distance) + this.breadScore;
  }

  snapshot(): Snapshot {
    const idx = Math.min(this.level - 1, LEVELS.length - 1);
    return {
      phase: this.phase,
      score: this.score,
      lives: this.lives,
      level: this.level,
      levelName: LEVELS[idx]?.name ?? "",
      banner: this.banner,
      high: Math.max(this.high, this.score),
    };
  }

  emit() {
    this.onChange(this.snapshot());
  }

  start() {
    this.duck = { x: W / 2 - 20, y: H - 140, w: 40, h: 40 };
    this.ents = [];
    this.distance = 0;
    this.breadScore = 0;
    this.lives = 3;
    this.invuln = 1;
    this.spawnT = 0.6;
    this.breadT = 1;
    this.chaserT = 5;
    this.bossSpawned = false;
    this.phase = "playing";
    this.setBanner("LEVEL 1 — THE FARM");
    sfx.start();
    this.emit();
  }

  setBanner(text: string) {
    this.banner = text;
    this.bannerT = 2.2;
  }

  get speed() {
    return Math.min(120 + this.distance * 0.09, 400);
  }

  update(dt: number) {
    this.time += dt;
    if (this.phase !== "playing") return;

    const prevLevel = this.level;
    this.distance += (this.speed * dt) / 6;
    if (this.level !== prevLevel) {
      const nm = LEVELS[Math.min(this.level - 1, 3)]?.name ?? "";
      this.setBanner(`LEVEL ${this.level} — ${nm}`);
      sfx.level();
    }

    // duck movement
    const k = this.keys;
    const left = k.has("a") || k.has("arrowleft");
    const right = k.has("d") || k.has("arrowright");
    const up = k.has("w") || k.has("arrowup");
    const down = k.has("s") || k.has("arrowdown");
    const sp = 260 * dt;
    if (left) this.duck.x -= sp;
    if (right) this.duck.x += sp;
    if (up) this.duck.y -= sp;
    if (down) this.duck.y += sp;
    this.duck.x = Math.max(4, Math.min(W - this.duck.w - 4, this.duck.x));
    this.duck.y = Math.max(60, Math.min(H - this.duck.h - 10, this.duck.y));

    if (this.invuln > 0) this.invuln -= dt;
    if (this.bannerT > 0) {
      this.bannerT -= dt;
      if (this.bannerT <= 0) this.banner = null;
    }
    if (this.shake > 0) this.shake -= dt;

    this.spawnObstacles(dt);
    this.moveEnts(dt);
    this.collide();
    this.emit();
  }

  spawnObstacles(dt: number) {
    const lvl = this.level;
    this.spawnT -= dt;
    this.breadT -= dt;
    this.chaserT -= dt;

    if (this.spawnT <= 0) {
      this.spawnT = Math.max(0.28, rand(0.7, 1.1) - this.distance * 0.00012);
      const kind: Kind =
        lvl === 1
          ? pick(["tractor", "fence", "hay", "puddle", "fence", "hay"] as const)
          : lvl === 2
            ? pick(["car", "truck", "car", "car", "puddle"] as const)
            : lvl === 3
              ? pick(["tree", "rock", "boar", "tree", "rock"] as const)
              : pick(["bale", "rock", "hay", "tree"] as const);
      this.ents.push(this.makeEnt(kind));
    }

    if (this.breadT <= 0) {
      this.breadT = rand(1.4, 2.6);
      this.ents.push({
        kind: "bread",
        x: rand(20, W - 50),
        y: -30,
        w: 26,
        h: 26,
        vx: 0,
        vy: 0,
        ttl: 20,
        t: 0,
      });
    }

    if (this.chaserT <= 0 && (lvl === 1 || lvl === 4)) {
      this.chaserT = rand(7, 11);
      const isDog = Math.random() < 0.6;
      this.ents.push({
        kind: isDog ? "dog" : "farmer",
        x: rand(30, W - 70),
        y: -40,
        w: isDog ? 40 : 44,
        h: isDog ? 34 : 52,
        vx: 0,
        vy: 0,
        ttl: isDog ? 5.5 : 8,
        t: 0,
      });
      sfx.quack();
    } else if (this.chaserT <= 0) {
      this.chaserT = rand(6, 10);
      this.ents.push({
        kind: "dog",
        x: rand(30, W - 70),
        y: -40,
        w: 40,
        h: 34,
        vx: 0,
        vy: 0,
        ttl: 5,
        t: 0,
      });
    }

    if (lvl === 4 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.setBanner("🚨 FARMER BOSS INCOMING");
      this.ents.push({
        kind: "boss",
        x: W / 2 - 90,
        y: 40,
        w: 180,
        h: 150,
        vx: 110,
        vy: 0,
        ttl: Infinity,
        t: 0,
      });
      sfx.over();
    }
  }

  makeEnt(kind: Kind): Ent {
    const sizes: Partial<Record<Kind, [number, number]>> = {
      tractor: [70, 70],
      car: [46, 68],
      truck: [56, 92],
      fence: [110, 30],
      hay: [50, 50],
      puddle: [64, 34],
      rock: [44, 40],
      tree: [64, 76],
      boar: [50, 40],
      bale: [46, 46],
    };
    const [w, h] = sizes[kind] ?? [40, 40];
    const moving = kind === "tractor" || kind === "car" || kind === "truck" || kind === "boar";
    return {
      kind,
      x: rand(8, W - w - 8),
      y: -h - 10,
      w,
      h,
      vx: moving ? rand(-70, 70) : 0,
      vy: kind === "car" || kind === "truck" ? rand(40, 140) : 0,
      ttl: 30,
      t: 0,
    };
  }

  moveEnts(dt: number) {
    const scroll = this.speed;
    for (const e of this.ents) {
      e.t += dt;
      e.ttl -= dt;
      if (e.kind === "dog" || e.kind === "farmer") {
        const chase = e.kind === "dog" ? 170 : 120;
        const dx = this.duck.x - e.x;
        const dy = this.duck.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        e.x += (dx / d) * chase * dt;
        e.y += (dy / d) * chase * dt;
        if (e.ttl <= 0) e.y -= 260 * dt;
      } else if (e.kind === "boss") {
        e.x += e.vx * dt;
        if (e.x < 0 || e.x + e.w > W) e.vx *= -1;
        e.y = 40 + Math.sin(e.t * 1.4) * 18;
        this.bossShotT -= dt;
        if (this.bossShotT <= 0) {
          this.bossShotT = Math.max(0.4, 1 - this.distance * 0.00005);
          this.ents.push({
            kind: "bale",
            x: e.x + e.w / 2 - 20,
            y: e.y + e.h - 10,
            w: 40,
            h: 40,
            vx: rand(-40, 40),
            vy: 220,
            ttl: 12,
            t: 0,
          });
        }
      } else {
        e.x += e.vx * dt;
        e.y += (scroll + e.vy) * dt;
        if (e.x < 0 || e.x + e.w > W) e.vx *= -1;
      }
    }
    this.ents = this.ents.filter(
      (e) => e.y < H + 120 && (e.kind === "boss" || e.ttl > -3) && e.y > -300,
    );
  }

  hits(e: Ent) {
    const d = this.duck;
    const pad = 6;
    return (
      d.x + pad < e.x + e.w &&
      d.x + d.w - pad > e.x &&
      d.y + pad < e.y + e.h &&
      d.y + d.h - pad > e.y
    );
  }

  collide() {
    for (const e of this.ents) {
      if (!this.hits(e)) continue;
      if (e.kind === "bread") {
        e.ttl = -10;
        e.y = H + 999;
        this.breadScore += 10;
        sfx.pickup();
        continue;
      }
      if (this.invuln > 0) continue;
      this.lives -= 1;
      this.invuln = 1.8;
      this.shake = 0.35;
      sfx.hit();
      if (e.kind !== "boss") {
        e.y = H + 999;
        e.ttl = -10;
      }
      if (this.lives <= 0) {
        this.phase = "over";
        this.high = Math.max(this.high, this.score);
        sfx.over();
        this.emit();
        return;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const idx = Math.min(this.level - 1, LEVELS.length - 1);
    const lvl = LEVELS[idx] ?? LEVELS[0];
    ctx.save();
    if (this.shake > 0) {
      ctx.translate(rand(-4, 4), rand(-4, 4));
    }
    ctx.fillStyle = lvl.bg;
    ctx.fillRect(-10, -10, W + 20, H + 20);

    // scrolling ground stripes
    const off = (this.distance * 6) % 80;
    ctx.fillStyle = lvl.stripe;
    for (let y = -80 + off; y < H + 80; y += 80) {
      ctx.fillRect(0, y, W, 40);
    }
    if (this.level === 2) {
      ctx.fillStyle = "#ffe066";
      for (const lane of [W * 0.25, W * 0.5, W * 0.75]) {
        for (let y = -60 + off; y < H + 60; y += 80) {
          ctx.fillRect(lane - 4, y, 8, 44);
        }
      }
    }

    for (const e of this.ents) {
      if (e.y > H + 100) continue;
      const sprite = SPRITES[e.kind];
      drawSprite(ctx, sprite, e.x, e.y, e.w, e.h);
    }

    if (this.phase === "playing" || this.phase === "over") {
      const blink = this.invuln > 0 && Math.floor(this.time * 12) % 2 === 0;
      if (!blink) {
        const flap = Math.floor(this.time * 8) % 2 === 0 ? DUCK : DUCK_FLAP;
        drawSprite(ctx, flap, this.duck.x, this.duck.y, this.duck.w, this.duck.h);
      }
    }
    ctx.restore();
  }
}
