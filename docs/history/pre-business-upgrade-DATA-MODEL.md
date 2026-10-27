# Data model and fixtures

Borrower schema includes stable ID, business name, city, sector, age, revenue, expenses, debt, requested loan, term, opening cash, receivable delay, counterparty share, revenue shock, inflation and revenue history. Numeric bounds reject impossible negative inputs and out-of-range periods; expenses can exceed revenue because stress is legitimate. Loan periods range 1–360 months. No personally identifying data is necessary.

Fixtures: Anjali Foods (Pune, Food Processing, 5 years, revenue ₹12L, expenses ₹9L, debt ₹1.2L, requested ₹15L); Ramesh Auto Components (Coimbatore, Manufacturing, 8 years, ₹22L/₹17L/₹2.5L/₹25L); Farida Textiles (Surat, Textiles, 3 years, ₹8L/₹6.7L/₹.7L/₹10L).

Each fixture uses 36-month term, opening cash at 60% of revenue, delay 15 days, concentration 35%, no shock, 5% inflation. Twelve synthetic history values use `revenue × (1 + sin(iπ/6) × .12 + (i−11) × .005)` for i=0…11.

Each graph has central borrower, three buyers, three suppliers. IDs: borrower ID, borrower-n0…n5; transactions borrower-tx0…tx5; invoice borrower-inv0…inv5. Buyer flows sum to revenue; supplier flows sum to expenses. Shares are concentration, (1−concentration)/2, (1−concentration)/2. Each record has 95% settlement by default. Supplier flows act as synthetic payable context, not dated invoice schedules. Attack records add explicit loop/duplicate IDs or alter settlement ratios.

Run snapshots contain inputs, source toggles, scenario name, formula version, deterministic ID, wall-clock timestamp, factors, graph, alerts, forecast, daily ledger, recommendations, classification and audit stage descriptions. Alerts reference transaction IDs; each transaction references an invoice identifier. Audit timestamps share snapshot time; they are not external event attestations.

Available sources: bank, invoices, AA, ULI, network and history. All are simulated. Availability confidence must not be confused with independent verification. The notes dictionary is keyed by simulation ID with a separate status suffix.

Largest-counterparty share is constrained to ⅓–1 because the fixture has three buyers and three suppliers; this keeps the stated largest share consistent with generated flows.
