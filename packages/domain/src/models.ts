import type { ModelDescriptor, RawModelRecord } from "../../contracts/src";

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
