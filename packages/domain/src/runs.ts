import type {
  ChatRun,
  ChatRunLaneResult,
  RepositoryState,
  RunMode,
  RunStatus
} from "../../contracts/src";
import { createId, nowIso } from "./ids.js";

const ALLOWED_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  idle: ["queued", "cancelled"],
  queued: ["streaming", "verifying", "cancelled", "failed", "timeout"],
  streaming: ["verifying", "completed", "failed", "cancelled", "timeout"],
  verifying: ["completed", "failed", "cancelled", "timeout"],
  completed: [],
  failed: [],
  cancelled: [],
  timeout: []
};

export const createRun = (input: {
  threadId: string;
  mode: RunMode;
  modelIds: string[];
}): ChatRun => {
  const createdAt = nowIso();
  const lanes: ChatRunLaneResult[] = input.modelIds.map((modelId) => ({
    id: createId(),
    modelId,
    status: "queued",
    content: "",
    createdAt,
    updatedAt: createdAt
  }));

  return {
    id: createId(),
    threadId: input.threadId,
    mode: input.mode,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    lanes
  };
};

export const transitionRunStatus = (
  run: ChatRun,
  nextStatus: RunStatus
): ChatRun => {
  if (!ALLOWED_TRANSITIONS[run.status].includes(nextStatus)) {
    throw new Error(`Invalid run status transition: ${run.status} -> ${nextStatus}`);
  }

  return {
    ...run,
    status: nextStatus,
    updatedAt: nowIso()
  };
};

export const updateLaneStatus = (
  run: ChatRun,
  laneId: string,
  status: RunStatus,
  contentDelta?: string
): ChatRun => {
  const updatedAt = nowIso();
  return {
    ...run,
    updatedAt,
    lanes: run.lanes.map((lane) =>
      lane.id === laneId
        ? {
            ...lane,
            status,
            content: contentDelta ? lane.content + contentDelta : lane.content,
            updatedAt
          }
        : lane
    )
  };
};

export const upsertRun = (state: RepositoryState, run: ChatRun): RepositoryState => ({
  ...state,
  runs: state.runs.some((existing) => existing.id === run.id)
    ? state.runs.map((existing) => (existing.id === run.id ? run : existing))
    : [run, ...state.runs]
});

export const findRun = (state: RepositoryState, runId: string): ChatRun | undefined =>
  state.runs.find((run) => run.id === runId);
