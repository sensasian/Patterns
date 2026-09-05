import type {
  EvidenceBundle,
  EvidenceSpan,
  Identifier,
  InvestigationSlice,
  ParsedArtifact,
  PatternNode,
  SourceRecord,
} from "./evidence-model";

/** A connector fetches records; it never writes directly to the graph. */
export interface SourceAdapter<TConfig = unknown> {
  readonly id: string;
  discover(config: TConfig, cursor?: string): Promise<SourcePage>;
  fetch(candidate: SourceCandidate, config: TConfig): Promise<SourcePayload>;
}

export interface SourceCandidate {
  externalId: string;
  uri: string;
  title?: string;
  metadata: Record<string, unknown>;
}

export interface SourcePage {
  candidates: SourceCandidate[];
  nextCursor?: string;
}

export interface SourcePayload {
  candidate: SourceCandidate;
  mediaType: string;
  bytes: Uint8Array;
  retrievedAt: string;
}

export interface DocumentParser {
  readonly id: string;
  readonly version: string;
  supports(mediaType: string): boolean;
  parse(source: SourceRecord, payload: SourcePayload): Promise<ParseResult>;
}

export interface ParseResult {
  artifact: ParsedArtifact;
  spans: EvidenceSpan[];
  structuredContent?: unknown;
}

/** LightRAG and other retrieval systems implement this interface via adapters. */
export interface RetrievalEngine {
  readonly id: string;
  index(bundle: EvidenceBundle): Promise<void>;
  retrieve(query: RetrievalQuery): Promise<RetrievalResult>;
  removeWorkspace(workspaceId: Identifier): Promise<void>;
}

export interface RetrievalQuery {
  workspaceId: Identifier;
  text: string;
  sourceIds?: Identifier[];
  limit: number;
}

export interface RetrievalHit {
  evidenceSpanId: Identifier;
  score: number;
  method: string;
}

export interface RetrievalResult {
  hits: RetrievalHit[];
  engineVersion: string;
  queryTraceId: Identifier;
}

export interface PatternDetector<TConfig = unknown> {
  readonly id: string;
  readonly version: string;
  detect(bundle: EvidenceBundle, config: TConfig): Promise<PatternNode[]>;
}

export interface InvestigationPlanner {
  plan(request: InvestigationRequest, bundle: EvidenceBundle): Promise<InvestigationSlice>;
}

export interface InvestigationRequest {
  workspaceId: Identifier;
  lens: InvestigationSlice["lens"];
  focalNodeIds: Identifier[];
  question?: string;
  visibleNodeLimit: number;
}
