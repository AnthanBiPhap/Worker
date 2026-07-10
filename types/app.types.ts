import type { LeadStatus, LeadSource, UserRole } from "@/lib/constants/enums";

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}
