-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'OWNER');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('TRIAL', 'BASIC', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DesignStyle" AS ENUM ('EDITORIAL', 'BREAKING_NEWS', 'MINIMAL', 'MODERN', 'BOLD', 'CORPORATE', 'TECH', 'FINANCE', 'LIFESTYLE', 'CUSTOM_BRAND');

-- CreateEnum
CREATE TYPE "OutputFormat" AS ENUM ('FEED_SQUARE', 'FEED_PORTRAIT', 'STORY');

-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('COVER', 'POINT', 'OUTRO');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'RENDERING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageSource" AS ENUM ('ARTICLE', 'AI_GENERATED', 'SOLID_FALLBACK');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SCRAPE', 'ANALYZE', 'GENERATE_CONTENT', 'GENERATE_IMAGE', 'RENDER_DESIGN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'PROCESSING', 'PARTIAL', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "plan" "Plan" NOT NULL DEFAULT 'TRIAL',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "trialEndsAt" TIMESTAMP(3),
    "generateCount" INTEGER NOT NULL DEFAULT 0,
    "quotaResetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "source" TEXT,
    "imageUrl" TEXT,
    "lang" TEXT,
    "wordCount" INTEGER,
    "scrapedVia" TEXT,
    "rawHtml" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "feedCopy" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "cta" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "analysis" JSONB,
    "imageSource" "ImageSource",
    "visualUrl" TEXT,
    "visualPrompt" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "slides" JSONB,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVisual" (
    "id" TEXT NOT NULL,
    "generatedContentId" TEXT NOT NULL,
    "slideIndex" INTEGER NOT NULL,
    "source" "ImageSource" NOT NULL,
    "imageUrl" TEXT,
    "prompt" TEXT,
    "provider" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentVisual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignAsset" (
    "id" TEXT NOT NULL,
    "generatedContentId" TEXT NOT NULL,
    "style" "DesignStyle" NOT NULL,
    "format" "OutputFormat" NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "slideIndex" INTEGER NOT NULL DEFAULT 0,
    "slideType" "SlideType" NOT NULL DEFAULT 'COVER',
    "imageUrl" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "requestedStyles" "DesignStyle"[],
    "requestedFormats" "OutputFormat"[],
    "requestedSlides" INTEGER NOT NULL DEFAULT 1,
    "stepsTotal" INTEGER NOT NULL DEFAULT 0,
    "stepsDone" INTEGER NOT NULL DEFAULT 0,
    "articleId" TEXT,
    "generatedContentId" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "runId" TEXT,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "bullJobId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandKit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primary" TEXT NOT NULL DEFAULT '#4F46E5',
    "secondary" TEXT NOT NULL DEFAULT '#0F172A',
    "fontHead" TEXT,
    "fontBody" TEXT,
    "handle" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandKit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isGuest_createdAt_idx" ON "User"("isGuest", "createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Article_userId_createdAt_idx" ON "Article"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Article_userId_url_key" ON "Article"("userId", "url");

-- CreateIndex
CREATE INDEX "GeneratedContent_articleId_idx" ON "GeneratedContent"("articleId");

-- CreateIndex
CREATE INDEX "ContentVisual_generatedContentId_idx" ON "ContentVisual"("generatedContentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVisual_generatedContentId_slideIndex_key" ON "ContentVisual"("generatedContentId", "slideIndex");

-- CreateIndex
CREATE INDEX "DesignAsset_generatedContentId_status_idx" ON "DesignAsset"("generatedContentId", "status");

-- CreateIndex
CREATE INDEX "DesignAsset_generatedContentId_style_format_slideIndex_idx" ON "DesignAsset"("generatedContentId", "style", "format", "slideIndex");

-- CreateIndex
CREATE UNIQUE INDEX "DesignAsset_generatedContentId_style_format_slideIndex_key" ON "DesignAsset"("generatedContentId", "style", "format", "slideIndex");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationRun_generatedContentId_key" ON "GenerationRun"("generatedContentId");

-- CreateIndex
CREATE INDEX "GenerationRun_userId_createdAt_idx" ON "GenerationRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationRun_status_idx" ON "GenerationRun"("status");

-- CreateIndex
CREATE INDEX "Job_runId_type_idx" ON "Job"("runId", "type");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BrandKit_userId_key" ON "BrandKit"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVisual" ADD CONSTRAINT "ContentVisual_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignAsset" ADD CONSTRAINT "DesignAsset_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRun" ADD CONSTRAINT "GenerationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRun" ADD CONSTRAINT "GenerationRun_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRun" ADD CONSTRAINT "GenerationRun_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_runId_fkey" FOREIGN KEY ("runId") REFERENCES "GenerationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandKit" ADD CONSTRAINT "BrandKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
