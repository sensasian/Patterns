"use client";

import { useMemo, useState } from "react";

type NodeKind = "concept" | "pattern" | "hypothesis" | "evidence" | "contradiction" | "source";
type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  eyebrow?: string;
  meta?: string;
  hidden?: boolean;
};

const baseNodes: GraphNode[] = [
  { id: "altered", label: "Altered states", kind: "concept", x: 47, y: 43, eyebrow: "Core concept", meta: "63 evidence items" },
  { id: "fasting", label: "Fasting", kind: "concept", x: 21, y: 25, eyebrow: "Practice", meta: "22 sources" },
  { id: "breath", label: "Rhythmic breathing", kind: "concept", x: 23, y: 58, eyebrow: "Practice", meta: "17 sources" },
  { id: "dark", label: "Darkness", kind: "concept", x: 43, y: 76, eyebrow: "Condition", meta: "14 sources" },
  { id: "pattern27", label: "Fasting + isolation + rhythmic breathing", kind: "pattern", x: 48, y: 20, eyebrow: "Pattern 027", meta: "High strength" },
  { id: "hypoxia", label: "Hypoxia / hypocapnia", kind: "hypothesis", x: 74, y: 29, eyebrow: "Hypothesis", meta: "Low–moderate" },
  { id: "botanical", label: "Botanical exposure", kind: "hypothesis", x: 76, y: 62, eyebrow: "Alternative", meta: "Contested" },
  { id: "evidence1", label: "Vision fast account", kind: "evidence", x: 14, y: 78, eyebrow: "Evidence", meta: "c. 420 BCE · Greece" },
  { id: "contra", label: "Breathwork absent", kind: "contradiction", x: 65, y: 82, eyebrow: "Contradiction", meta: "8 source records" },
  { id: "source", label: "Ritual purification survey", kind: "source", x: 87, y: 84, eyebrow: "Source", meta: "Kline, 1987 · p. 112" },
];

const edges = [
  ["fasting", "pattern27"], ["breath", "pattern27"], ["pattern27", "altered"], ["breath", "altered"],
  ["dark", "altered"], ["pattern27", "hypoxia"], ["altered", "botanical"], ["evidence1", "fasting"],
  ["contra", "pattern27"], ["source", "contra"], ["hypoxia", "altered"], ["botanical", "contra"],
];

const details: Record<string, { title: string; summary: string; tags: string[] }> = {
  altered: { title: "Altered states", summary: "Reports of visionary, dissociative or ecstatic experience. The label preserves the source wording and does not assume a biological mechanism.", tags: ["63 evidence items", "29 independent groups", "6 regions"] },
  fasting: { title: "Fasting", summary: "Food restriction lasting from one day to several weeks, recorded as preparation, purification or ordeal.", tags: ["22 sources", "11 cultural groups", "1,800-year span"] },
  breath: { title: "Rhythmic breathing", summary: "Deliberate repeated breathing patterns, including rapid respiration and extended breath holds.", tags: ["17 sources", "12 direct observations", "5 inferred"] },
  dark: { title: "Darkness", summary: "Ritual confinement in caves, chambers or unlit rooms, often alongside reduced social and sensory input.", tags: ["14 sources", "9 independent groups", "4 regions"] },
  pattern27: { title: "Fasting + isolation + rhythmic breathing", summary: "This sequence recurs across independent accounts more often than expected in the corpus. It is an observed pattern—not a causal claim.", tags: ["Strength · High", "17 sources", "9 independent groups"] },
  hypoxia: { title: "Hypoxia / hypocapnia", summary: "A possible physiological pathway generated from the recurring breathwork sequence. Current evidence is indirect and competing mechanisms remain plausible.", tags: ["Confidence · Low–moderate", "6 supporting", "4 against"] },
  botanical: { title: "Botanical exposure", summary: "An alternative explanation: psychoactive preparations may be omitted, mistranslated or described symbolically in some accounts.", tags: ["Confidence · Contested", "5 supporting", "7 against"] },
  evidence1: { title: "Vision fast account", summary: "“After the third night without food, the initiate entered the stone chamber and reported a bright presence.”", tags: ["Primary translation", "c. 420 BCE", "Page 48"] },
  contra: { title: "Breathwork absent", summary: "Eight otherwise similar rites describe fasting and darkness but contain no breath practice. Two explicitly describe normal, quiet breathing.", tags: ["8 records", "5 independent groups", "Material challenge"] },
  source: { title: "Ritual purification survey", summary: "Comparative ethnographic survey. This item is downstream of two earlier field reports and counts as one source group—not three confirmations.", tags: ["Kline, 1987", "Secondary source", "Lineage mapped"] },
};

