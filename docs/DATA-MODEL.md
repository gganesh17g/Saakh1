# Data model — local business ledger v1

The existing credit entities and keys remain intact; their previous documentation is archived under history/pre-business-upgrade-DATA-MODEL.md. No real financial or personal data is seeded.

`src/business/model.ts` defines the shared records. Every operational record has businessId. Numeric financial fields are paise; dates are ISO in storage. The interface currently displays many ISO dates; full Indian display-date localization remains partial.

| Record | Contents / relationships |
|---|---|
| Business | Name, retail/wholesale/distributor/services type, industry/location, April FY, language preference, INR, opening amount/source/date, buffer, starting workflow |
| Party | Customer/supplier/both, terms, location, notes, Self-reported verification, block state |
| Item / Movement | SKU, unit, standard cost, price, reorder threshold; signed quantities tied to source and version |
| BusinessDocument | Sale/purchase/expense/equipment, party, number, dates, line items, attachmentId, cashSale, Draft/Posted/Cancelled, version, source, entered/reviewed actors and timestamps |
| Journal | Balanced debit/credit lines, date, memo, kind, sourceId, reversalOf, actor/time |
| Payment / Credit | Document amount/date and journal link; credits may have a confirmed bank refundAmount |
| StatementRow | Signed paise, date/narration, source, account, Unmatched/Matched/Rejected/Needs review, journalIds for exact split match |
| Attachment | Original PDF/PNG/JPEG as a bounded data URL, name/MIME/size and SHA-256 digest; no OCR or malware scanning |
| Followup | Invoice, promise date, dispute, draft text, local reminder marker, outcome; no delivery |
| ForecastRun | As-of, generation time, horizon, method, scenario, assumptions, daily flows, warnings, MAE/WAPE, input journal IDs |
| RFQ / Quote | Product/quantity/specification/delivery/budget/terms and supplier unit price/freight/tax/lead/validity, shortlist and local outcome |
| Consent | Purpose/scope/recipient, creation, expiry and revocation; not an AA artefact |
| Membership | Local invitation name/role/scopes/expiry/revocation; not an authenticated identity or enforced invite session |
| TaxTask | Manually sourced internal review date, last-reviewed, readiness status; never Filed |
| Complaint | Party/reason and Needs review/Reviewed/Escalated moderation state |
| Audit | Business/actor/action/time/source and before/after snapshots; locally editable, not tamper-proof |

Zustand `useBusiness` holds one versioned BusinessState, persisted through idb-keyval as `saakh-business-v1`. It includes sequence IDs and active business/demo role. Store commits clone, validate, save then publish; restore errors do not silently overwrite saved data. No server database, schema migration service, object store, authenticated session or cross-tab lock exists. Future schema changes require explicit migration rather than treating arbitrary persisted JSON as trusted.

Original credit keys: `runs`, `borrowers`, `notes`. They are intentionally independent and contain synthetic credit scenarios. Business export scopes operational arrays to the selected business. Explicit deletion clears the business snapshot and those three owned keys; it does not call indexedDB.deleteDatabase or clear all origin storage. Fixed source fixtures and theme preferences remain.

The synthetic seed is reproducible as of 2026-10-27, with confirmed opening bank/stock, 60 days of packing-service cash sales/expenses, two grain credit invoices, one partial collection, a stock bill, posted packaging expense and draft bill. One known collection and one unidentified deposit require reconciliation. Synthetic history is not a live clock-fed financial integration.
