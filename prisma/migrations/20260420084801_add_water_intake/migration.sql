-- CreateTable
CREATE TABLE "water_intake" (
    "intake_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "glasses" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER NOT NULL DEFAULT 8,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "water_intake_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "water_intake_user_id_date_idx" ON "water_intake"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "water_intake_user_id_date_key" ON "water_intake"("user_id", "date");
