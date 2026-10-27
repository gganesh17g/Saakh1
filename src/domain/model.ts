import { z } from "zod";
export const sectors = [
  "Agriculture",
  "Food Processing",
  "Textiles",
  "Manufacturing",
  "Retail",
  "Services",
] as const;
export const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  city: z.string().min(2),
  sector: z.enum(sectors),
  age: z.number().min(0).max(100),
  revenue: z.number().min(1).max(1e10),
  expenses: z.number().min(0).max(1e10),
  debt: z.number().min(0).max(1e10),
  loan: z.number().min(0).max(1e10),
  term: z.number().int().min(1).max(360),
  cash: z.number().finite().min(0),
  delay: z.number().min(0).max(180),
  concentration: z
    .number()
    .min(1 / 3)
    .max(1),
  shock: z.number().min(-0.9).max(1),
  inflation: z.number().min(0).max(0.5),
  history: z.array(z.number().positive()).min(0),
});
export type Borrower = z.infer<typeof schema>;
export type Sources = {
  bank: boolean;
  invoices: boolean;
  aa: boolean;
  uli: boolean;
  network: boolean;
  history: boolean;
};
export type Node = {
  id: string;
  name: string;
  kind: "borrower" | "buyer" | "supplier";
};
export type Edge = {
  id: string;
  from: string;
  to: string;
  amount: number;
  invoice: string;
  paid: number;
};
export type Graph = { nodes: Node[]; edges: Edge[] };
export type Alert = {
  id: string;
  rule: string;
  detail: string;
  evidence: string[];
};
export type Factor = {
  name: string;
  value: number;
  weight: number;
  formula: string;
  available: boolean;
  inputs: string;
};
export type Run = {
  scenario: string;
  id: string;
  version: string;
  timestamp: string;
  borrower: Borrower;
  sources: Sources;
  score: number | null;
  confidence: number;
  factors: Factor[];
  graph: Graph;
  alerts: Alert[];
  forecast: {
    month: string;
    revenue: number;
    expenses: number;
    cash: number;
    low: number;
    high: number;
  }[];
  days: {
    day: number;
    opening: number;
    receipts: number;
    payments: number;
    closing: number;
  }[];
  classification: string;
  recommendations: {
    title: string;
    trigger: string;
    action: string;
    limitation: string;
  }[];
  audit: string[];
};
export const defaultSources: Sources = {
  bank: true,
  invoices: true,
  aa: false,
  uli: false,
  network: true,
  history: true,
};
export const disclaimer =
  "Saakh is a prototype simulation for demonstration and educational purposes. Scores, forecasts, alerts, recommendations, and financial-impact estimates use synthetic data and illustrative assumptions. They are not credit ratings, lending offers, fraud determinations, or financial advice.";
