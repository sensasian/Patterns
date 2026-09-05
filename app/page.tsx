"use client";

import { useMemo, useState } from "react";

type Kind = "concept" | "evidence" | "source" | "pattern" | "hypothesis" | "contradiction";
type Hub = { id:string; label:string; sub:string; x:number; y:number; kind:Kind; score:number };

const hubs: Hub[] = [
  { id:"p27", label:"PATTERN 027", sub:"Shared directors → vendors → awards", x:48, y:44, kind:"pattern", score:82 },
  { id:"companies", label:"Organisations", sub:"12,640 registry entities", x:25, y:25, kind:"concept", score:76 },
  { id:"people", label:"People & directors", sub:"8,421 resolved identities", x:72, y:24, kind:"concept", score:71 },
  { id:"contracts", label:"Contracts & awards", sub:"34,208 public records", x:21, y:67, kind:"concept", score:79 },
  { id:"places", label:"Locations", sub:"6,301 normalised places", x:72, y:67, kind:"concept", score:88 },
  { id:"hypothesis", label:"Coordinated network", sub:"Hypothesis · low–moderate", x:49, y:80, kind:"hypothesis", score:54 },
  { id:"contra", label:"Independent tenders", sub:"Contradiction · 11 records", x:86, y:46, kind:"contradiction", score:73 },
];

const copy: Record<string, {k:string; title:string; body:string; metrics:string[]}> = {
  p27:{k:"Discovered pattern",title:"Shared directors → related vendors → public awards",body:"A recurring ownership and procurement path appears across otherwise separate datasets. It is a candidate pattern, not evidence of coordination or wrongdoing.",metrics:["47 records","8 source systems","5 jurisdictions"]},
  companies:{k:"Entity cluster",title:"Organisations",body:"Companies, public bodies, research institutions and vendors resolved across registry records, filings, contracts and uploaded evidence.",metrics:["12,640 entities","91% resolved","14 databases"]},
  people:{k:"Entity cluster",title:"People & directors",body:"Named people matched across directorships, filings, publications and awards. Ambiguous identities remain separated until corroborated.",metrics:["8,421 identities","613 ambiguous","12 databases"]},
  contracts:{k:"Record cluster",title:"Contracts & awards",body:"Tender notices, award records, invoices and amendments normalised into one timeline while retaining their original identifiers and source links.",metrics:["34,208 records","7 jurisdictions","4 source types"]},
  places:{k:"Entity cluster",title:"Locations",body:"Addresses, facilities and geographic references normalised across source systems, with confidence preserved for inferred matches.",metrics:["6,301 places","22 countries","438 uncertain"]},
  hypothesis:{k:"Hypothesis",title:"Coordinated supplier network",body:"A possible explanation for the repeated ownership and award structure. Common professional services and market concentration remain plausible alternatives.",metrics:["9 supporting","11 against","Low–moderate"]},
  contra:{k:"Contradiction",title:"Independent tender processes",body:"Eleven award records contain documented competitive processes that weaken a single coordinated-network explanation.",metrics:["11 records","6 authorities","Material challenge"]},
};

const connectors = [
  {name:"Companies House",type:"Company registry",state:"ready",items:"6,204"},
  {name:"SEC EDGAR",type:"Company filings",state:"ready",items:"3,912"},
  {name:"OpenCorporates",type:"Global registry index",state:"ready",items:"2,524"},
  {name:"AusTender",type:"Public procurement",state:"syncing",items:"28,440"},
  {name:"Crossref",type:"Research metadata",state:"ready",items:"1,806"},
  {name:"GDELT",type:"Global events & news",state:"available",items:"—"},
  {name:"PubMed",type:"Biomedical literature",state:"available",items:"—"},
  {name:"Local evidence vault",type:"PDF · CSV · XLSX · JSON",state:"ready",items:"184"},
];

const colors:Record<Kind,string>={concept:"#b8ff57",evidence:"#f3ef72",source:"#8b91a5",pattern:"#b975ff",hypothesis:"#58d8ff",contradiction:"#ff625f"};

