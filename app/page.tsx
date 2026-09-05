"use client";

import { useMemo, useState } from "react";

type Kind = "concept" | "evidence" | "source" | "pattern" | "hypothesis" | "contradiction";
type Hub = { id:string; label:string; sub:string; x:number; y:number; kind:Kind; score:number };

const hubs: Hub[] = [
  { id:"p27", label:"PATTERN 027", sub:"Fasting → darkness → breathwork", x:48, y:44, kind:"pattern", score:82 },
  { id:"fasting", label:"Fasting", sub:"22 sources", x:25, y:25, kind:"concept", score:76 },
  { id:"darkness", label:"Darkness", sub:"14 sources", x:72, y:24, kind:"concept", score:71 },
  { id:"breath", label:"Rhythmic breathing", sub:"17 sources", x:21, y:67, kind:"concept", score:79 },
  { id:"altered", label:"Altered state", sub:"63 observations", x:72, y:67, kind:"concept", score:88 },
  { id:"hypoxia", label:"Hypoxia", sub:"Hypothesis · low–moderate", x:49, y:80, kind:"hypothesis", score:54 },
  { id:"contra", label:"Breathwork absent", sub:"Contradiction · 8 records", x:86, y:46, kind:"contradiction", score:73 },
];

const copy: Record<string, {k:string; title:string; body:string; metrics:string[]}> = {
  p27:{k:"Discovered pattern",title:"Fasting → darkness → rhythmic breathing",body:"This ordered sequence recurs across nine independent source groups more often than expected. It is a pattern, not a causal conclusion.",metrics:["17 sources","9 independent groups","6 geographies"]},
  fasting:{k:"Concept",title:"Fasting",body:"Food restriction recorded as preparation, purification or ordeal. Six derivative retellings have been collapsed into their earliest source groups.",metrics:["22 sources","11 groups","1,800-year span"]},
  darkness:{k:"Concept",title:"Darkness / sensory reduction",body:"Ritual confinement in caves, chambers or unlit rooms. The association remains after excluding three modern secondary surveys.",metrics:["14 sources","9 groups","4 regions"]},
  breath:{k:"Concept",title:"Rhythmic breathing",body:"Deliberate rapid respiration, repeated breath cycles or extended breath holds. Five references are inferred rather than directly observed.",metrics:["17 sources","12 direct","5 inferred"]},
  altered:{k:"Observation cluster",title:"Reported altered state",body:"Visionary, dissociative or ecstatic experiences, kept in the language of each source without assigning a biological mechanism.",metrics:["63 observations","29 groups","6 regions"]},
  hypoxia:{k:"Hypothesis",title:"Hypoxia / hypocapnia pathway",body:"A plausible physiological mechanism generated from the recurring breathwork sequence. Evidence is indirect and botanical exposure remains an alternative.",metrics:["6 supporting","4 against","Low–moderate"]},
  contra:{k:"Contradiction",title:"Breathwork absent",body:"Eight otherwise similar rites describe fasting and darkness but no breath practice. Two explicitly describe quiet, normal breathing.",metrics:["8 records","5 groups","Material challenge"]},
};

const colors:Record<Kind,string>={concept:"#b8ff57",evidence:"#f3ef72",source:"#8b91a5",pattern:"#b975ff",hypothesis:"#58d8ff",contradiction:"#ff625f"};

