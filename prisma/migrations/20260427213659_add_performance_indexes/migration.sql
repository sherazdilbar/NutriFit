-- CreateIndex
CREATE INDEX "diet_plans_user_id_idx" ON "diet_plans"("user_id");

-- CreateIndex
CREATE INDEX "diet_plans_created_at_idx" ON "diet_plans"("created_at");

-- CreateIndex
CREATE INDEX "exercise_items_name_idx" ON "exercise_items"("name");

-- CreateIndex
CREATE INDEX "exercise_items_impact_level_idx" ON "exercise_items"("impact_level");

-- CreateIndex
CREATE INDEX "food_items_name_idx" ON "food_items"("name");

-- CreateIndex
CREATE INDEX "food_items_calories_idx" ON "food_items"("calories");

-- CreateIndex
CREATE INDEX "health_profiles_user_id_idx" ON "health_profiles"("user_id");

-- CreateIndex
CREATE INDEX "health_profiles_updated_at_idx" ON "health_profiles"("updated_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "workout_plans_user_id_idx" ON "workout_plans"("user_id");

-- CreateIndex
CREATE INDEX "workout_plans_created_at_idx" ON "workout_plans"("created_at");
