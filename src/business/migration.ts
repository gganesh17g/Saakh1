import { emptyOperations } from "./operationsModel";
import { type BusinessState } from "./model";
export function migrateBusinessState(input: unknown): BusinessState {
  if (!input || typeof input !== "object") throw Error("Invalid local ledger");
  const value = structuredClone(input) as Record<string, unknown>;
  if (value.version !== 1 && value.version !== 2)
    throw Error("Unsupported local ledger format");
  if (value.version === 1) {
    for (const [key, rows] of Object.entries(emptyOperations())) {
      if (value[key] !== undefined && !Array.isArray(value[key]))
        throw Error("Invalid migration collection " + key);
      value[key] ??= rows;
    }
    value.version = 2;
  }
  return value as unknown as BusinessState;
}
