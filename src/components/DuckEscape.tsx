import { useCallback, useEffect, useRef, useState } from "react";
import { Game, H, W, type Snapshot } from "@/game/engine";

const HIGH_KEY = "duck-escape-high";

export default function DuckEscape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const [state, setState] = useState<Snapshot>({
    phase: "start",
    score: 0,
    lives: 3,
    level: 1,
    levelName: "THE FARM",
    banner: null,
    high: 0,
  });

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(HIGH_KEY) ?? 0);
    const game = new Game(Number.isFinite(stored) ? stored : 0);
    gameRef.current = game;
    game.onChange = setState;
    game.emit();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      game.update(dt);
      if (ctx) game.draw(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key))
        e.preventDefault();
      game.keys.add(key);
      if (key === " " || key === "enter") {
        if (game.phase !== "playing") game.start();
      }
    };
    const up = (e: KeyboardEvent) => game.keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (state.phase === "over") window.localStorage.setItem(HIGH_KEY, String(state.high));
  }, [state.phase, state.high]);

  const start = useCallback(() => gameRef.current?.start(), []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <div className="w-full max-w-[480px]">
        <div className="crt-frame relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block h-auto w-full [image-rendering:pixelated]"
          />
          <div className="scanlines pointer-events-none absolute inset-0" />

          {/* HUD */}
          {state.phase === "playing" && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-overlay p-3 font-pixel text-[11px] text-arcade">
              <div className="flex gap-1 text-base leading-none">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < state.lives ? "text-heart" : "opacity-25"}>
                    ♥
                  </span>
                ))}
              </div>
              <div className="text-center leading-relaxed">
                <div>SCORE {state.score.toLocaleString()}</div>
                <div className="text-arcade-dim">HI {state.high.toLocaleString()}</div>
              </div>
              <div className="text-right leading-relaxed">
                <div>LVL {state.level}</div>
                <div className="text-arcade-dim">{state.levelName}</div>
              </div>
            </div>
          )}

          {state.banner && state.phase === "playing" && (
            <div className="pointer-events-none absolute inset-x-0 top-1/3 text-center font-pixel text-sm text-arcade [text-shadow:3px_3px_0_rgba(0,0,0,0.6)] animate-blink">
              {state.banner}
            </div>
          )}

          {/* START SCREEN */}
          {state.phase === "start" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-overlay px-6 text-center">
              <div className="text-5xl">🦆</div>
              <h1 className="font-pixel text-2xl leading-tight text-arcade [text-shadow:4px_4px_0_var(--shadow-hard)]">
                DUCK
                <br />
                ESCAPE
              </h1>
              <p className="font-pixel text-[10px] leading-relaxed text-arcade-dim">
                THE FARM WANTS YOU BACK. RUN.
              </p>
              <button onClick={start} className="arcade-btn font-pixel text-xs">
                [ START GAME ]
              </button>
              <p className="font-pixel text-[9px] leading-relaxed text-arcade-dim animate-blink">
                WASD / ARROW KEYS TO MOVE
              </p>
            </div>
          )}

          {/* GAME OVER */}
          {state.phase === "over" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-overlay px-6 text-center">
              <div className="text-4xl">💀</div>
              <h2 className="font-pixel text-2xl text-danger [text-shadow:4px_4px_0_var(--shadow-hard)]">
                GAME OVER
              </h2>
              <p className="font-pixel text-[10px] text-arcade-dim">THE FARM GOT YOU.</p>
              <div className="font-pixel text-[11px] leading-loose text-arcade">
                <div>SCORE: {state.score.toLocaleString()}</div>
                <div className="text-arcade-dim">HIGH SCORE: {state.high.toLocaleString()}</div>
              </div>
              <button onClick={start} className="arcade-btn font-pixel text-xs">
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>

      <ul className="grid max-w-[480px] grid-cols-2 gap-x-6 gap-y-1 font-pixel text-[9px] leading-relaxed text-muted-foreground">
        <li>🍞 BREAD +10</li>
        <li>🚜 TRACTORS HURT</li>
        <li>🐕 DOGS CHASE</li>
        <li>🧑‍🌾 FARMER CATCHES</li>
        <li>❤️ 3 LIVES</li>
        <li>⚡ IT GETS FASTER</li>
      </ul>
    </div>
  );
}
