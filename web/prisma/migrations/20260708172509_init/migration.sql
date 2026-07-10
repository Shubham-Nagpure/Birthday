-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "plan" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'romantic',
    "pages" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Site_razorpayOrderId_key" ON "Site"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Site_razorpayOrderId_idx" ON "Site"("razorpayOrderId");
