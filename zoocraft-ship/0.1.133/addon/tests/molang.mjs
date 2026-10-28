// A small Molang reader for the tests (0.1.133): the part of Molang the Deep Trench's world-generation features use.
// Numbers, temp variables (t., temp., v., variable.), + - * /, comparisons, ! && ||, ?: and the bare "cond ? { ... }",
// brace blocks, statements with ";", return, and calls (math.*, query.*), the queries supplied by the caller.
// compile(src) -> (ctx) => number, where ctx = { variable: { worldx, ... }, query: { name(...args) } }.

const MATH = {
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sqrt: Math.sqrt,
  pow: Math.pow,
  min: Math.min,
  max: Math.max,
  clamp: (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
  mod: (a, b) => a % b,
  sin: (deg) => Math.sin((deg * Math.PI) / 180),
  cos: (deg) => Math.cos((deg * Math.PI) / 180),
};

function tokens(src) {
  const out = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([A-Za-z_][A-Za-z_0-9]*(?:\.[A-Za-z_][A-Za-z_0-9]*)*)|('[^']*')|(<=|>=|==|!=|&&|\|\||[-+*/()<>!?:;,{}=]))/y;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < src.length) {
    if (/^\s*$/.test(src.slice(re.lastIndex))) break;
    const at = re.lastIndex;
    m = re.exec(src);
    if (!m) throw new Error(`Molang: can't read at ${at}: ${src.slice(at, at + 30)}`);
    if (m[1] !== undefined) out.push({ k: "num", v: Number(m[1]) });
    else if (m[2] !== undefined) out.push({ k: "name", v: m[2] });
    else if (m[3] !== undefined) out.push({ k: "str", v: m[3].slice(1, -1) });
    else out.push({ k: "op", v: m[4] });
  }
  return out;
}

class Return {
  constructor(v) {
    this.v = v;
  }
}

const VAR = /^(t|temp|v|variable)\.(\w+)$/;

export function compile(src) {
  const ts = tokens(src);
  let i = 0;
  const peek = (v) => ts[i] && ts[i].k === "op" && ts[i].v === v;
  const eat = (v) => {
    if (!peek(v)) throw new Error(`Molang: expected ${v} at token ${i} (${JSON.stringify(ts[i])})`);
    i++;
  };
  // A variable's scope: t./temp. are one, v./variable. another (variable.worldx etc. come from ctx.variable).
  const key = (name) => {
    const m = VAR.exec(name);
    return m[1] === "t" || m[1] === "temp" ? `t.${m[2]}` : `v.${m[2]}`;
  };
  function program(end) {
    const stmts = [];
    while (i < ts.length && !peek(end)) {
      if (peek(";")) {
        i++;
        continue;
      }
      stmts.push(statement());
      if (!peek(end) && i < ts.length) eat(";");
    }
    return (c) => {
      let last = 0;
      for (const s of stmts) last = s(c);
      return last;
    };
  }
  function statement() {
    if (ts[i].k === "name" && ts[i].v === "return") {
      i++;
      const e = expr();
      return (c) => {
        throw new Return(e(c));
      };
    }
    if (ts[i].k === "name" && VAR.test(ts[i].v) && ts[i + 1]?.k === "op" && ts[i + 1].v === "=") {
      const k = key(ts[i].v);
      i += 2;
      const e = expr();
      return (c) => (c.vars[k] = e(c));
    }
    return expr();
  }
  function block() {
    eat("{");
    const p = program("}");
    eat("}");
    return p;
  }
  function expr() {
    const cond = or();
    if (!peek("?")) return cond;
    i++;
    const yes = peek("{") ? block() : expr();
    if (!peek(":")) return (c) => (cond(c) ? (yes(c), 0) : 0);
    i++;
    const no = peek("{") ? block() : expr();
    return (c) => (cond(c) ? yes(c) : no(c));
  }
  function or() {
    let l = and();
    while (peek("||")) {
      i++;
      const a = l, b = and();
      l = (c) => (a(c) || b(c) ? 1 : 0);
    }
    return l;
  }
  function and() {
    let l = cmp();
    while (peek("&&")) {
      i++;
      const a = l, b = cmp();
      l = (c) => (a(c) && b(c) ? 1 : 0);
    }
    return l;
  }
  function cmp() {
    const l = add();
    for (const op of ["<=", ">=", "==", "!=", "<", ">"]) {
      if (peek(op)) {
        i++;
        const r = add();
        const f = { "<=": (a, b) => a <= b, ">=": (a, b) => a >= b, "==": (a, b) => a === b, "!=": (a, b) => a !== b, "<": (a, b) => a < b, ">": (a, b) => a > b }[op];
        return (c) => (f(l(c), r(c)) ? 1 : 0);
      }
    }
    return l;
  }
  function add() {
    let l = mul();
    while (peek("+") || peek("-")) {
      const op = ts[i++].v;
      const a = l, b = mul();
      l = op === "+" ? (c) => a(c) + b(c) : (c) => a(c) - b(c);
    }
    return l;
  }
  function mul() {
    let l = unary();
    while (peek("*") || peek("/")) {
      const op = ts[i++].v;
      const a = l, b = unary();
      l = op === "*" ? (c) => a(c) * b(c) : (c) => a(c) / b(c);
    }
    return l;
  }
  function unary() {
    if (peek("-")) {
      i++;
      const e = unary();
      return (c) => -e(c);
    }
    if (peek("!")) {
      i++;
      const e = unary();
      return (c) => (e(c) ? 0 : 1);
    }
    return primary();
  }
  function primary() {
    const t = ts[i];
    if (!t) throw new Error("Molang: ran out");
    if (t.k === "num") {
      i++;
      return () => t.v;
    }
    if (t.k === "str") {
      i++;
      return () => t.v;
    }
    if (peek("(")) {
      i++;
      const e = expr();
      eat(")");
      return e;
    }
    if (t.k === "name") {
      i++;
      if (peek("(")) {
        i++;
        const args = [];
        while (!peek(")")) {
          args.push(expr());
          if (!peek(")")) eat(",");
        }
        i++;
        const [ns, fn] = [t.v.slice(0, t.v.indexOf(".")), t.v.slice(t.v.indexOf(".") + 1)];
        if (ns === "math") {
          const f = MATH[fn];
          if (!f) throw new Error(`Molang: no math.${fn}`);
          return (c) => f(...args.map((a) => a(c)));
        }
        if (ns === "query" || ns === "q") return (c) => {
          const f = c.query[fn];
          if (!f) throw new Error(`Molang: no query.${fn} given`);
          return f(...args.map((a) => a(c)));
        };
        throw new Error(`Molang: unknown call ${t.v}`);
      }
      if (VAR.test(t.v)) {
        const k = key(t.v);
        const bare = t.v.slice(t.v.indexOf(".") + 1);
        return (c) => {
          if (k in c.vars) return c.vars[k];
          if (k.startsWith("v.") && bare in c.variable) return c.variable[bare];
          throw new Error(`Molang: ${t.v} read before it is set`);
        };
      }
      throw new Error(`Molang: unknown name ${t.v}`);
    }
    throw new Error(`Molang: unexpected ${JSON.stringify(t)}`);
  }
  const prog = program(undefined);
  if (i < ts.length) throw new Error(`Molang: left over at token ${i}`);
  return (ctx) => {
    const c = { vars: {}, variable: ctx.variable ?? {}, query: ctx.query ?? {} };
    try {
      return prog(c);
    } catch (e) {
      if (e instanceof Return) return e.v;
      throw e;
    }
  };
}
