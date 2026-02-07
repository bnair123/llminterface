import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createInitialState,
  createRun,
  transitionRunStatus,
  updateLaneStatus,
  upsertRun
} from "../packages/domain/dist/domain/src/index.js";

test("createRun builds lanes for each model", () => {
  const run = createRun({
    threadId: "thread-1",
    mode: "parallel",
    modelIds: ["alpha", "beta"]
  });

  assert.equal(run.status, "queued");
  assert.equal(run.lanes.length, 2);
});

test("transitionRunStatus enforces valid transitions", () => {
  const run = createRun({
    threadId: "thread-1",
    mode: "single",
    modelIds: ["alpha"]
  });

  const streaming = transitionRunStatus(run, "streaming");
  assert.equal(streaming.status, "streaming");
  assert.throws(() => transitionRunStatus(streaming, "queued"));
});

test("updateLaneStatus appends content", () => {
  const run = createRun({
    threadId: "thread-1",
    mode: "single",
    modelIds: ["alpha"]
  });

  const laneId = run.lanes[0].id;
  const updated = updateLaneStatus(run, laneId, "streaming", "Hello");

  assert.equal(updated.lanes[0].content, "Hello");
});

test("upsertRun inserts the run into repository state", () => {
  const state = createInitialState();
  const run = createRun({
    threadId: state.threads[0].id,
    mode: "single",
    modelIds: ["alpha"]
  });

  const nextState = upsertRun(state, run);

  assert.equal(nextState.runs.length, 1);
  assert.equal(nextState.runs[0].id, run.id);
});