export default function Home(){
  const [active,setActive]=useState("p27");
  const [selected,setSelected]=useState<string[]>(["fasting","darkness","breath"]);
  const [filters,setFilters]=useState<Record<Kind,boolean>>({concept:true,evidence:true,source:true,pattern:true,hypothesis:true,contradiction:true});
  const [panel,setPanel]=useState<"inspect"|"controls">("inspect");
  const [aiOpen,setAiOpen]=useState(false);
  const [surprise,setSurprise]=useState(false);
  const [nodeSize,setNodeSize]=useState(50);
  const [linkFade,setLinkFade]=useState(38);

  const satellites=useMemo(()=>hubs.flatMap((h,hi)=>Array.from({length:hi===0?18:hi===6?8:12},(_,i)=>{
    const angle=(i/(hi===0?18:hi===6?8:12))*Math.PI*2+(hi*.37);
    const radius=(hi===0?10:7.2)+(i%3)*2.1;
    const kinds:Kind[]=["evidence","source","evidence","evidence","source","evidence"];
    return {id:`${h.id}-${i}`,hub:h.id,x:h.x+Math.cos(angle)*radius,y:h.y+Math.sin(angle)*radius*.82,kind:kinds[(i+hi)%kinds.length],r:2.1+(i%4)*.45};
  })),[]);
  const visibleHubs=hubs.filter(h=>filters[h.kind]);
  const d=copy[active]||copy.p27;
  function toggle(id:string){setActive(id);setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id].slice(-4));}
  function investigate(){setActive("p27");setAiOpen(true);setSurprise(false)}
  function surpriseMe(){setSurprise(true);setActive("darkness")}

  return <main className="dark-app">
    <header className="dark-topbar">
      <div className="wordmark"><i>∿</i> NOEMA</div>
      <div className="investigation-title"><span>INVESTIGATION</span><b>Ancient altered states</b><em>LIVE MAP</em></div>
      <div className="top-tools"><button>⌕</button><button>↧</button><button>Share</button><span>TY</span></div>
    </header>

    <section className="graph-stage">
      <div className="stage-tools">
        <button className="active">◎ Graph</button><button>≋ Timeline</button><button>⌖ Geography</button>
        <span />
        <button onClick={()=>setSurprise(false)}>Fit all</button><button onClick={surpriseMe} className="magic">✦ Surprise me</button>
      </div>
      <div className="map-meta"><span className="live-dot"/> Focused view <b>·</b> 94 of 1,842 nodes <b>·</b> 126 relationships</div>
      <svg className="network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Evidence relationship map">
        <defs><radialGradient id="halo"><stop offset="0" stopColor="#ba75ff" stopOpacity=".26"/><stop offset="1" stopColor="#ba75ff" stopOpacity="0"/></radialGradient></defs>
        <circle cx="48" cy="44" r="23" fill="url(#halo)"/>
        {visibleHubs.flatMap((h,hi)=>satellites.filter(s=>s.hub===h.id&&filters[s.kind]).map(s=><line key={`l-${s.id}`} x1={h.x} y1={h.y} x2={s.x} y2={s.y} style={{opacity:.14+(linkFade/200)}}/>))}
        {[["p27","fasting"],["p27","darkness"],["p27","breath"],["p27","altered"],["p27","hypoxia"],["darkness","contra"],["altered","contra"],["hypoxia","breath"]].map(([a,b])=>{const x=hubs.find(h=>h.id===a)!;const y=hubs.find(h=>h.id===b)!;return <line key={`${a}${b}`} x1={x.x} y1={x.y} x2={y.x} y2={y.y} className={b==="contra"?"challenge":"major"}/>})}
        {satellites.filter(s=>filters[s.kind]).map(s=><circle key={s.id} cx={s.x} cy={s.y} r={(s.r*(.65+nodeSize/100))/10} fill={colors[s.kind]} className="satellite" onClick={()=>{setActive(s.hub);setPanel("inspect")}}><title>{s.kind} linked to {copy[s.hub]?.title}</title></circle>)}
      </svg>
      {visibleHubs.map(h=><button key={h.id} onClick={()=>toggle(h.id)} className={`hub hub-${h.kind} ${active===h.id?"active":""} ${selected.includes(h.id)?"selected":""}`} style={{left:`${h.x}%`,top:`${h.y}%`,"--node-color":colors[h.kind]} as React.CSSProperties}>
        <i/><strong>{h.label}</strong><small>{h.sub}</small>
      </button>)}

      {surprise&&<div className="anomaly"><span>UNEXPECTED ASSOCIATION · 04</span><b>Darkness follows fasting in 71% of eligible sequences</b><p>Top 2.8% of corpus associations · replicated across 4 regions</p><button onClick={()=>setSurprise(false)}>Add to investigation →</button></div>}

      <div className="map-key"><b>MAP KEY</b>{(["evidence","concept","pattern","hypothesis","contradiction"] as Kind[]).map(k=><span key={k}><i style={{background:colors[k]}}/>{k}</span>)}</div>
      <div className="map-nav"><button>+</button><button>−</button><button>⌗</button></div>
      <div className="selected-tray"><span>{selected.length}</span><div><b>Nodes selected</b><small>{selected.map(id=>copy[id]?.title).join(" · ")}</small></div><button onClick={()=>setSelected([])}>Clear</button><button className="run" disabled={selected.length<2} onClick={investigate}>✦ Investigate relationship</button></div>
    </section>

    <aside className="right-dock">
      <div className="dock-tabs"><button onClick={()=>setPanel("inspect")} className={panel==="inspect"?"active":""}>Inspect</button><button onClick={()=>setPanel("controls")} className={panel==="controls"?"active":""}>Controls</button><button>×</button></div>
      {panel==="inspect"?<div className="inspector">
        <div className="evidence-status"><i style={{background:colors[hubs.find(h=>h.id===active)?.kind||"pattern"]}}/><span>{d.k}</span><em>{hubs.find(h=>h.id===active)?.score||82}/100</em></div>
        <h1>{d.title}</h1><p>{d.body}</p>
        <div className="metric-grid">{d.metrics.map((m,i)=><div key={m}><b>{m.split(" ")[0]}</b><span>{m.substring(m.indexOf(" ")+1)}</span></div>)}</div>
        <div className="integrity"><span>Evidence integrity</span><b>{hubs.find(h=>h.id===active)?.score||82}%</b><div><i style={{width:`${hubs.find(h=>h.id===active)?.score||82}%`}}/></div></div>
        <section className="lineage"><header><span>PROVENANCE CHAIN</span><b>3 layers</b></header><div><i/><p><b>Direct observation</b><span>Field account · translated passage</span></p></div><div><i/><p><b>Source group</b><span>Earliest independent record · c. 420 BCE</span></p></div><div><i/><p><b>Extracted relationship</b><span>Model confidence 0.91 · human unreviewed</span></p></div></section>
        <button className="open-source">Open original evidence <span>↗</span></button>
        <div className="challenge-actions"><button onClick={()=>setActive("contra")}>Show evidence against</button><button onClick={()=>setActive("hypoxia")}>Create hypothesis</button></div>
      </div>:<div className="controls">
        <label>Search graph<input placeholder="Search entities, evidence…"/></label>
        <section><header>NODE TYPES <button>Reset</button></header>{(Object.keys(filters) as Kind[]).map(k=><label key={k}><span><i style={{background:colors[k]}}/>{k}</span><input type="checkbox" checked={filters[k]} onChange={()=>setFilters(f=>({...f,[k]:!f[k]}))}/></label>)}</section>
        <section><header>DISPLAY</header><label>Node size <input type="range" value={nodeSize} onChange={e=>setNodeSize(+e.target.value)}/></label><label>Link visibility <input type="range" value={linkFade} onChange={e=>setLinkFade(+e.target.value)}/></label><label>Show labels <input type="checkbox" defaultChecked/></label><label>Auto-fit clusters <input type="checkbox" defaultChecked/></label></section>
        <section><header>ANALYTICAL LENS</header><div className="lens-grid"><button className="active">Patterns</button><button>Historical</button><button>Biological</button><button onClick={()=>setActive("contra")}>Sceptic</button></div></section>
      </div>}
    </aside>

    <button className={`ai-tab ${aiOpen?"open":""}`} onClick={()=>setAiOpen(!aiOpen)}>✦ AI Investigator <span>{aiOpen?"×":"↑"}</span></button>
    {aiOpen&&<div className="ai-drawer"><header><b>✦ AI Investigator</b><button onClick={()=>setAiOpen(false)}>×</button></header><div className="ai-copy">I searched the selected concepts across 1,842 nodes. Pattern 027 is the strongest independent relationship, but eight records weaken a universal explanation.</div><div className="ai-chips"><button onClick={()=>setActive("contra")}>Find evidence against this</button><button>Only independent sources</button></div><div className="ai-input">Ask this investigation… <button>↑</button></div></div>}
  </main>
}
