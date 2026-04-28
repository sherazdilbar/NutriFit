-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_food_items" (
    "food_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "allergens" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_food_items" ("allergens", "calories", "created_at", "food_id", "name") SELECT "allergens", "calories", "created_at", "food_id", "name" FROM "food_items";
DROP TABLE "food_items";
ALTER TABLE "new_food_items" RENAME TO "food_items";
CREATE INDEX "food_items_name_idx" ON "food_items"("name");
CREATE INDEX "food_items_calories_idx" ON "food_items"("calories");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
