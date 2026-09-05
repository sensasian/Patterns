"use client";

import { FormEvent, PointerEvent, WheelEvent, useMemo, useRef, useState } from "react";

type Kind = "concept" | "evidence" | "source" | "pattern" | "hypothesis" | "contradiction";
type Hub = { id:string; label:string; sub:string; x:number; y:number; kind:Kind; score:number };
type LiveRecord = {id:string;title:string;year?:number;authors:string[];source:"Crossref"|"OpenAlex";sourceId:string;uri:string;doi?:string;retrievedAt:string;evidence:string};
type InvestigationResult = {query:string;retrievedAt:string;liveSources:string[];records:LiveRecord[];pattern:string[]};

const hubs: Hub[] = [
  {id:"p27",label:"PATTERN 027",sub:"Shared directors → vendors → awards",x:48,y:44,kind:"pattern",score:82},
  {id:"companies",label:"Organisations",sub:"12,640 registry entities",x:25,y:25,kind:"concept",score:76},
  {id:"people",label:"People & directors",sub:"8,421 resolved identities",x:72,y:24,kind:"concept",score:71},
  {id:"contracts",label:"Contracts & awards",sub:"34,208 public records",x:21,y:67,kind:"concept",score:79},
  {id:"places",label:"Locations",sub:"6,301 normalised places",x:72,y:67,kind:"concept",score:88},
  {id:"hypothesis",label:"Coordinated network",sub:"Hypothesis · low–moderate",x:49,y:80,kind:"hypothesis",score:54},
  {id:"contra",label:"Independent tenders",sub:"Contradiction · 11 records",x:86,y:46,kind:"contradiction",score:73},
];

const copy:Record<string,{k:string;title:string;body:string;metrics:string[]}>= {
  p27:{k:"Discovered pattern",title:"Shared directors → related vendors → public awards",body:"A recurring ownership and procurement path appears across otherwise separate datasets. It is a candidate pattern, not evidence of coordination or wrongdoing.",metrics:["47 records","8 sources","5 jurisdictions"]},
  companies:{k:"Entity cluster",title:"Organisations",body:"Companies, public bodies, research institutions and vendors resolved across registry records, filings, contracts and uploaded evidence.",metrics:["12,640 entities","91% resolved","14 databases"]},
  people:{k:"Entity cluster",title:"People & directors",body:"Named people matched across directorships, filings, publications and awards. Ambiguous identities remain separated until corroborated.",metrics:["8,421 identities","613 ambiguous","12 databases"]},
  contracts:{k:"Record cluster",title:"Contracts & awards",body:"Tender notices, award records, invoices and amendments normalised into one timeline while retaining original identifiers.",metrics:["34,208 records","7 jurisdictions","4 source types"]},
  places:{k:"Entity cluster",title:"Locations",body:"Addresses, facilities and geographic references normalised across source systems, with confidence preserved for inferred matches.",metrics:["6,301 places","22 countries","438 uncertain"]},
  hypothesis:{k:"Hypothesis",title:"Coordinated supplier network",body:"A possible explanation for the repeated ownership and award structure. Common professional services and market concentration remain plausible alternatives.",metrics:["9 supporting","11 against","Low confidence"]},
  contra:{k:"Contradiction",title:"Independent tender processes",body:"Eleven award records contain documented competitive processes that weaken a single coordinated-network explanation.",metrics:["11 records","6 authorities","Material challenge"]},
};

const connectors=[
  {name:"Crossref",type:"Research metadata API",state:"live",items:"search"},
  {name:"OpenAlex",type:"Open scholarly graph API",state:"live",items:"search"},
  {name:"Companies House",type:"Company registry",state:"planned",items:"—"},
  {name:"SEC EDGAR",type:"Company filings",state:"planned",items:"—"},
  {name:"OpenCorporates",type:"Global registry index",state:"planned",items:"—"},
  {name:"AusTender",type:"Public procurement",state:"planned",items:"—"},
  {name:"GDELT",type:"Global events and news",state:"planned",items:"—"},
  {name:"Local evidence vault",type:"PDF, CSV, XLSX and JSON",state:"planned",items:"—"},
];

const colors:Record<Kind,string>={concept:"#b8ff57",evidence:"#f3ef72",source:"#8b91a5",pattern:"#b975ff",hypothesis:"#58d8ff",contradiction:"#ff625f"};

