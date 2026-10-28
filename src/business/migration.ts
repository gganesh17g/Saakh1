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
  if (
    value.operationsRevision !== undefined &&
    value.operationsRevision !== 1 &&
    value.operationsRevision !== 2
  )
    throw Error("Unsupported operations revision");
  if (value.operationsRevision !== 2) {
    if (Array.isArray(value.credits) && Array.isArray(value.returns))
      for (const row of value.credits) {
        const credit = row as {
          journalId: string;
          refundAmount?: number;
          liabilityAmount?: number;
          returnId?: string;
        };
        const source = (
          value.returns as { id: string; journalIds: string[] }[]
        ).find(
          (r) =>
            Array.isArray(r.journalIds) &&
            r.journalIds.includes(credit.journalId),
        );
        if (source && credit.liabilityAmount === undefined) {
          credit.liabilityAmount = credit.refundAmount || 0;
          credit.returnId = source.id;
          delete credit.refundAmount;
        }
      }
    value.operationsRevision = 2;
  }
  return value as unknown as BusinessState;
}
