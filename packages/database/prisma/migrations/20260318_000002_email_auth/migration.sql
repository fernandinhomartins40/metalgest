-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_emails" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'ultrazend',
    "purpose" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "providerMessageId" TEXT,
    "providerEmailId" TEXT,
    "trackingId" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbound_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_webhook_events" (
    "id" TEXT NOT NULL,
    "outboundEmailId" TEXT,
    "providerEventKey" TEXT NOT NULL,
    "webhookId" TEXT,
    "event" TEXT NOT NULL,
    "signature" TEXT,
    "providerMessageId" TEXT,
    "providerEmailId" TEXT,
    "trackingId" TEXT,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "email_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_tokenHash_key" ON "auth_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_tokens_userId_type_idx" ON "auth_tokens"("userId", "type");

-- CreateIndex
CREATE INDEX "auth_tokens_expiresAt_idx" ON "auth_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "outbound_emails_userId_idx" ON "outbound_emails"("userId");

-- CreateIndex
CREATE INDEX "outbound_emails_purpose_idx" ON "outbound_emails"("purpose");

-- CreateIndex
CREATE INDEX "outbound_emails_providerMessageId_idx" ON "outbound_emails"("providerMessageId");

-- CreateIndex
CREATE INDEX "outbound_emails_providerEmailId_idx" ON "outbound_emails"("providerEmailId");

-- CreateIndex
CREATE INDEX "outbound_emails_trackingId_idx" ON "outbound_emails"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "email_webhook_events_providerEventKey_key" ON "email_webhook_events"("providerEventKey");

-- CreateIndex
CREATE INDEX "email_webhook_events_outboundEmailId_idx" ON "email_webhook_events"("outboundEmailId");

-- CreateIndex
CREATE INDEX "email_webhook_events_event_idx" ON "email_webhook_events"("event");

-- CreateIndex
CREATE INDEX "email_webhook_events_providerMessageId_idx" ON "email_webhook_events"("providerMessageId");

-- CreateIndex
CREATE INDEX "email_webhook_events_providerEmailId_idx" ON "email_webhook_events"("providerEmailId");

-- CreateIndex
CREATE INDEX "email_webhook_events_trackingId_idx" ON "email_webhook_events"("trackingId");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_emails" ADD CONSTRAINT "outbound_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_webhook_events" ADD CONSTRAINT "email_webhook_events_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "outbound_emails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
