import type { ChatMessage, ChatThread, RepositoryState } from "../../contracts/src";
import { createId, nowIso } from "./ids.js";

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

export const createBranchThread = (
  state: RepositoryState,
  sourceThreadId: string,
  messageId: string
): { nextState: RepositoryState; branchThread: ChatThread } => {
  const sourceThread = state.threads.find((thread) => thread.id === sourceThreadId);
  if (!sourceThread) {
    throw new Error("Source thread not found.");
  }

  const messageIndex = sourceThread.messages.findIndex((message) => message.id === messageId);
  if (messageIndex === -1) {
    throw new Error("Branch message not found.");
  }

  const createdAt = nowIso();
  const branchThread: ChatThread = {
    ...sourceThread,
    id: createId(),
    title: `Branch of ${sourceThread.title}`,
    createdAt,
    updatedAt: createdAt,
    parentThreadId: sourceThread.id,
    branchFromMessageId: messageId,
    messages: sourceThread.messages.slice(0, messageIndex + 1)
  };

  return {
    nextState: {
      ...state,
      threads: [branchThread, ...state.threads]
    },
    branchThread
  };
};
