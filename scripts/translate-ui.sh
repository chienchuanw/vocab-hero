#!/bin/bash

# Script to translate Chinese UI text to English in component files

# Define translation mappings
declare -A translations=(
  # Common UI elements
  ["單字"]="Word"
  ["讀音"]="Reading"
  ["意思"]="Meaning"
  ["筆記"]="Notes"
  ["群組"]="Group"
  ["新增"]="Add"
  ["編輯"]="Edit"
  ["刪除"]="Delete"
  ["取消"]="Cancel"
  ["確認"]="Confirm"
  ["儲存"]="Save"
  ["更新"]="Update"
  
  # Status and messages
  ["載入中"]="Loading"
  ["載入失敗"]="Failed to load"
  ["載入更多"]="Loading more"
  ["尚無單字資料"]="No vocabulary items yet"
  ["點擊「新增單字」開始建立你的單字庫"]="Click \"Add Word\" to start building your collection"
  
  # Form labels
  ["請輸入單字"]="Please enter word"
  ["請輸入讀音"]="Please enter reading"
  ["請輸入意思"]="Please enter meaning"
  ["補充說明或記憶技巧"]="Additional notes or memory tips"
  
  # Mastery levels
  ["精通"]="Mastered"
  ["熟悉"]="Familiar"
  ["學習中"]="Learning"
  ["初學"]="Beginner"
  ["未學習"]="Not Started"
  
  # Dialog titles
  ["新增單字"]="Add Word"
  ["編輯單字"]="Edit Word"
  ["刪除單字"]="Delete Word"
  ["確認刪除"]="Confirm Delete"
  
  # Descriptions
  ["填寫單字資訊，建立新的學習項目"]="Fill in word information to create a new learning item"
  ["修改單字資訊"]="Modify word information"
  ["確定要刪除單字"]="Are you sure you want to delete the word"
  ["此操作無法復原"]="This action cannot be undone"
  
  # Buttons
  ["新增中"]="Adding"
  ["更新中"]="Updating"
  ["刪除中"]="Deleting"
  
  # Success messages
  ["單字新增成功"]="Word added successfully"
  ["單字更新成功"]="Word updated successfully"
  ["單字已刪除"]="Word deleted"
  
  # Error messages
  ["新增失敗，請稍後再試"]="Failed to add, please try again later"
  ["更新失敗，請稍後再試"]="Failed to update, please try again later"
  ["刪除失敗，請稍後再試"]="Failed to delete, please try again later"
)

# Files to process
files=(
  "components/features/vocabulary/VocabularyCard.tsx"
  "components/features/vocabulary/AddVocabularyForm.tsx"
  "components/features/vocabulary/AddVocabularyDialog.tsx"
  "components/features/vocabulary/EditVocabularyDialog.tsx"
  "components/features/vocabulary/DeleteConfirmationDialog.tsx"
  "components/features/groups/GroupCard.tsx"
  "components/features/groups/GroupList.tsx"
  "components/features/groups/AddGroupDialog.tsx"
  "components/features/groups/EditGroupDialog.tsx"
)

echo "Starting UI translation..."

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    for chinese in "${!translations[@]}"; do
      english="${translations[$chinese]}"
      # Use sed to replace Chinese with English
      sed -i '' "s/$chinese/$english/g" "$file"
    done
  else
    echo "File not found: $file"
  fi
done

echo "Translation complete!"

