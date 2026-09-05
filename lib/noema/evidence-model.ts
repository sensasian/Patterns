/**
 * Noema's canonical evidence model.
 *
 * Retrieval and graph engines may populate these records, but they do not own
 * their shape. IDs must be stable within a workspace and all derived claims
 * must remain traceable to immutable evidence spans.
 */

export type Identifier = string;
export type IsoDateTime = string;

export type EpistemicKind =
  | "observation"
  | "relationship"
  | "pattern"
  | "hypothesis"
  | "contradiction"
  | "finding";

export interface SourceRecord {
  id: Identifier;
  workspaceId: Identifier;
  connectorId: Identifier;
  externalId?: string;
  uri: string;
  title: string;
  sourceType: string;
  retrievedAt: IsoDateTime;
  contentHash: string;
  /** Sources in the same group are not independent corroboration. */
  independenceGroupId: Identifier;
  derivedFromSourceIds: Identifier[];
}

export interface ParsedArtifact {
  id: Identifier;
  workspaceId: Identifier;
  sourceId: Identifier;
  parserId: Identifier;
  parserVersion: string;
  contentHash: string;
  createdAt: IsoDateTime;
}

export interface EvidenceSpan {
  id: Identifier;
  workspaceId: Identifier;
  sourceId: Identifier;
  artifactId: Identifier;
  chunkId: Identifier;
  quote: string;
  contentHash: string;
  page?: number;
  charStart?: number;
  charEnd?: number;
  boundingBoxes?: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface ExtractionRun {
  id: Identifier;
  workspaceId: Identifier;
  extractorId: Identifier;
  extractorVersion: string;
  model?: string;
  promptHash?: string;
  configHash: string;
  startedAt: IsoDateTime;
  completedAt?: IsoDateTime;
}

export interface ConfidenceAssessment {
  score: number;
  method: string;
  assessedAt: IsoDateTime;
  rationale?: string;
}

interface EvidenceGroundedNode {
  id: Identifier;
  workspaceId: Identifier;
  evidenceSpanIds: Identifier[];
  confidence?: ConfidenceAssessment;
}

export interface EntityNode {
  id: Identifier;
  workspaceId: Identifier;
  kind: "entity";
  entityType: string;
  canonicalName: string;
  aliases: string[];
  evidenceSpanIds: Identifier[];
}

export interface ObservationNode extends EvidenceGroundedNode {
  kind: "observation";
  statement: string;
  extractionRunId: Identifier;
}

export interface RelationshipNode extends EvidenceGroundedNode {
  kind: "relationship";
  subjectId: Identifier;
  predicate: string;
  objectId: Identifier;
  assertion: "direct" | "inferred";
  extractionRunId: Identifier;
}

export interface PatternMetrics {
  supportCount: number;
  independentSourceCount: number;
  effectSize?: number;
  pValue?: number;
  adjustedPValue?: number;
}

export interface PatternNode extends EvidenceGroundedNode {
  kind: "pattern";
  label: string;
  detectorId: Identifier;
  detectorVersion: string;
  memberNodeIds: Identifier[];
  contradictingEvidenceSpanIds: Identifier[];
  metrics: PatternMetrics;
  confounders: string[];
  status: "candidate" | "replicated" | "rejected";
}

export interface HypothesisNode extends EvidenceGroundedNode {
  kind: "hypothesis";
  statement: string;
  derivedFromPatternIds: Identifier[];
  contradictingEvidenceSpanIds: Identifier[];
  status: "proposed" | "testing" | "supported" | "rejected";
}

export interface ContradictionNode extends EvidenceGroundedNode {
  kind: "contradiction";
  targetNodeIds: Identifier[];
  explanation: string;
  resolution: "open" | "resolved" | "not-a-contradiction";
}

export interface FindingNode extends EvidenceGroundedNode {
  kind: "finding";
  statement: string;
  derivedFromNodeIds: Identifier[];
  review: "unreviewed" | "accepted" | "rejected";
  reviewedBy?: Identifier;
  reviewedAt?: IsoDateTime;
}

export type EpistemicNode =
  | ObservationNode
  | RelationshipNode
  | PatternNode
  | HypothesisNode
  | ContradictionNode
  | FindingNode;

export interface InvestigationSlice {
  id: Identifier;
  workspaceId: Identifier;
  lens: "pattern" | "investigate" | "sceptic" | "curiosity";
  focalNodeIds: Identifier[];
  visibleNodeIds: Identifier[];
  hiddenNodeCount: number;
  filters: Record<string, string | number | boolean | string[]>;
  createdBy: "user" | "ai";
  createdAt: IsoDateTime;
}

export interface EvidenceBundle {
  workspaceId: Identifier;
  sources: SourceRecord[];
  artifacts: ParsedArtifact[];
  evidenceSpans: EvidenceSpan[];
  extractionRuns: ExtractionRun[];
  entities: EntityNode[];
  epistemicNodes: EpistemicNode[];
}

export interface ModelIssue {
  code:
    | "WORKSPACE_MISMATCH"
    | "MISSING_EVIDENCE"
    | "UNKNOWN_REFERENCE"
    | "INVALID_CONFIDENCE"
    | "INVALID_SPAN"
    | "INVALID_FINDING_REVIEW";
  recordId: Identifier;
  message: string;
}

/** Deterministic checks required before an engine result enters Noema's graph. */
export function validateEvidenceBundle(bundle: EvidenceBundle): ModelIssue[] {
  const issues: ModelIssue[] = [];
  const sourceIds = new Set(bundle.sources.map(({ id }) => id));
  const artifactIds = new Set(bundle.artifacts.map(({ id }) => id));
  const spanIds = new Set(bundle.evidenceSpans.map(({ id }) => id));
  const runIds = new Set(bundle.extractionRuns.map(({ id }) => id));
  const nodeIds = new Set([
    ...bundle.entities.map(({ id }) => id),
    ...bundle.epistemicNodes.map(({ id }) => id),
  ]);

  const allRecords = [
    ...bundle.sources,
    ...bundle.artifacts,
    ...bundle.evidenceSpans,
    ...bundle.extractionRuns,
    ...bundle.entities,
    ...bundle.epistemicNodes,
  ];

  for (const record of allRecords) {
    if (record.workspaceId !== bundle.workspaceId) {
      issues.push({
        code: "WORKSPACE_MISMATCH",
        recordId: record.id,
        message: `Record belongs to workspace ${record.workspaceId}.`,
      });
    }
  }

  for (const artifact of bundle.artifacts) {
    if (!sourceIds.has(artifact.sourceId)) {
      issues.push(unknown(artifact.id, "source", artifact.sourceId));
    }
  }

  for (const source of bundle.sources) {
    for (const id of source.derivedFromSourceIds) {
      if (!sourceIds.has(id)) issues.push(unknown(source.id, "parent source", id));
    }
  }

  for (const span of bundle.evidenceSpans) {
    if (!sourceIds.has(span.sourceId)) issues.push(unknown(span.id, "source", span.sourceId));
    if (!artifactIds.has(span.artifactId)) issues.push(unknown(span.id, "artifact", span.artifactId));
    if (
      (span.charStart !== undefined && span.charStart < 0) ||
      (span.charEnd !== undefined && span.charEnd < 0) ||
      (span.charStart !== undefined &&
        span.charEnd !== undefined &&
        span.charEnd <= span.charStart)
    ) {
      issues.push({ code: "INVALID_SPAN", recordId: span.id, message: "Character offsets are invalid." });
    }
  }

  for (const entity of bundle.entities) {
    validateEvidence(entity, spanIds, issues);
  }

  for (const node of bundle.epistemicNodes) {
    validateEvidence(node, spanIds, issues);
    if (node.confidence && (node.confidence.score < 0 || node.confidence.score > 1)) {
      issues.push({
        code: "INVALID_CONFIDENCE",
        recordId: node.id,
        message: "Confidence score must be between 0 and 1.",
      });
    }

    if ((node.kind === "observation" || node.kind === "relationship") && !runIds.has(node.extractionRunId)) {
      issues.push(unknown(node.id, "extraction run", node.extractionRunId));
    }
    if (node.kind === "relationship") {
      if (!nodeIds.has(node.subjectId)) issues.push(unknown(node.id, "subject node", node.subjectId));
      if (!nodeIds.has(node.objectId)) issues.push(unknown(node.id, "object node", node.objectId));
    }
    if (node.kind === "pattern") {
      for (const id of node.memberNodeIds) if (!nodeIds.has(id)) issues.push(unknown(node.id, "member node", id));
      validateSpanReferences(node.id, node.contradictingEvidenceSpanIds, spanIds, issues);
    }
    if (node.kind === "hypothesis") {
      for (const id of node.derivedFromPatternIds) if (!nodeIds.has(id)) issues.push(unknown(node.id, "pattern", id));
      validateSpanReferences(node.id, node.contradictingEvidenceSpanIds, spanIds, issues);
    }
    if (node.kind === "contradiction") {
      for (const id of node.targetNodeIds) if (!nodeIds.has(id)) issues.push(unknown(node.id, "target node", id));
    }
    if (node.kind === "finding") {
      for (const id of node.derivedFromNodeIds) if (!nodeIds.has(id)) issues.push(unknown(node.id, "derived node", id));
      const hasAnyReviewMetadata = Boolean(node.reviewedBy || node.reviewedAt);
      const reviewMetadataComplete = Boolean(node.reviewedBy && node.reviewedAt);
      if ((node.review === "unreviewed" && hasAnyReviewMetadata) || (node.review !== "unreviewed" && !reviewMetadataComplete)) {
        issues.push({
          code: "INVALID_FINDING_REVIEW",
          recordId: node.id,
          message: "Reviewed findings require reviewer and timestamp; unreviewed findings must omit them.",
        });
      }
    }
  }

  return issues;
}

function validateEvidence(
  record: { id: Identifier; evidenceSpanIds: Identifier[] },
  spanIds: Set<Identifier>,
  issues: ModelIssue[],
): void {
  if (record.evidenceSpanIds.length === 0) {
    issues.push({ code: "MISSING_EVIDENCE", recordId: record.id, message: "Record has no supporting evidence." });
  }
  validateSpanReferences(record.id, record.evidenceSpanIds, spanIds, issues);
}

function validateSpanReferences(
  recordId: Identifier,
  references: Identifier[],
  spanIds: Set<Identifier>,
  issues: ModelIssue[],
): void {
  for (const id of references) if (!spanIds.has(id)) issues.push(unknown(recordId, "evidence span", id));
}

function unknown(recordId: Identifier, type: string, referencedId: Identifier): ModelIssue {
  return {
    code: "UNKNOWN_REFERENCE",
    recordId,
    message: `Unknown ${type}: ${referencedId}.`,
  };
}
