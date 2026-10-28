export type Salary = {
  effective: string;
  basic: number;
  hra: number;
  allowance: number;
  incentive: number;
  performance?: number;
  bonus: number;
  arrears: number;
  reimbursement: number;
  overtimeRate: number;
  withholding: number;
  professionalTax: number;
  miscellaneous: number;
};
export type Employee = {
  id: string;
  businessId: string;
  name: string;
  department: string;
  title: string;
  employment: string;
  joined: string;
  archived: boolean;
  location: string;
  method: string;
  reference: string;
  leaveEntitlement: number;
  notes: string;
  pf: boolean;
  esi: boolean;
  salaries: Salary[];
};
export type PayrollRule = {
  id: string;
  businessId: string;
  effective: string;
  label: string;
  source: string;
  pfEmployeeBps: number;
  pfEmployerBps: number;
  pfCap: number;
  esiEmployeeBps: number;
  esiEmployerBps: number;
  esiCeiling: number;
};
export type Attendance = {
  id: string;
  businessId: string;
  employeeId: string;
  period: string;
  working: number;
  present: number;
  paidLeave: number;
  unpaid: number;
  overtime: number;
  bonus: number;
  advance: number;
  reviewed: boolean;
  notes: string;
};
export type PayrollLine = {
  employeeId: string;
  name: string;
  department: string;
  title: string;
  salary: Salary;
  attendance: Attendance;
  rule: PayrollRule;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
  gross: number;
  reimbursement: number;
  deduction: number;
  net: number;
  employer: number;
  cost: number;
};
export type PayrollRun = {
  id: string;
  businessId: string;
  period: string;
  paymentDate: string;
  status:
    | "Draft"
    | "Calculated"
    | "Needs Review"
    | "Approved"
    | "Finalized"
    | "Partially Paid"
    | "Paid"
    | "Reversed";
  lines: PayrollLine[];
  journalId?: string;
  createdAt: string;
  formula: "payroll-paise-1";
};
export type SalaryPayment = {
  id: string;
  businessId: string;
  runId: string;
  employeeId: string;
  amount: number;
  date: string;
  reference: string;
  method: "bank" | "cash";
  journalId: string;
  reversed: boolean;
  kind: "salary" | "advance" | "remittance";
};
export type ReturnLine = {
  index: number;
  quantity: number;
  stockCost?: number;
  disposition: "Restock" | "Quarantine" | "Write off";
};
export type TradeReturn = {
  id: string;
  businessId: string;
  documentId: string;
  kind: "sale" | "purchase";
  date: string;
  reason: string;
  condition: string;
  preference: "Credit" | "Refund";
  notes: string;
  evidence: string;
  supplierReference: string;
  communication: string;
  disputed?: boolean;
  status:
    | "Draft"
    | "Submitted"
    | "Needs Review"
    | "Approved"
    | "Rejected"
    | "Credit Issued"
    | "Closed"
    | "Reversed"
    | "Goods Dispatched"
    | "Awaiting Supplier Credit"
    | "Supplier Credit Received"
    | "Settled";
  lines: ReturnLine[];
  net: number;
  tax: number;
  amount: number;
  stockCost: number;
  creditReceived: number;
  creditReceipts: {
    reference: string;
    amount: number;
    journalId: string;
    date: string;
  }[];
  creditBalance: number;
  applied: number;
  refunded: number;
  journalIds: string[];
  settlementIds: string[];
  expectedDate?: string;
};
export type ReturnSettlement = {
  id: string;
  businessId: string;
  returnId: string;
  amount: number;
  date: string;
  kind: "Refund" | "Allocation";
  documentId?: string;
  reference: string;
  journalId: string;
  reversed: boolean;
};
export type OperationsData = {
  employees: Employee[];
  payrollRules: PayrollRule[];
  attendance: Attendance[];
  payrollRuns: PayrollRun[];
  salaryPayments: SalaryPayment[];
  returns: TradeReturn[];
  returnSettlements: ReturnSettlement[];
  invoiceSequences: {
    businessId: string;
    year: string;
    prefix: string;
    next: number;
  }[];
  saleRequests: { businessId: string; token: string; documentId: string }[];
};
export const emptyOperations = (): OperationsData => ({
  employees: [],
  payrollRules: [],
  attendance: [],
  payrollRuns: [],
  salaryPayments: [],
  returns: [],
  returnSettlements: [],
  invoiceSequences: [],
  saleRequests: [],
});