const kindLabel: Record<NodeKind, string> = { concept: "Concept", pattern: "Pattern", hypothesis: "Hypothesis", evidence: "Evidence", contradiction: "Contradiction", source: "Source" };

export default function Home() {
  const [active, setActive] = useState("pattern27");
  const [lens, setLens] = useState("Pattern");
  const [selected, setSelected] = useState<string[]>(["fasting", "breath", "altered"]);
  const [contradictions, setContradictions] = useState(false);
  const [surprise, setSurprise] = useState(false);
  const [message, setMessage] = useState("");
  const [feed, setFeed] = useState(["I found a recurring sequence across nine independent source groups. I’ve separated the observation from two possible explanations."]);

  const visibleNodes = useMemo(() => baseNodes.filter(n => !contradictions || ["pattern27", "contra", "source", "botanical", "altered"].includes(n.id)), [contradictions]);
  const selectedDetail = details[active];

  function runInvestigation() {
    setSurprise(false);
    setActive("pattern27");
    setFeed(f => [...f, `Investigated ${selected.length} selected concepts. Pattern 027 is the strongest independent relationship; 8 counterexamples remain visible.`]);
  }

  function ask(text = message) {
    if (!text.trim()) return;
    if (/against|contradiction|sceptic/i.test(text)) {
      setContradictions(true); setActive("contra");
      setFeed(f => [...f, "I switched to the sceptic slice. Eight records challenge the pattern; two explicitly describe normal breathing."]);
    } else if (/surprise|missing/i.test(text)) {
      triggerSurprise(); return;
    } else {
      setFeed(f => [...f, "I focused the canvas on the strongest evidence chain. The source panel preserves the original passage and dependency lineage."]);
      setActive("evidence1");
    }
    setMessage("");
  }

  function triggerSurprise() {
    setSurprise(true); setContradictions(false); setActive("dark");
    setFeed(f => [...f, "Unexpected pattern: darkness appears after fasting in 71% of eligible ritual sequences, across four regions. Reporting conventions are a likely confounder."]);
    setMessage("");
  }

  function toggleSelect(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id].slice(-3));
    setActive(id);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">N</span><span>NOEMA</span></div>
        <nav className="crumbs" aria-label="Investigation breadcrumb"><span>Investigations</span><b>/</b><strong>Ancient altered states</strong></nav>
        <div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button className="share">Share investigation</button><span className="avatar">TY</span></div>
      </header>

      <section className="workspace">
        <div className="canvas-panel">
          <div className="canvas-toolbar">
            <div><p className="kicker">INVESTIGATION CANVAS</p><h1>Ancient altered states</h1></div>
            <div className="lens-control"><span>Lens</span>{["Pattern", "Historical", "Biological", "Sceptic"].map(item => <button key={item} onClick={() => { setLens(item); setContradictions(item === "Sceptic"); }} className={lens === item ? "active" : ""}>{item}</button>)}</div>
          </div>

          <div className={`graph ${contradictions ? "sceptic" : ""}`}>
            <div className="grid-lines" />
            <svg className="edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {edges.map(([a,b], i) => {
                const n1 = baseNodes.find(n => n.id === a)!; const n2 = baseNodes.find(n => n.id === b)!;
                if (!visibleNodes.some(n => n.id === a) || !visibleNodes.some(n => n.id === b)) return null;
                return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} className={a === "contra" || b === "contra" ? "edge-contradiction" : ""} />;
              })}
            </svg>

            <div className="canvas-note"><span className="pulse" />{contradictions ? "Sceptic lens · challenges prioritised" : `${lens} lens · strongest relationships shown`}</div>
            {surprise && <div className="surprise-card"><small>CURIOSITY 04</small><strong>Darkness follows fasting in 71% of eligible sequences</strong><span>Top 2.8% of corpus associations · 4 regions</span><button onClick={() => { setActive("dark"); setSurprise(false); }}>Explore pattern →</button></div>}
            {visibleNodes.map(node => (
              <button key={node.id} className={`node node-${node.kind} ${active === node.id ? "focused" : ""} ${selected.includes(node.id) ? "selected" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => toggleSelect(node.id)}>
                <span className="node-type">{node.eyebrow || kindLabel[node.kind]}</span><strong>{node.label}</strong><small>{node.meta}</small>
              </button>
            ))}
            <div className="zoom"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button><button aria-label="Fit canvas">⌗</button></div>
            <div className="legend">{(["evidence", "concept", "pattern", "hypothesis", "contradiction"] as NodeKind[]).map(k => <span key={k}><i className={`dot ${k}`} />{kindLabel[k]}</span>)}</div>
          </div>

          <div className="selection-bar">
            <div className="selection-stack">{selected.map((id, i) => <span key={id} style={{ zIndex: 3-i }}>{details[id].title.slice(0,1)}</span>)}</div>
            <p><strong>{selected.length} nodes selected</strong><span>{selected.map(id => details[id].title).join(" · ")}</span></p>
            <button className="clear" onClick={() => setSelected([])}>Clear</button>
            <button className="investigate" disabled={selected.length < 2} onClick={runInvestigation}><span>✦</span> Investigate relationship</button>
          </div>
        </div>

        <aside className="investigator">
          <div className="panel-head"><div><span className="ai-star">✦</span><p className="kicker">AI INVESTIGATOR</p></div><button aria-label="Panel options">•••</button></div>
          <div className="activity">
            <div className="context-card"><span>Current focus</span><strong>{selectedDetail.title}</strong><small>{kindLabel[baseNodes.find(n => n.id === active)?.kind || "concept"]} · {lens} lens</small></div>
            {feed.slice(-2).map((item, i) => <div className="ai-message" key={i}><span className="mini-star">✦</span><p>{item}</p></div>)}

            <div className="detail-card">
              <div className="detail-title"><span className={`type-pill ${baseNodes.find(n=>n.id===active)?.kind}`}>{kindLabel[baseNodes.find(n=>n.id===active)?.kind || "concept"]}</span><button aria-label="Pin item">⌖</button></div>
              <h2>{selectedDetail.title}</h2><p>{selectedDetail.summary}</p>
              <div className="tag-row">{selectedDetail.tags.map(t => <span key={t}>{t}</span>)}</div>
              <div className="confidence"><span>Evidence integrity</span><b>{active === "pattern27" ? "82" : active === "contra" ? "76" : "68"}/100</b><div><i style={{width: active === "pattern27" ? "82%" : active === "contra" ? "76%" : "68%"}} /></div></div>
              <button className="evidence-button" onClick={() => setActive(active === "source" ? "evidence1" : "source")}>View evidence lineage <span>→</span></button>
            </div>
          </div>
          <div className="quick-prompts">
            <button onClick={() => ask("Find evidence against this")}>Find evidence against this</button>
            <button onClick={() => ask("Show primary sources")}>Show primary sources</button>
            <button className="surprise" onClick={triggerSurprise}>✦ Surprise me</button>
          </div>
          <div className="composer"><textarea value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} placeholder="Ask about this investigation…" aria-label="Ask the investigator"/><div><span>↵ to send</span><button onClick={() => ask()} aria-label="Send message">↑</button></div></div>
        </aside>
      </section>
    </main>
  );
}
