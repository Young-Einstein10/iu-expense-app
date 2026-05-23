"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FC,
  type ChangeEvent,
} from "react";
import { ChevronLeft } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Category } from "../types";

interface CategoryInputProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onAddCategory: (category: {
    name: string;
    icon: string;
  }) => Promise<Category>;
  inputClassName: string;
}

interface EmojiData {
  native: string;
  id: string;
  name: string;
}

const CategoryInput: FC<CategoryInputProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onAddCategory,
  inputClassName,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📁");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiSelect = useCallback((emoji: EmojiData) => {
    setSelectedEmoji(emoji.native);
    setShowEmojiPicker(false);
  }, []);

  const resetNewCategoryForm = useCallback(() => {
    setNewCategoryName("");
    setSelectedEmoji("📁");
    setAddError(null);
  }, []);

  const handleBackToSelect = useCallback(() => {
    setIsAddingNew(false);
    resetNewCategoryForm();
  }, [resetNewCategoryForm]);

  const handleAddNewCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      setAddError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setAddError(null);

    try {
      const newCategory = await onAddCategory({
        name: newCategoryName.trim(),
        icon: selectedEmoji,
      });

      onCategoryChange(newCategory.id);
      setIsAddingNew(false);
      resetNewCategoryForm();
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Failed to create category",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    newCategoryName,
    selectedEmoji,
    onAddCategory,
    onCategoryChange,
    resetNewCategoryForm,
  ]);

  if (isAddingNew) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackToSelect}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Back to category selection"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Category
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-12 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xl"
              aria-label="Select emoji icon"
            >
              {selectedEmoji}
            </button>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="fixed sm:absolute z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-12 sm:left-0 sm:right-auto"
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="auto"
                  previewPosition="none"
                  skinTonePosition="none"
                  maxFrequentRows={2}
                />
              </div>
            )}
          </div>

          <input
            type="text"
            value={newCategoryName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewCategoryName(e.target.value);
              if (addError) setAddError(null);
            }}
            placeholder="Category name"
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              addError ? "border-red-500" : "border-gray-300"
            }`}
            autoFocus
          />
        </div>

        {/* <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`w-6 h-6 rounded-full ${color.value} ${
                selectedColor === color.value
                  ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800"
                  : ""
              }`}
              aria-label={`Select ${color.label} color`}
              title={color.label}
            />
          ))}
        </div> */}

        {addError && (
          <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBackToSelect}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddNewCategory}
            disabled={isSubmitting || !newCategoryName.trim()}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedCategoryId}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          if (e.target.value === "__add_new__") {
            setIsAddingNew(true);
          } else {
            onCategoryChange(e.target.value);
          }
        }}
        className={`${inputClassName} appearance-none`}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.icon} {category.name}
          </option>
        ))}
        <option value="__add_new__">➕ Add New Category...</option>
      </select>
    </div>
  );
};

export default CategoryInput;
