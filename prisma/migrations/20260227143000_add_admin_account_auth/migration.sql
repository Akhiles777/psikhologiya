CREATE TABLE "admin_accounts" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_password_reset_codes" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_password_reset_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_accounts_login_key" ON "admin_accounts"("login");

CREATE UNIQUE INDEX "admin_accounts_email_key" ON "admin_accounts"("email");

CREATE INDEX "admin_password_reset_codes_adminId_expiresAt_idx" ON "admin_password_reset_codes"("adminId", "expiresAt");

CREATE INDEX "admin_password_reset_codes_usedAt_idx" ON "admin_password_reset_codes"("usedAt");

ALTER TABLE "admin_password_reset_codes" ADD CONSTRAINT "admin_password_reset_codes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