export default function Home(){
  const [active,setActive]=useState("p27");
  const [selected,setSelected]=useState<string[]>(["companies","people","contracts"]);
  const [panel,setPanel]=useState<"inspect"|"sources"|"controls">("sources");
  const [aiOpen,setAiOpen]=useState(false);
  const [surprise,setSurprise]=useState(false);
  const [query,setQuery]=useState("graph-based evidence discovery");
  const [result,setResult]=useState<InvestigationResult|null>(null);
  const [activeLiveId,setActiveLiveId]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [liveSelected,setLiveSelected]=useState<string[]>([]);
  const [crossInsight,setCrossInsight]=useState("");
  const [camera,setCamera]=useState({x:0,y:0,scale:1,rotation:0});
  const drag=useRef<{x:number;y:number;cx:number;cy:number}|null>(null);

  const satellites=useMemo(()=>hubs.flatMap((hub,hubIndex)=>Array.from({length:hubIndex===0?18:hubIndex===6?8:12},(_,index)=>{
    const total=hubIndex===0?18:hubIndex===6?8:12;
    const angle=(index/total)*Math.PI*2+(hubIndex*.37);
    const radius=(hubIndex===0?10:7.2)+(index%3)*2.1;
    const kinds:Kind[]=["evidence","source","evidence","evidence","source","evidence"];
    return {id:`${hub.id}-${index}`,hub:hub.id,x:Number((hub.x+Math.cos(angle)*radius).toFixed(3)),y:Number((hub.y+Math.sin(angle)*radius*.82).toFixed(3)),kind:kinds[(index+hubIndex)%kinds.length],r:2.1+(index%4)*.45};
  })),[]);
  const livePositions=useMemo(()=>result?.records.map((record,index)=>{
    const rings=4;
    const ringIndex=index%rings;
    const positionInRing=Math.floor(index/rings);
    const countInRing=Math.ceil(result.records.length/rings);
    const angle=(positionInRing/countInRing)*Math.PI*2+(ringIndex*.41)-Math.PI/2;
    const ring=15+(ringIndex*8);
    return {...record,x:Number((48+Math.cos(angle)*ring).toFixed(3)),y:Number((48+Math.sin(angle)*ring*.72).toFixed(3))};
  })??[],[result]);
  const d=copy[active]??copy.p27;
  const activeLive=result?.records.find(record=>record.id===activeLiveId);

  function toggle(id:string){setActive(id);setPanel("inspect");setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id].slice(-4))}
  function investigate(){setActive("p27");setAiOpen(true);setSurprise(false)}
  async function runLiveInvestigation(event?:FormEvent){
    event?.preventDefault();
    await fetchInvestigation(query,false);
  }
  async function fetchInvestigation(searchQuery:string,append:boolean){
    if(searchQuery.trim().length<3)return;
    setLoading(true);setError("");setSurprise(false);setAiOpen(false);
    try{
      const response=await fetch(`/api/investigate?q=${encodeURIComponent(searchQuery.trim())}&limit=40`);
      const payload=await response.json() as InvestigationResult&{error?:string};
      if(!response.ok)throw new Error(payload.error||"Connected-source search failed.");
      if(append&&result){
        const merged=[...result.records,...payload.records].filter((record,index,all)=>all.findIndex(item=>item.id===record.id)===index);
        setResult({...result,records:merged,pattern:[...new Set([...result.pattern,...payload.pattern])].slice(0,8),retrievedAt:payload.retrievedAt,liveSources:[...new Set([...result.liveSources,...payload.liveSources])]});
      }else{
        setResult(payload);setActiveLiveId(payload.records[0]?.id??null);setLiveSelected([]);setCrossInsight("");setCamera({x:0,y:0,scale:1,rotation:0});
      }
      setPanel("inspect");setSelected([]);
    }catch(reason){setError(reason instanceof Error?reason.message:"Connected-source search failed.")}
    finally{setLoading(false)}
  }
  function selectLive(record:LiveRecord){
    setActiveLiveId(record.id);setPanel("inspect");setCrossInsight("");
    setLiveSelected(current=>current.includes(record.id)?current.filter(id=>id!==record.id):[...current,record.id].slice(-2));
  }
  function crossReference(){
    if(!result||liveSelected.length!==2)return;
    const records=liveSelected.map(id=>result.records.find(record=>record.id===id)).filter(Boolean) as LiveRecord[];
    const terms=records.map(record=>new Set((`${record.title} ${record.evidence}`).toLowerCase().match(/[a-z][a-z-]{4,}/g)??[]));
    const shared=[...terms[0]].filter(term=>terms[1].has(term)&&!["about","between","from","their","these","through","using","which","with"].includes(term)).slice(0,8);
    const sharedAuthors=records[0].authors.filter(author=>records[1].authors.includes(author));
    setCrossInsight(sharedAuthors.length?`Shared authors: ${sharedAuthors.join(", ")}. Recurring concepts: ${shared.join(", ")||"none detected"}.`:`Recurring concepts: ${shared.join(", ")||"No strong lexical overlap detected"}. The records come from ${new Set(records.map(record=>record.source)).size} independent indexes.`);
  }
  function fitGraph(){setCamera({x:0,y:0,scale:1,rotation:0});setSurprise(false)}
  function onWheel(event:WheelEvent){event.preventDefault();setCamera(value=>({...value,scale:Math.max(.45,Math.min(3,value.scale*(event.deltaY>0?.9:1.1)))}))}
  function onPointerDown(event:PointerEvent<HTMLDivElement>){if((event.target as Element).closest("button,a,input,form"))return;drag.current={x:event.clientX,y:event.clientY,cx:camera.x,cy:camera.y};event.currentTarget.setPointerCapture(event.pointerId)}
  function onPointerMove(event:PointerEvent<HTMLDivElement>){if(!drag.current)return;setCamera(value=>({...value,x:drag.current!.cx+event.clientX-drag.current!.x,y:drag.current!.cy+event.clientY-drag.current!.y}))}
  function onPointerUp(){drag.current=null}

  return <main className="dark-app">
    <header className="dark-topbar"><div className="wordmark"><i>∿</i> NOEMA</div><div className="investigation-title"><span>EVIDENCE NETWORK</span><b>{result?result.query:"Unified knowledge graph"}</b><em>2 LIVE SOURCES</em></div><div className="top-tools"><button aria-label="Search">⌕</button><button aria-label="Export">↧</button><button>Share</button><span>TY</span></div></header>
    <section className="graph-stage">
      <div className="stage-tools"><button className="active">◎ Graph</button><button>≋ Timeline</button><button>⌖ Geography</button><span/><button onClick={fitGraph}>Fit all</button><button onClick={()=>{setSurprise(true);setResult(null)}} className="magic">✦ Surprise me</button></div>
      <form className="live-search" onSubmit={runLiveInvestigation}><input aria-label="Investigation query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Investigate across live sources…"/><button disabled={loading}>{loading?"Searching…":"Build live graph"}</button></form>
      <div className="map-meta"><span className="live-dot"/> {result?`${result.records.length} live records · ${result.liveSources.join(" + ")}`:"Demo corpus · run a live search to replace it"}</div>
      {error&&<div className="live-error" role="alert">{error}</div>}
      <div className="map-nav"><button aria-label="Zoom in" onClick={()=>setCamera(value=>({...value,scale:Math.min(3,value.scale*1.2)}))}>+</button><button aria-label="Zoom out" onClick={()=>setCamera(value=>({...value,scale:Math.max(.45,value.scale/1.2)}))}>−</button><button aria-label="Rotate graph" onClick={()=>setCamera(value=>({...value,rotation:value.rotation+15}))}>↻</button><button aria-label="Reset view" onClick={fitGraph}>⌗</button></div>
      <div className="graph-camera" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} style={{transform:`translate(${camera.x}px, ${camera.y}px) scale(${camera.scale}) rotate(${camera.rotation}deg)`}}>
      <svg className="network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Evidence relationship map"><defs><radialGradient id="halo"><stop offset="0" stopColor="#ba75ff" stopOpacity=".26"/><stop offset="1" stopColor="#ba75ff" stopOpacity="0"/></radialGradient></defs><circle cx="48" cy="44" r="23" fill="url(#halo)"/>
        {!result&&hubs.flatMap(hub=>satellites.filter(node=>node.hub===hub.id).map(node=><line key={`l-${node.id}`} x1={hub.x} y1={hub.y} x2={node.x} y2={node.y} style={{opacity:.33}}/>))}
        {!result&&[["p27","companies"],["p27","people"],["p27","contracts"],["p27","places"],["p27","hypothesis"],["people","contra"],["contracts","contra"],["hypothesis","contracts"]].map(([a,b])=>{const from=hubs.find(h=>h.id===a)!;const to=hubs.find(h=>h.id===b)!;return <line key={`${a}${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={b==="contra"?"challenge":"major"}/>})}
        {!result&&satellites.map(node=><circle key={node.id} cx={node.x} cy={node.y} r={node.r/8} fill={colors[node.kind]} className="satellite" onClick={()=>{setActive(node.hub);setPanel("inspect")}}><title>{`${node.kind} linked to ${copy[node.hub]?.title}`}</title></circle>)}
        {result&&livePositions.map(record=><line key={`line-${record.id}`} x1="48" y1="48" x2={record.x} y2={record.y} className="major"/>)}
      </svg>
      {!result&&hubs.map(hub=><button key={hub.id} onClick={()=>toggle(hub.id)} className={`hub hub-${hub.kind} ${active===hub.id?"active":""} ${selected.includes(hub.id)?"selected":""}`} style={{left:`${hub.x}%`,top:`${hub.y}%`,"--node-color":colors[hub.kind]} as React.CSSProperties}><i/><strong>{hub.label}</strong><small>{hub.sub}</small></button>)}
      {result&&<button className="hub hub-pattern active live-centre" style={{left:"48%",top:"48%","--node-color":colors.pattern} as React.CSSProperties}><i/><strong>LIVE INVESTIGATION</strong><small>{result.pattern.length?result.pattern.join(" · "):result.query}</small></button>}
      {result&&livePositions.map(record=><button key={record.id} onClick={()=>selectLive(record)} className={`hub live-record ${activeLiveId===record.id?"active":""} ${liveSelected.includes(record.id)?"selected":""}`} style={{left:`${record.x}%`,top:`${record.y}%`,"--node-color":record.source==="Crossref"?colors.evidence:colors.hypothesis} as React.CSSProperties}><i/><strong>{record.source} · {record.year??"n.d."}</strong><small>{record.title}</small></button>)}
      </div>
      {surprise&&<div className="anomaly"><span>DEMO PATTERN · 04</span><b>Three vendors share directors, addresses and award timing</b><p>Illustrative data—run a live search for retrieved evidence.</p><button onClick={()=>setSurprise(false)}>Close</button></div>}
      <div className="map-key"><b>MAP KEY</b>{(["evidence","concept","pattern","hypothesis","contradiction"] as Kind[]).map(kind=><span key={kind}><i style={{background:colors[kind]}}/>{kind}</span>)}</div>
      {!result?<div className="selected-tray"><span>{selected.length}</span><div><b>Nodes selected</b><small>{selected.map(id=>copy[id]?.title).join(" · ")}</small></div><button onClick={()=>setSelected([])}>Clear</button><button className="run" disabled={selected.length<2} onClick={investigate}>✦ Investigate relationship</button></div>:<div className="selected-tray live-tray"><span>{liveSelected.length}</span><div><b>{result.records.length} live nodes · select two to compare</b><small>{liveSelected.map(id=>result.records.find(record=>record.id===id)?.title).filter(Boolean).join(" ↔ ")||`${result.liveSources.join(" + ")} · drag, scroll or rotate the canvas`}</small></div><button onClick={()=>setLiveSelected([])}>Clear</button><button className="run" disabled={liveSelected.length!==2} onClick={crossReference}>Cross-reference</button></div>}
    </section>
    <aside className="right-dock"><div className="dock-tabs"><button onClick={()=>setPanel("inspect")} className={panel==="inspect"?"active":""}>Inspect</button><button onClick={()=>setPanel("sources")} className={panel==="sources"?"active":""}>Sources</button><button onClick={()=>setPanel("controls")} className={panel==="controls"?"active":""}>Controls</button><button aria-label="Close panel">×</button></div>
      {panel==="inspect"?<div className="inspector">{activeLive?<><div className="evidence-status"><i style={{background:activeLive.source==="Crossref"?colors.evidence:colors.hypothesis}}/><span>Retrieved evidence · {activeLive.source}</span><em>{activeLive.year??"n.d."}</em></div><h1>{activeLive.title}</h1><p>{activeLive.evidence}</p>{crossInsight&&<div className="cross-insight"><b>Cross-reference pattern</b><p>{crossInsight}</p></div>}<div className="metric-grid"><div><b>{activeLive.authors.length}</b><span>authors shown</span></div><div><b>{activeLive.source}</b><span>live source</span></div><div><b>{activeLive.doi?"DOI":"ID"}</b><span>{activeLive.sourceId.slice(0,16)}</span></div></div><section className="lineage"><header><span>PROVENANCE CHAIN</span><b>live</b></header><div><i/><p><b>{activeLive.source} API</b><span>Retrieved {new Date(activeLive.retrievedAt).toLocaleString()}</span></p></div><div><i/><p><b>Immutable source identifier</b><span>{activeLive.sourceId}</span></p></div></section><a className="open-source" href={activeLive.uri} target="_blank" rel="noreferrer">Open original evidence <span>↗</span></a><button className="go-deeper" disabled={loading} onClick={()=>fetchInvestigation(activeLive.title.split(" ").slice(0,10).join(" "),true)}>{loading?"Expanding…":"Go deeper from this node +"}</button></>:<><div className="evidence-status"><i style={{background:colors[hubs.find(h=>h.id===active)?.kind??"pattern"]}}/><span>{d.k} · demo</span><em>{hubs.find(h=>h.id===active)?.score??82}/100</em></div><h1>{d.title}</h1><p>{d.body}</p><div className="metric-grid">{d.metrics.map(metric=><div key={metric}><b>{metric.split(" ")[0]}</b><span>{metric.substring(metric.indexOf(" ")+1)}</span></div>)}</div><section className="lineage"><header><span>PROVENANCE CHAIN</span><b>illustrative</b></header><div><i/><p><b>Prototype record</b><span>Use live search for source-backed evidence</span></p></div></section><div className="challenge-actions"><button onClick={()=>setActive("contra")}>Show evidence against</button><button onClick={()=>setActive("hypothesis")}>Create hypothesis</button></div></>}</div>:panel==="sources"?<div className="sources-panel"><header><span>DATA CONNECTORS</span><button onClick={()=>setPanel("controls")}>Search live sources</button></header><p>Crossref and OpenAlex are connected now. Other sources are clearly marked as planned.</p><div className="source-summary"><div><b>2</b><span>live now</span></div><div><b>6</b><span>planned</span></div><div><b>{result?.records.length??0}</b><span>retrieved</span></div></div><div className="connector-list">{connectors.map(connector=><button key={connector.name} onClick={()=>connector.state==="live"&&setPanel("controls")}><i className={`connector-icon ${connector.state}`}>{connector.name[0]}</i><span><b>{connector.name}</b><small>{connector.type}</small></span><em className={connector.state}>{connector.state}</em><strong>{connector.items}</strong></button>)}</div></div>:<div className="controls"><form onSubmit={runLiveInvestigation}><label>Search connected sources<input aria-label="Connected source query" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Topic, entity or relationship"/></label><button className="control-run" disabled={loading}>{loading?"Retrieving evidence…":"Build investigation graph"}</button></form><section><header>ACTIVE CONNECTORS</header><label><span><i style={{background:colors.evidence}}/>Crossref</span><b>LIVE</b></label><label><span><i style={{background:colors.hypothesis}}/>OpenAlex</span><b>LIVE</b></label></section><section><header>CANVAS</header><label><span>Mouse wheel</span><b>ZOOM</b></label><label><span>Drag background</span><b>PAN</b></label><label><span>↻ toolbar button</span><b>ROTATE</b></label></section></div>}
    </aside>
    {!result&&<button className={`ai-tab ${aiOpen?"open":""}`} onClick={()=>setAiOpen(!aiOpen)}>✦ AI Investigator <span>{aiOpen?"×":"↑"}</span></button>}
    {aiOpen&&<div className="ai-drawer"><header><b>✦ Prototype Investigator</b><button onClick={()=>setAiOpen(false)}>×</button></header><div className="ai-copy">This analysis uses illustrative data. Search Crossref and OpenAlex above to build a real, source-linked evidence graph.</div><div className="ai-chips"><button onClick={()=>setActive("contra")}>Find evidence against this</button><button onClick={()=>setActive("hypothesis")}>Create hypothesis</button></div></div>}
  </main>
}
