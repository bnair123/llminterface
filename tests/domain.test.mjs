import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appendMessage,
  createBranchThread,
  createInitialState,
  ensureRepositoryState,
  normalizeModels
} from "../packages/domain/dist/domain/src/index.js";

test("createInitialState seeds one project, folder, and thread", () => {
  const state = createInitialState();

  assert.equal(state.projects.length, 1);
  assert.equal(state.folders.length, 1);
  assert.equal(state.threads.length, 1);
  assert.equal(state.runs.length, 0);
});

test("ensureRepositoryState fills optional arrays", () => {
  const state = ensureRepositoryState({ threads: [] });

  assert.deepEqual(state.projects, []);
  assert.deepEqual(state.folders, []);
  assert.deepEqual(state.runs, []);
});

test("normalizeModels applies defaults", () => {
  const [model] = normalizeModels([{ modelId: "alpha", providerName: "acme" }]);

  assert.equal(model.displayName, "alpha");
  assert.equal(model.contextWindow, 8192);
  assert.equal(model.supportsVision, false);
});

test("createBranchThread copies messages through the selected message", () => {
  const seed = createInitialState();
  let thread = seed.threads[0];

  thread = appendMessage(thread, { role: "user", content: "Hello" });
  thread = appendMessage(thread, { role: "assistant", content: "Response" });
  thread = appendMessage(thread, { role: "user", content: "Next" });

  const nextState = { ...seed, threads: [thread] };
  const { branchThread } = createBranchThread(nextState, thread.id, thread.messages[1].id);

  assert.equal(branchThread.messages.length, 2);
  assert.equal(branchThread.parentThreadId, thread.id);
});
