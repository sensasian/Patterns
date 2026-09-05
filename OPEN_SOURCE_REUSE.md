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
| Graph investigation interaction | Truth Seeker | React Flow selection, Dagre layout and node-expansion interaction | Use as a small UX reference only. Its extraction, persistence and provenance are not production foundations. |
| GraphRAG engine | LightRAG | Parsing, chunking, graph extraction, retrieval, storage adapters and integrity tooling | Best current backend candidate, but only behind Noema's evidence and retrieval interfaces. |
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

## Insight Weaver audit

Pinned reference: `tooling/insight-weaver` at upstream revision `20240d8` (18 May 2026).

### Reuse or adapt

- FastAPI route and dependency structure
- Workspace header and per-request isolation pattern
- Asynchronous paper-processing pipeline shape
- Scientific text cleaning and sentence splitting
- Hybrid retrieval that merges database, lexical and vector candidates
- API contracts for graph search, hypotheses, contradictions and cross-paper connections
- Deterministic fallback behavior when the local model is unavailable

### Do not adopt unchanged

- The scientific-paper-specific ontology and extraction rules
- Chroma as a second persistence system before PostgreSQL plus pgvector is tested
- The tightly coupled Gemma/Ollama reasoning layer
- Its frontend, which is a compact demonstration rather than the progressive investigation canvas
- Pairwise LLM contradiction calls as a trustworthy contradiction engine
- Similarity-only “unexplored connections” as a curiosity engine

### Evidence-model gaps to fix before reuse

- `EntityRelationship` stores free-text evidence and a paper ID, but not an immutable chunk/span ID, character offsets, page coordinates, extraction version, or direct-versus-inferred status.
- Chunks have an optional page number but the parser materializes section text without preserving line-level page coordinates through the pipeline.
- There is no source-lineage or dependency graph, so derivative sources cannot be discounted as non-independent confirmations.
- Patterns, observations and findings are not distinct persisted node types with separate promotion rules.
- Contradiction results are model verdicts without calibrated evaluation, replication, or deterministic checks.
- Entity uniqueness is defined by normalized name and type without `workspace_id`; paper DOI/arXiv/PubMed identifiers are also globally unique. This can create cross-workspace conflicts even though API reads are workspace-filtered.

### Licensing caution

The repository README declares `license: mit`, but the pinned revision does not contain a standalone `LICENSE` file. Treat it as a reference until the upstream licensing artifact is clarified. Do not copy source into Noema's production codebase solely on the README declaration.

### Architectural decision

Use Insight Weaver as an executable reference and test corpus, not as a fork. Extract interfaces and behavior behind Noema-owned boundaries:

`SourceAdapter → ParsedArtifact → EvidenceSpan → ExtractionRun → Observation/Entity/Relationship → PatternCandidate → InvestigationView`

This keeps document ingestion replaceable and makes provenance mandatory before graph, hypothesis or pattern layers can consume an item.

## Truth Seeker audit

Pinned reference: `tooling/truth-seeker` at upstream revision `2b3a23b`.

### Reuse or adapt

- The select-a-node, request expansion, merge results interaction
- React Flow custom-node and hover-detail patterns
- Dagre as a quick deterministic layout option for small investigation slices
- Its narrow API surface as a prototype reference for `Investigate This`

### Do not adopt unchanged

- The frontend's full-graph re-layout after every expansion
- Model output parsed by scraping JSON and falling back to Python literal evaluation
- Raw source text interpolated directly into extraction prompts
- Empty-result error handling that hides extraction failures
- A backend without authentication, workspace isolation, persistence or evidence provenance
- Generated directories such as `node_modules` and Python caches committed in the upstream tree

### Licensing caution

The README says MIT, but the pinned revision does not include a standalone licence file. Treat it as an interaction reference and do not copy source until the licensing artifact is confirmed.

### Architectural decision

Truth Seeker is not a product base. Recreate the expansion gesture against Noema's `InvestigationPlanner`, where the AI returns a limited, explainable slice and each new node resolves to evidence.

## LightRAG audit

Pinned reference: `tooling/lightrag` at upstream revision `b825a51`.

### Reuse or adapt

- Its mature ingestion, chunking and graph-aware retrieval pipeline
- Storage abstraction patterns and workspace namespacing
- Provenance sidecars for structured document elements
- Provider, parser and storage adapter organization
- Integrity checks, migrations, evaluation and tracing patterns
- Graph, vector and key-value interfaces where they save implementation time

### Keep behind Noema interfaces

- Entity and relationship extraction
- Graph-aware retrieval and query modes
- Vector, graph and document-status storage backends
- Model/provider selection and parsing strategies

LightRAG's internal schema must not become Noema's canonical evidence model. Engine results enter the application through `RetrievalEngine` and must be promoted into Noema records only after provenance and deterministic model validation pass.

### Scope control

LightRAG supports a wide storage matrix. V1 should configure one operational path—PostgreSQL plus pgvector where practical—instead of inheriting every supported database. This keeps deployment and failure modes understandable while preserving the adapter boundary.

### Licensing

The pinned repository includes an MIT licence. Preserve its copyright and licence notice for any copied or distributed portions.

## Noema contracts added

The first product-owned boundary now lives in:

- `lib/noema/evidence-model.ts` — sources, immutable evidence spans, extraction runs, epistemic nodes, investigation slices and deterministic integrity checks
- `lib/noema/engine-contracts.ts` — adapters for connectors, parsers, retrieval engines, pattern detectors and investigation planning

These contracts deliberately separate observations, relationships, patterns, hypotheses, contradictions and reviewed findings. They also model source-dependency groups so repeated reporting of the same source cannot be mistaken for independent corroboration.
