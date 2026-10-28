import { roles, type Role } from "./model";
import { canPage } from "./workspace4";
/** UI destinations only. Existing canPage remains the authority. */
const preferred: Record<Role, string> = {
  owner: "",
  staff: "sales",
  accountant: "passbook",
  admin: "settings",
  payroll: "payroll",
  manager: "payroll",
  auditor: "reports",
};
export function roleDestination42(value: string): string | null {
  if (!roles.includes(value as Role)) return null;
  const role = value as Role;
  const page = preferred[role];
  return "/business" + (page && canPage(role, page) ? "/" + page : "");
}
