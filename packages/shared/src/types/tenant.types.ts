export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  customDomain?: string;
  logoUrl?: string;
  brandColor: string;
  monthlyMessageQuota: number;
  messagesUsed: number;
}

export interface TenantUser {
  userId: string;
  tenantId: string;
  role: UserRole;
}
