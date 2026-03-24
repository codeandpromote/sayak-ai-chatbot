import { PlanTier } from '../types/tenant.types';

export interface PlanLimits {
  maxChatbots: number;
  maxKnowledgeSources: number;
  maxStorageMB: number;
  monthlyMessageQuota: number;
  handoffEnabled: boolean;
  whitelabelEnabled: boolean;
  customDomainEnabled: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  [PlanTier.FREE]: {
    maxChatbots: 1,
    maxKnowledgeSources: 5,
    maxStorageMB: 10,
    monthlyMessageQuota: 1000,
    handoffEnabled: false,
    whitelabelEnabled: false,
    customDomainEnabled: false,
  },
  [PlanTier.PRO]: {
    maxChatbots: 5,
    maxKnowledgeSources: 50,
    maxStorageMB: 100,
    monthlyMessageQuota: 10000,
    handoffEnabled: true,
    whitelabelEnabled: false,
    customDomainEnabled: false,
  },
  [PlanTier.ENTERPRISE]: {
    maxChatbots: Infinity,
    maxKnowledgeSources: Infinity,
    maxStorageMB: 1000,
    monthlyMessageQuota: Infinity,
    handoffEnabled: true,
    whitelabelEnabled: true,
    customDomainEnabled: true,
  },
};
