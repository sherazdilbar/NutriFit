-- CreateTable
CREATE TABLE "favorites" (
    "favorite_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_data" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "favorites_user_id_item_type_idx" ON "favorites"("user_id", "item_type");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_item_type_item_id_key" ON "favorites"("user_id", "item_type", "item_id");
