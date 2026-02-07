export type Role = "system" | "user" | "assistant";

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
}

export interface IChatRepository {
  load(): Promise<RepositoryState>;
  save(state: RepositoryState): Promise<void>;
}

export interface IModelCatalog {
  getModels(): Promise<ModelDescriptor[]>;
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
