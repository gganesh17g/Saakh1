import type { Borrower } from "../domain/model";
export const profiles: Borrower[] = [
  [
    "anjali",
    "Anjali Foods",
    "Pune",
    "Food Processing",
    5,
    1200000,
    900000,
    120000,
    1500000,
  ],
  [
    "ramesh",
    "Ramesh Auto Components",
    "Coimbatore",
    "Manufacturing",
    8,
    2200000,
    1700000,
    250000,
    2500000,
  ],
  [
    "farida",
    "Farida Textiles",
    "Surat",
    "Textiles",
    3,
    800000,
    670000,
    70000,
    1000000,
  ],
].map(
  ([id, name, city, sector, age, revenue, expenses, debt, loan]) =>
    ({
      id,
      name,
      city,
      sector,
      age,
      revenue,
      expenses,
      debt,
      loan,
      term: 36,
      cash: Number(revenue) * 0.6,
      delay: 15,
      concentration: 0.35,
      shock: 0,
      inflation: 0.05,
      history: Array.from(
        { length: 12 },
        (_, i) =>
          Number(revenue) *
          (1 + Math.sin((i * Math.PI) / 6) * 0.12 + (i - 11) * 0.005),
      ),
    }) as Borrower,
);
