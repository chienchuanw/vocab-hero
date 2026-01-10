-- CreateIndex
CREATE INDEX "study_sessions_user_id_idx" ON "study_sessions"("user_id");

-- CreateIndex
CREATE INDEX "study_sessions_started_at_idx" ON "study_sessions"("started_at");

-- CreateIndex
CREATE INDEX "study_sessions_completed_at_idx" ON "study_sessions"("completed_at");

-- CreateIndex
CREATE INDEX "vocabulary_groups_user_id_idx" ON "vocabulary_groups"("user_id");

-- CreateIndex
CREATE INDEX "vocabulary_groups_name_idx" ON "vocabulary_groups"("name");

-- CreateIndex
CREATE INDEX "vocabulary_groups_created_at_idx" ON "vocabulary_groups"("created_at");

-- CreateIndex
CREATE INDEX "vocabulary_items_created_at_idx" ON "vocabulary_items"("created_at");
