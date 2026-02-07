import type {
  ChatMessage,
  ChatThread,
  ModelDescriptor,
  RawModelRecord,
  RepositoryState
} from "../../contracts/src";

export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const nowIso = () => new Date().toISOString();

export const normalizeModels = (records: RawModelRecord[]): ModelDescriptor[] => {
  return records.map((record) => ({
    id: record.modelId,
    provider: record.providerName,
    displayName: record.name ?? record.modelId,
    contextWindow: record.limits?.context ?? 8192,
    inputCostPerMillion: record.pricing?.inputPerMToken,
    outputCostPerMillion: record.pricing?.outputPerMToken,
    supportsVision: (record.capabilities ?? []).includes("vision")
  }));
};

export const createInitialState = (): RepositoryState => {
  const createdAt = nowIso();
  const projectId = createId();
  const folderId = createId();
  const threadId = createId();

  return {
    projects: [{ id: projectId, name: "Default Project", createdAt }],
    folders: [{ id: folderId, projectId, name: "General", createdAt }],
    threads: [
      {
        id: threadId,
        projectId,
        folderId,
        title: "New Chat",
        modelId: "gpt-4.1-mini",
        createdAt,
        updatedAt: createdAt,
        messages: []
      }
    ]
  };
};

export const appendMessage = (
  thread: ChatThread,
  message: Omit<ChatMessage, "id" | "createdAt">
): ChatThread => {
  const nextMessage: ChatMessage = {
    id: createId(),
    createdAt: nowIso(),
    ...message
  };

  const nextTitle =
    thread.messages.length === 0 && message.role === "user"
      ? message.content.slice(0, 48) || "New Chat"
      : thread.title;

  return {
    ...thread,
    title: nextTitle,
    updatedAt: nowIso(),
    messages: [...thread.messages, nextMessage]
  };
};

export const upsertThread = (
  state: RepositoryState,
  nextThread: ChatThread
): RepositoryState => ({
  ...state,
  threads: state.threads.some((thread) => thread.id === nextThread.id)
    ? state.threads.map((thread) =>
        thread.id === nextThread.id ? nextThread : thread
      )
    : [nextThread, ...state.threads]
});
