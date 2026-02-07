export type Role = "system" | "user" | "assistant";
export type RunMode = "single" | "parallel" | "verify";
export type RunStatus =
  | "idle"
  | "queued"
  | "streaming"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled"
  | "timeout";

export interface ModelDescriptor {
  id: string;
  provider: string;
  displayName: string;
  contextWindow: number;
  inputCostPerMillion?: number;
  outputCostPerMillion?: number;
  supportsVision: boolean;
}

export interface RawModelRecord {
  modelId: string;
  providerName: string;
  name?: string;
  limits?: {
    context?: number;
  };
  pricing?: {
    inputPerMToken?: number;
    outputPerMToken?: number;
  };
  capabilities?: string[];
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  projectId: string;
  folderId: string;
  title: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  parentThreadId?: string;
  branchFromMessageId?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface RepositoryState {
  projects: Project[];
  folders: Folder[];
  threads: ChatThread[];
  runs: ChatRun[];
}

export interface IChatRepository {
  load(): Promise<RepositoryState>;
  save(state: RepositoryState): Promise<void>;
}

export interface IModelCatalog {
  getModels(): Promise<ModelDescriptor[]>;
}

export interface ChatRunLaneResult {
  id: string;
  modelId: string;
  status: RunStatus;
  content: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface ChatRun {
  id: string;
  threadId: string;
  mode: RunMode;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  lanes: ChatRunLaneResult[];
  error?: string;
}

export interface RunRequest {
  threadId: string;
  mode: RunMode;
  modelIds: string[];
}

export interface IOrchestrator {
  startRun(request: RunRequest): Promise<ChatRun>;
  cancelRun(runId: string): Promise<ChatRun>;
  streamRun(runId: string): AsyncGenerator<StreamingToken, void, unknown>;
}

export interface StreamingToken {
  delta: string;
  done: boolean;
}

export interface IModelProvider {
  streamCompletion(input: {
    modelId: string;
    messages: ChatMessage[];
  }): AsyncGenerator<StreamingToken, void, unknown>;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  score?: number;
  publishedAt?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface ISearchProvider {
  search(query: string): Promise<SearchResponse>;
}

export interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpServerDescriptor {
  id: string;
  displayName: string;
  health: "healthy" | "degraded" | "offline";
  tools: McpToolDescriptor[];
}

export interface McpToolCall {
  serverId: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface McpToolResult {
  toolName: string;
  output: Record<string, unknown>;
  durationMs: number;
}

export interface IMcpServerAdapter {
  listServers(): Promise<McpServerDescriptor[]>;
  callTool(call: McpToolCall): Promise<McpToolResult>;
  healthCheck(serverId: string): Promise<McpServerDescriptor>;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  artifacts: FileArtifact[];
  durationMs: number;
}

export interface IPythonRuntime {
  execute(code: string): Promise<PythonExecutionResult>;
}

export interface FileArtifact {
  id: string;
  name: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
  uri: string;
}

export interface FileSummary {
  id: string;
  name: string;
  mimeType: string;
  extractedText?: string;
  checksum: string;
}

export interface IFileProcessor {
  process(file: File): Promise<FileSummary>;
}

export interface MemoryEntry {
  id: string;
  scope: "user" | "project" | "thread";
  scopeId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  policy: "manual" | "auto";
}

export interface IMemoryStore {
  list(scope: MemoryEntry["scope"], scopeId: string): Promise<MemoryEntry[]>;
  save(entry: MemoryEntry): Promise<MemoryEntry>;
  forget(entryId: string): Promise<void>;
}

export interface SyncCheckpoint {
  id: string;
  cursor: string;
  createdAt: string;
}

export interface ISyncEngine {
  checkpoint(state: RepositoryState): Promise<SyncCheckpoint>;
  applyRemote(checkpoint: SyncCheckpoint): Promise<RepositoryState>;
}
