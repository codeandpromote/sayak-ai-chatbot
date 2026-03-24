-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "KnowledgeSourceType" AS ENUM ('URL', 'PDF', 'DOCX', 'TEXT');
CREATE TYPE "IngestionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'HANDED_OFF', 'RESOLVED', 'EXPIRED');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "LLMProvider" AS ENUM ('GEMINI', 'GROQ');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateTable: Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "customDomain" TEXT,
    "logoUrl" TEXT,
    "brandColor" TEXT DEFAULT '#6366f1',
    "monthlyMessageQuota" INTEGER NOT NULL DEFAULT 1000,
    "messagesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateTable: ApiKey
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable: TenantUser
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TenantUser_userId_tenantId_key" ON "TenantUser"("userId", "tenantId");
CREATE INDEX "TenantUser_tenantId_idx" ON "TenantUser"("tenantId");

-- CreateTable: Invitation
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
CREATE UNIQUE INDEX "Invitation_email_tenantId_key" ON "Invitation"("email", "tenantId");
CREATE INDEX "Invitation_tenantId_idx" ON "Invitation"("tenantId");
CREATE INDEX "Invitation_token_idx" ON "Invitation"("token");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateTable: Chatbot
CREATE TABLE "Chatbot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "llmProvider" "LLMProvider" NOT NULL DEFAULT 'GEMINI',
    "llmModel" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "widgetPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "primaryColor" TEXT NOT NULL DEFAULT '#6366f1',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hello! How can I help you?',
    "placeholderText" TEXT NOT NULL DEFAULT 'Type a message...',
    "avatarUrl" TEXT,
    "leadCaptureEnabled" BOOLEAN NOT NULL DEFAULT false,
    "appointmentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "handoffEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Chatbot_tenantId_idx" ON "Chatbot"("tenantId");

-- CreateTable: AIMask
CREATE TABLE "AIMask" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "personaName" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "responseStyle" TEXT,
    "restrictions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AIMask_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AIMask_chatbotId_key" ON "AIMask"("chatbotId");

-- CreateTable: KnowledgeSource
CREATE TABLE "KnowledgeSource" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "status" "IngestionStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "KnowledgeSource_chatbotId_idx" ON "KnowledgeSource"("chatbotId");
CREATE INDEX "KnowledgeSource_chatbotId_status_idx" ON "KnowledgeSource"("chatbotId", "status");

-- CreateTable: DocumentChunk
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "knowledgeSourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DocumentChunk_knowledgeSourceId_idx" ON "DocumentChunk"("knowledgeSourceId");

-- Vector embedding column (pgvector)
ALTER TABLE "DocumentChunk" ADD COLUMN "embedding" vector(768);

-- CreateTable: Conversation
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitorName" TEXT,
    "visitorEmail" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Conversation_chatbotId_idx" ON "Conversation"("chatbotId");
CREATE INDEX "Conversation_chatbotId_status_idx" ON "Conversation"("chatbotId", "status");
CREATE INDEX "Conversation_visitorId_idx" ON "Conversation"("visitorId");

-- CreateTable: Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateTable: HandoffSession
CREATE TABLE "HandoffSession" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT,
    "reason" TEXT,
    "claimedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HandoffSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HandoffSession_conversationId_key" ON "HandoffSession"("conversationId");
CREATE INDEX "HandoffSession_agentId_idx" ON "HandoffSession"("agentId");

-- CreateTable: LeadFormConfig
CREATE TABLE "LeadFormConfig" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "triggerAfterMessages" INTEGER NOT NULL DEFAULT 3,
    "triggerOnKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadFormConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LeadFormConfig_chatbotId_key" ON "LeadFormConfig"("chatbotId");

-- CreateTable: Lead
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "customFields" JSONB,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lead_conversationId_key" ON "Lead"("conversationId");
CREATE INDEX "Lead_tenantId_idx" ON "Lead"("tenantId");
CREATE INDEX "Lead_tenantId_capturedAt_idx" ON "Lead"("tenantId", "capturedAt");

-- CreateTable: BookingConfig
CREATE TABLE "BookingConfig" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "slotDurationMin" INTEGER NOT NULL DEFAULT 30,
    "bufferMin" INTEGER NOT NULL DEFAULT 0,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30,
    "weeklySchedule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BookingConfig_chatbotId_key" ON "BookingConfig"("chatbotId");

-- CreateTable: Appointment
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorEmail" TEXT NOT NULL,
    "visitorPhone" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Appointment_tenantId_idx" ON "Appointment"("tenantId");
CREATE INDEX "Appointment_chatbotId_startTime_idx" ON "Appointment"("chatbotId", "startTime");
CREATE INDEX "Appointment_tenantId_status_idx" ON "Appointment"("tenantId", "status");

-- CreateTable: WhitelabelConfig
CREATE TABLE "WhitelabelConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customDomain" TEXT,
    "removeBranding" BOOLEAN NOT NULL DEFAULT false,
    "customCss" TEXT,
    "faviconUrl" TEXT,
    "emailFromName" TEXT,
    "emailFromDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WhitelabelConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WhitelabelConfig_tenantId_key" ON "WhitelabelConfig"("tenantId");
CREATE UNIQUE INDEX "WhitelabelConfig_customDomain_key" ON "WhitelabelConfig"("customDomain");

-- CreateTable: AnalyticsEvent
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "visitorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AnalyticsEvent_chatbotId_eventType_idx" ON "AnalyticsEvent"("chatbotId", "eventType");
CREATE INDEX "AnalyticsEvent_chatbotId_createdAt_idx" ON "AnalyticsEvent"("chatbotId", "createdAt");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIMask" ADD CONSTRAINT "AIMask_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_knowledgeSourceId_fkey" FOREIGN KEY ("knowledgeSourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HandoffSession" ADD CONSTRAINT "HandoffSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HandoffSession" ADD CONSTRAINT "HandoffSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "LeadFormConfig" ADD CONSTRAINT "LeadFormConfig_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON UPDATE CASCADE;
ALTER TABLE "BookingConfig" ADD CONSTRAINT "BookingConfig_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WhitelabelConfig" ADD CONSTRAINT "WhitelabelConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
