// Tunnels out of the Exotic Formation halls (0.1.242). Austin, 2026-11-10: "do these caves naturally connect to
// vanilla caves?" and his card: "Tunnels out". The world digs them with the hall (features/formation_tunnel_*.json):
// 2 to 4 a hall, evenly round it, each starting inside the hall's edge, winding out through the shell and on, level,
// through the stone, so it cuts into the vanilla caves it crosses. Where one meets the Deep Trench it opens into the
// sea (Austin: "it would be cool if a cave exited to a deep sea trench"); level, so the sea stays at its mouth. This file repeats where they
// run (whole-number arithmetic on the hall's square of the map, as the halls are), for /zoocraft:formation and the
// tests. No engine calls here.
import { BALANCE } from "../data/balance.js";
import { mod, formationIn } from "./formationRules.js";

const F = BALANCE.formation;
const T = F.tunnels;
const deg = (a) => (a * Math.PI) / 180;

/** The tunnels of the hall in square (i, j): [{ k, angle, from, to }] (`from`, `to`: blocks from the hall's middle along its line); undefined if no hall. */
export function tunnelsIn(i, j) {
  const f = formationIn(i, j);
  if (!f) return undefined;
  const n = 2 + mod(i * 13 + j * 7, 3);
  const base = mod(i * 29 + j * 43, 360);
  const out = [];
  for (let k = 0; k < n; k++) {
    const angle = base + (k * 360) / n;
    const co = Math.cos(deg(angle));
    const si = Math.sin(deg(angle));
    // it stops short of the edge of the hall's square of the map: every column only looks at its own square
    const lx = co > 0.05 ? ((i + 1) * F.cell - T.margin - f.x) / co : co < -0.05 ? (i * F.cell + T.margin - f.x) / co : 9999;
    const lz = si > 0.05 ? ((j + 1) * F.cell - T.margin - f.z) / si : si < -0.05 ? (j * F.cell + T.margin - f.z) / si : 9999;
    out.push({ k, angle, from: f.radius * T.start, to: Math.min(f.radius * T.edge + T.length, lx, lz) });
  }
  return out;
}

/** The middle of tunnel `t` of hall `f`, `along` blocks from the hall's middle: { x, y, z }, y its floor. */
export function tunnelAt(f, t, along) {
  const co = Math.cos(deg(t.angle));
  const si = Math.sin(deg(t.angle));
  const side = T.sway * Math.sin(deg(along * T.turn + t.k * 90));
  return {
    x: f.x + along * co - side * si,
    y: Math.floor(f.y - T.under + Math.max(0, along - f.radius * T.ramp) * T.slope),
    z: f.z + along * si + side * co,
  };
}

/** The far end of the hall's longest tunnel, a block short of it: where /zoocraft:formation sends a player to look. */
export function longestTunnelEnd(f, tunnels) {
  const t = tunnels.reduce((a, b) => (b.to - b.from > a.to - a.from ? b : a));
  const p = tunnelAt(f, t, t.to - 2);
  return { x: Math.floor(p.x), y: p.y, z: Math.floor(p.z), length: Math.round(t.to - t.from) };
}
