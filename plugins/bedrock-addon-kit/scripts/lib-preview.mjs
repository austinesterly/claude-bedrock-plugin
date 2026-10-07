// Helpers for fetch-updates.mjs: detailed Script API members with their doc comments, and
// the experimental sections of official changelogs. No dependencies.

// Map "Type.member" (and "class Type", "function f") -> { sig, doc, kind } from an index.d.ts.
export function apiDetails(dts) {
  const out = new Map();
  const lines = dts.split(/\r?\n/);
  let doc = [], inDoc = false, owner = null, ownerKind = null, pending = null;
  const firstSentence = (d) => {
    const txt = d.join(" ").split(/@(?:param|returns|throws|privilege|example|seeExample|earlyExecution|beta|rc)\b/)[0]
      .replace(/@remarks/g, "").replace(/\{@link\s+([^}]+)\}/g, "$1").replace(/\s+/g, " ").trim();
    const m = txt.match(/^(.{1,240}?[.!?])(\s|$)/);
    return m ? m[1] : txt.slice(0, 240);
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*\/\*\*/.test(l)) { inDoc = true; doc = []; if (/\*\/\s*$/.test(l)) inDoc = false; continue; }
    if (inDoc) { if (/\*\/\s*$/.test(l)) inDoc = false; else doc.push(l.replace(/^\s*\*\s?/, "")); continue; }
    if (pending) { pending.sig += " " + l.trim(); if (/[;{]\s*$/.test(l)) { out.set(pending.key, { ...pending, sig: pending.sig.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/,\s*\)/g, ")").replace(/\s*\{$/, "") }); pending = null; } continue; }
    const top = l.match(/^export\s+(?:declare\s+)?(class|interface|enum|function|const|type)\s+(\w+)/);
    if (top) {
      const [, kind, name] = top;
      if (["class", "interface", "enum"].includes(kind) && !/\}\s*$/.test(l)) { owner = name; ownerKind = kind; }
      const key = ["function", "const"].includes(kind) ? name : `${kind} ${name}`;
      out.set(key, { key, kind, sig: l.trim().replace(/^export\s+(declare\s+)?/, "").replace(/\s*\{$/, ""), doc: firstSentence(doc) });
      doc = []; continue;
    }
    if (/^\}/.test(l)) { owner = null; doc = []; continue; }
    if (owner) {
      const m = l.match(/^\s{4}(?:static\s+)?(?:readonly\s+)?(?:get\s+|set\s+)?(\w+)\??\s*[:(=<,]/) || (ownerKind === "enum" && l.match(/^\s{4}(\w+)\s*=/));
      if (m && m[1] !== "constructor" && !/^\s{4}private /.test(l)) {
        const key = `${owner}.${m[1]}`;
        const rec = { key, kind: "member", sig: l.trim(), doc: firstSentence(doc) };
        if (!/[;,]\s*$/.test(l)) pending = rec; else out.set(key, { ...rec, sig: rec.sig.replace(/[;,]$/, "") });
      }
      doc = [];
    }
  }
  return out;
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENT[e]).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

// Turn changelog HTML into Markdown lines (headings, nested bullets, inline code).
export function htmlToMd(html) {
  const out = [];
  let depth = 0, buf = "";
  const flush = () => { const t = decode(buf.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim(); if (t) out.push(`${"  ".repeat(Math.max(0, depth - 1))}${depth ? "- " : ""}${t}`); buf = ""; };
  const re = /<(\/?)(h[1-6]|ul|ol|li|p|code|br)\b[^>]*>|([^<]+)|<[^>]*>/g;
  let m, heading = 0;
  while ((m = re.exec(html))) {
    const [, close, tag, text] = m;
    if (text !== undefined) { buf += text; continue; }
    if (!tag) continue;
    if (tag === "code") { buf += "`"; continue; }
    if (/^h[1-6]$/.test(tag)) { if (!close) { flush(); heading = +tag[1]; } else { const t = decode(buf.replace(/<[^>]+>/g, "")).trim(); out.push("", `${"#".repeat(heading)} ${t}`, ""); buf = ""; heading = 0; } continue; }
    if (tag === "ul" || tag === "ol") { flush(); depth += close ? -1 : 1; continue; }
    if (tag === "li" || tag === "p" || tag === "br") { flush(); continue; }
  }
  flush();
  return out.map((l) => l.replace(/``/g, ""));
}

// Pull the experimental parts out of one changelog body: whole sections whose heading says
// "Experimental" (to the next heading of the same or higher level), plus bullets elsewhere that
// mention an experiment or beta (graduations, notes).
export function experimentalParts(html) {
  const md = htmlToMd(html);
  const sections = [], mentions = [];
  let cur = null;
  for (const l of md) {
    const h = l.match(/^(#{1,6}) (.+)/);
    if (h) {
      const lvl = h[1].length;
      if (cur && lvl <= cur.level) cur = null;
      if (!cur && /\bexperimental\b/i.test(h[2])) { cur = { title: h[2], level: lvl, lines: [] }; sections.push(cur); continue; }
      if (cur) { cur.lines.push(`${"#".repeat(Math.min(6, lvl - cur.level + 3))} ${h[2]}`); continue; }
      continue;
    }
    if (cur) cur.lines.push(l);
    else if (/experiment|\bbeta\b|upcoming creator features/i.test(l) && /^\s*- /.test(l) && !/aka\.ms|join or leave the beta|Preview and Beta|Preview or Beta|"Beta" instead/i.test(l)) mentions.push(l.trim());
  }
  return { sections: sections.map(({ title, lines }) => ({ title, lines })), mentions };
}
