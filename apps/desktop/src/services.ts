import type {
  ChatMessage,
  IChatRepository,
  IModelCatalog,
  IModelProvider,
  ModelDescriptor,
  RawModelRecord,
  RepositoryState,
  StreamingToken
} from "../../../packages/contracts/src";
import {
  createInitialState,
  ensureRepositoryState,
  normalizeModels
} from "../../../packages/domain/src";

const STORAGE_KEY = "llm-desktop-state-v1";

const RAW_MODELS: RawModelRecord[] = [
  {
    modelId: "gpt-4.1-mini",
    providerName: "openai",
    name: "GPT-4.1 mini",
    limits: { context: 128000 },
    pricing: { inputPerMToken: 0.4, outputPerMToken: 1.6 },
    capabilities: ["text", "vision"]
  },
  {
    modelId: "claude-3.7-sonnet",
    providerName: "anthropic",
    name: "Claude 3.7 Sonnet",
    limits: { context: 200000 },
    pricing: { inputPerMToken: 3.0, outputPerMToken: 15.0 },
    capabilities: ["text"]
  },
  {
    modelId: "gemini-2.0-flash",
    providerName: "google",
    name: "Gemini 2.0 Flash",
    limits: { context: 1000000 },
    pricing: { inputPerMToken: 0.1, outputPerMToken: 0.4 },
    capabilities: ["text", "vision"]
  }
];

export class LocalChatRepository implements IChatRepository {
  async load(): Promise<RepositoryState> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createInitialState();
      await this.save(seed);
      return seed;
    }

    try {
      return ensureRepositoryState(JSON.parse(raw) as RepositoryState);
    } catch {
      const seed = createInitialState();
      await this.save(seed);
      return seed;
    }
  }

  async save(state: RepositoryState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export class StaticModelCatalog implements IModelCatalog {
  async getModels(): Promise<ModelDescriptor[]> {
    return normalizeModels(RAW_MODELS);
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockModelProvider implements IModelProvider {
  async *streamCompletion(input: {
    modelId: string;
    messages: ChatMessage[];
  }): AsyncGenerator<StreamingToken, void, unknown> {
    const userPrompt = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const answer = [
      `### ${input.modelId} response`,
      "",
      `You asked: **${userPrompt || "(empty prompt)"}**`,
      "",
      "This is a mocked stream for Phase 1 scaffolding.",
      "",
      "```ts",
      "const phase = 1;",
      "console.log(`Streaming from phase ${phase}`);",
      "```",
      "",
      "Inline math: $E = mc^2$"
    ].join("\n");

    for (const token of answer.split(" ")) {
      await wait(35);
      yield { delta: `${token} `, done: false };
    }

    yield { delta: "", done: true };
  }
}
