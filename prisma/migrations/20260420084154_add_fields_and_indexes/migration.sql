-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_health_profiles" (
    "profile_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "age" INTEGER,
    "weight" REAL,
    "height" REAL,
    "gender" TEXT DEFAULT 'male',
    "activity_level" TEXT DEFAULT 'moderate',
    "health_goals" TEXT DEFAULT 'maintain',
    "permissions" TEXT,
    "diseases" TEXT,
    "allergens" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "health_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_health_profiles" ("age", "allergens", "created_at", "diseases", "height", "permissions", "profile_id", "user_id", "weight") SELECT "age", "allergens", "created_at", "diseases", "height", "permissions", "profile_id", "user_id", "weight" FROM "health_profiles";
DROP TABLE "health_profiles";
ALTER TABLE "new_health_profiles" RENAME TO "health_profiles";
CREATE UNIQUE INDEX "health_profiles_user_id_key" ON "health_profiles"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "exercise_logs_user_id_date_idx" ON "exercise_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "goals_user_id_status_idx" ON "goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "meal_logs_user_id_date_idx" ON "meal_logs"("user_id", "date");