export default function Home(){
  const [active,setActive]=useState("p27");
  const [selected,setSelected]=useState<string[]>(["companies","people","contracts"]);
  const [filters,setFilters]=useState<Record<Kind,boolean>>({concept:true,evidence:true,source:true,pattern:true,hypothesis:true,contradiction:true});
  const [panel,setPanel]=useState<"inspect"|"sources"|"controls">("sources");
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
  function surpriseMe(){setSurprise(true);setActive("p27")}

  return <main className="dark-app">
    <header className="dark-topbar">
      <div className="wordmark"><i>∿</i> NOEMA</div>
      <div className="investigation-title"><span>EVIDENCE NETWORK</span><b>Unified knowledge graph</b><em>8 SOURCES ACTIVE</em></div>
      <div className="top-tools"><button>⌕</button><button>↧</button><button>Share</button><span>TY</span></div>
    </header>

    <section className="graph-stage">
      <div className="stage-tools">
        <button className="active">◎ Graph</button><button>≋ Timeline</button><button>⌖ Geography</button>
        <span />
        <button onClick={()=>setSurprise(false)}>Fit all</button><button onClick={surpriseMe} className="magic">✦ Surprise me</button>
      </div>
      <div className="map-meta"><span className="live-dot"/> Live corpus <b>·</b> 62,184 nodes <b>·</b> 148,920 relationships <b>·</b> 8 sources</div>
      <svg className="network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Evidence relationship map">
        <defs><radialGradient id="halo"><stop offset="0" stopColor="#ba75ff" stopOpacity=".26"/><stop offset="1" stopColor="#ba75ff" stopOpacity="0"/></radialGradient></defs>
        <circle cx="48" cy="44" r="23" fill="url(#halo)"/>
        {visibleHubs.flatMap((h,hi)=>satellites.filter(s=>s.hub===h.id&&filters[s.kind]).map(s=><line key={`l-${s.id}`} x1={h.x} y1={h.y} x2={s.x} y2={s.y} style={{opacity:.14+(linkFade/200)}}/>))}
        {[["p27","companies"],["p27","people"],["p27","contracts"],["p27","places"],["p27","hypothesis"],["people","contra"],["contracts","contra"],["hypothesis","contracts"]].map(([a,b])=>{const x=hubs.find(h=>h.id===a)!;const y=hubs.find(h=>h.id===b)!;return <line key={`${a}${b}`} x1={x.x} y1={x.y} x2={y.x} y2={y.y} className={b==="contra"?"challenge":"major"}/>})}
        {satellites.filter(s=>filters[s.kind]).map(s=><circle key={s.id} cx={s.x} cy={s.y} r={(s.r*(.65+nodeSize/100))/10} fill={colors[s.kind]} className="satellite" onClick={()=>{setActive(s.hub);setPanel("inspect")}}><title>{s.kind} linked to {copy[s.hub]?.title}</title></circle>)}
      </svg>
      {visibleHubs.map(h=><button key={h.id} onClick={()=>toggle(h.id)} className={`hub hub-${h.kind} ${active===h.id?"active":""} ${selected.includes(h.id)?"selected":""}`} style={{left:`${h.x}%`,top:`${h.y}%`,"--node-color":colors[h.kind]} as React.CSSProperties}>
        <i/><strong>{h.label}</strong><small>{h.sub}</small>
      </button>)}

      {surprise&&<div className="anomaly"><span>CROSS-DATABASE ASSOCIATION · 04</span><b>Three vendors share directors, addresses and award timing</b><p>Detected across company registries, filings and procurement records</p><button onClick={()=>setSurprise(false)}>Open as investigation →</button></div>}

      <div className="map-key"><b>MAP KEY</b>{(["evidence","concept","pattern","hypothesis","contradiction"] as Kind[]).map(k=><span key={k}><i style={{background:colors[k]}}/>{k}</span>)}</div>
      <div className="map-nav"><button>+</button><button>−</button><button>⌗</button></div>
      <div className="selected-tray"><span>{selected.length}</span><div><b>Nodes selected</b><small>{selected.map(id=>copy[id]?.title).join(" · ")}</small></div><button onClick={()=>setSelected([])}>Clear</button><button className="run" disabled={selected.length<2} onClick={investigate}>✦ Investigate relationship</button></div>
    </section>

    <aside className="right-dock">
      <div className="dock-tabs"><button onClick={()=>setPanel("inspect")} className={panel==="inspect"?"active":""}>Inspect</button><button onClick={()=>setPanel("sources")} className={panel==="sources"?"active":""}>Sources</button><button onClick={()=>setPanel("controls")} className={panel==="controls"?"active":""}>Controls</button><button>×</button></div>
      {panel==="inspect"?<div className="inspector">
        <div className="evidence-status"><i style={{background:colors[hubs.find(h=>h.id===active)?.kind||"pattern"]}}/><span>{d.k}</span><em>{hubs.find(h=>h.id===active)?.score||82}/100</em></div>
        <h1>{d.title}</h1><p>{d.body}</p>
        <div className="metric-grid">{d.metrics.map((m,i)=><div key={m}><b>{m.split(" ")[0]}</b><span>{m.substring(m.indexOf(" ")+1)}</span></div>)}</div>
        <div className="integrity"><span>Evidence integrity</span><b>{hubs.find(h=>h.id===active)?.score||82}%</b><div><i style={{width:`${hubs.find(h=>h.id===active)?.score||82}%`}}/></div></div>
        <section className="lineage"><header><span>PROVENANCE CHAIN</span><b>3 systems</b></header><div><i/><p><b>Registry record</b><span>Original entity ID · retrieved 2h ago</span></p></div><div><i/><p><b>Procurement award</b><span>Source record and amendment history</span></p></div><div><i/><p><b>Resolved relationship</b><span>Match confidence 0.91 · human unreviewed</span></p></div></section>
        <button className="open-source">Open original evidence <span>↗</span></button>
        <div className="challenge-actions"><button onClick={()=>setActive("contra")}>Show evidence against</button><button onClick={()=>setActive("hypoxia")}>Create hypothesis</button></div>
      </div>:panel==="sources"?<div className="sources-panel"><header><span>CONNECTED DATA</span><button>＋ Add source</button></header><p>Each connector retains source IDs, retrieval time and lineage. “Available” sources are not connected yet.</p><div className="source-summary"><div><b>8</b><span>configured</span></div><div><b>7</b><span>healthy</span></div><div><b>47k</b><span>records</span></div></div><div className="connector-list">{connectors.map(c=><button key={c.name} onClick={()=>setPanel("inspect")}><i className={`connector-icon ${c.state}`}>{c.name.slice(0,1)}</i><span><b>{c.name}</b><small>{c.type}</small></span><em className={c.state}>{c.state}</em><strong>{c.items}</strong></button>)}</div><button className="connector-catalog">Browse connector catalogue →</button></div>:<div className="controls">
        <label>Search graph<input placeholder="Search entities, evidence…"/></label>
        <section><header>NODE TYPES <button>Reset</button></header>{(Object.keys(filters) as Kind[]).map(k=><label key={k}><span><i style={{background:colors[k]}}/>{k}</span><input type="checkbox" checked={filters[k]} onChange={()=>setFilters(f=>({...f,[k]:!f[k]}))}/></label>)}</section>
        <section><header>DISPLAY</header><label>Node size <input type="range" value={nodeSize} onChange={e=>setNodeSize(+e.target.value)}/></label><label>Link visibility <input type="range" value={linkFade} onChange={e=>setLinkFade(+e.target.value)}/></label><label>Show labels <input type="checkbox" defaultChecked/></label><label>Auto-fit clusters <input type="checkbox" defaultChecked/></label></section>
        <section><header>ANALYTICAL LENS</header><div className="lens-grid"><button className="active">Patterns</button><button>Historical</button><button>Biological</button><button onClick={()=>setActive("contra")}>Sceptic</button></div></section>
      </div>}
    </aside>

    <button className={`ai-tab ${aiOpen?"open":""}`} onClick={()=>setAiOpen(!aiOpen)}>✦ AI Investigator <span>{aiOpen?"×":"↑"}</span></button>
    {aiOpen&&<div className="ai-drawer"><header><b>✦ AI Investigator</b><button onClick={()=>setAiOpen(false)}>×</button></header><div className="ai-copy">I searched the selected entities across eight connected sources. Pattern 027 is the strongest cross-database relationship, but eleven tender records weaken a coordination hypothesis.</div><div className="ai-chips"><button onClick={()=>setActive("contra")}>Find evidence against this</button><button>Only independent sources</button></div><div className="ai-input">Ask across all connected evidence… <button>↑</button></div></div>}
  </main>
}
