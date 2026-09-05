# Open-source reuse assessment

Updated 5 September 2026. This is a product-engineering shortlist, not a list of every graph or RAG project.

## Recommendation

Reuse components, not an entire competitor. Keep Noema's evidence schema, epistemic states, pattern methodology, source-independence logic, and investigation loop proprietary.

| Layer | Candidate | Reuse | Recommendation |
|---|---|---|---|
| Dense graph rendering | Sigma.js + Graphology | WebGL rendering, events, graph structure, layouts and algorithms | First choice for thousands to hundreds of thousands of visible elements. Build Noema's interaction layer above it. |
| Rich graph interaction | Cytoscape.js | Compound nodes, selectors, traversal, layouts, graph algorithms | Use instead of Sigma when investigation gestures and semantic graph editing matter more than extreme density. Prototype both on the same 10k-node corpus before committing. |
| Fast force-graph prototype | react-force-graph-2d | Canvas renderer, force simulation, zoom, pan, drag and picking | Excellent for a spike; avoid making it the long-term UI foundation until label, accessibility and deterministic-layout needs are tested. |
| Document parsing | Docling | PDF/Office/image/audio parsing, OCR, layout, tables and lossless JSON | Adopt. Do not build document parsing. Preserve Docling coordinates and page references in provenance records. |
| Graph extraction reference | Neo4j LLM Graph Builder | Ingestion patterns, schema-constrained extraction, provider adapters and graph preview | Cannibalise patterns and test fixtures, not the whole application. Neo4j should remain optional for the MVP. |
| Community extraction / GraphRAG | Microsoft GraphRAG | Entity/relationship extraction, claims, community detection and community summaries | Study and selectively reuse methodology. The repository is now maintenance-oriented and warns about indexing cost, so do not adopt it wholesale. |
| Scientific evidence pipeline | Insight Weaver | Claim/evidence modeling, cross-paper contradiction flow and hypothesis generation | Fork ideas and evaluation cases; do a code/license/dependency audit before copying modules. |
| Forensic provenance UX | Incident Lens | Temporal graph, timestamped evidence, SUPPORTS/CONTRADICTS model | Reuse the schema and interaction ideas as a vertical reference, not as the core platform. |
| Vector search | PostgreSQL + pgvector | Embeddings and filtered semantic retrieval next to relational evidence records | Start here. Do not introduce a separate vector database for the MVP. |
| Statistical analysis | SciPy, scikit-learn, statsmodels, NetworkX | Clustering, anomaly detection, graph measures, significance tests | Adopt mature primitives; keep pattern definitions, multiple-testing policy and audit outputs in Noema-owned code. |

## Architecture boundary

Safe to borrow:

- Rendering, pan/zoom/picking, force and community layouts
- Parsing, OCR, chunking and page-coordinate extraction
- Embedding storage and standard statistical routines
- Generic extraction adapters and evaluation harnesses

Must remain Noema-owned:

- Observation → relationship → pattern → hypothesis → finding state model
- Evidence lineage and source-dependency grouping
- Pattern scoring, confounder tracking and multiple-comparison policy
- Sceptic workflow and missing-expected-evidence analysis
- Progressive investigation state, visual grammar and user interaction loop

## Proposed technical spike

1. Parse 20–50 controlled documents with Docling into provenance-preserving JSON.
2. Store sources, passages, entities, claims and typed edges in PostgreSQL; use pgvector for similarity.
3. Render the same 10,000-node synthetic corpus in Sigma.js and Cytoscape.js.
4. Measure initial render, pan/zoom frame rate, label quality, lasso selection, progressive expansion and filtered subgraph transitions.
5. Choose the renderer from evidence. Do not choose a graph database based on the visual renderer.

## Licence note

Most shortlisted infrastructure is permissively licensed, but every dependency and copied module still needs a current licence and transitive-dependency review before commercial distribution. Preserve notices and avoid copying product UI or branding.
