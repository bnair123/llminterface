import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatThread, ModelDescriptor, RepositoryState } from "../../../../packages/contracts/src";
import { appendMessage, createId, nowIso, upsertThread } from "../../../../packages/domain/src";
import { LocalChatRepository, MockModelProvider, StaticModelCatalog } from "../services";

const repository = new LocalChatRepository();
const modelCatalog = new StaticModelCatalog();
const modelProvider = new MockModelProvider();

export const useChatApp = () => {
  const [state, setState] = useState<RepositoryState | null>(null);
  const [models, setModels] = useState<ModelDescriptor[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void (async () => {
      const [loadedState, loadedModels] = await Promise.all([
        repository.load(),
        modelCatalog.getModels()
      ]);
      setState(loadedState);
      setModels(loadedModels);
      setActiveThreadId(loadedState.threads[0]?.id ?? "");
    })();
  }, []);

  const activeThread = useMemo(
    () => state?.threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, state]
  );

  const persist = useCallback(async (nextState: RepositoryState) => {
    setState(nextState);
    await repository.save(nextState);
  }, []);

  const selectModel = useCallback(
    async (modelId: string) => {
      if (!state || !activeThread) {
        return;
      }
      await persist(
        upsertThread(state, {
          ...activeThread,
          modelId,
          updatedAt: nowIso()
        })
      );
    },
    [activeThread, persist, state]
  );

  const createThread = useCallback(async () => {
    if (!state) {
      return;
    }

    const projectId = state.projects[0]?.id;
    const folderId = state.folders.find((folder) => folder.projectId === projectId)?.id;
    if (!projectId || !folderId) {
      return;
    }

    const createdAt = nowIso();
    const thread: ChatThread = {
      id: createId(),
      projectId,
      folderId,
      title: "New Chat",
      modelId: models[0]?.id ?? "gpt-4.1-mini",
      createdAt,
      updatedAt: createdAt,
      messages: []
    };

    const nextState = { ...state, threads: [thread, ...state.threads] };
    await persist(nextState);
    setActiveThreadId(thread.id);
  }, [models, persist, state]);

  const sendMessage = useCallback(async () => {
    if (!state || !activeThread || isStreaming || !draft.trim()) {
      return;
    }

    setIsStreaming(true);
    const userAppended = appendMessage(activeThread, {
      role: "user",
      content: draft.trim()
    });

    let assistant = appendMessage(userAppended, {
      role: "assistant",
      content: ""
    });

    setDraft("");

    let nextState = upsertThread(state, assistant);
    await persist(nextState);

    for await (const token of modelProvider.streamCompletion({
      modelId: assistant.modelId,
      messages: assistant.messages
    })) {
      const lastIndex = assistant.messages.length - 1;
      const nextMessages = assistant.messages.map((message, index) =>
        index === lastIndex
          ? {
              ...message,
              content: message.content + token.delta
            }
          : message
      );

      assistant = {
        ...assistant,
        messages: nextMessages,
        updatedAt: nowIso()
      };

      nextState = upsertThread(nextState, assistant);
      setState(nextState);

      if (token.done) {
        break;
      }
    }

    await repository.save(nextState);
    setIsStreaming(false);
  }, [activeThread, draft, isStreaming, persist, state]);

  return {
    state,
    models,
    activeThread,
    activeThreadId,
    setActiveThreadId,
    isStreaming,
    draft,
    setDraft,
    sendMessage,
    createThread,
    selectModel
  };
};
