import type { RepositoryState } from "../../contracts/src";
import { createId, nowIso } from "./ids.js";

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
    ],
    runs: []
  };
};

const EMPTY_STATE: RepositoryState = {
  projects: [],
  folders: [],
  threads: [],
  runs: []
};

export const ensureRepositoryState = (state: Partial<RepositoryState>): RepositoryState => ({
  ...EMPTY_STATE,
  ...state,
  projects: state.projects ?? EMPTY_STATE.projects,
  folders: state.folders ?? EMPTY_STATE.folders,
  threads: state.threads ?? EMPTY_STATE.threads,
  runs: state.runs ?? EMPTY_STATE.runs
});
