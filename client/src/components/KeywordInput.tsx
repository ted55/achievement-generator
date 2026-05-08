import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface KeywordInputProps {
  requiredKws: string[];
  optionalKws: string[];
  onRequiredKwsChange: (kws: string[]) => void;
  onOptionalKwsChange: (kws: string[]) => void;
}

export default function KeywordInput({
  requiredKws,
  optionalKws,
  onRequiredKwsChange,
  onOptionalKwsChange,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const totalKeywords = requiredKws.length + optionalKws.length;
  const isMaxed = totalKeywords >= 10;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const trimmed = inputValue.trim().replace(/,+$/, "");
    if (!trimmed || isMaxed) return;

    if (requiredKws.length < 5) {
      onRequiredKwsChange([...requiredKws, trimmed]);
    } else if (optionalKws.length < 5) {
      onOptionalKwsChange([...optionalKws, trimmed]);
    }

    setInputValue("");
  };

  const removeKeyword = (index: number, isRequired: boolean) => {
    if (isRequired) {
      onRequiredKwsChange(requiredKws.filter((_, i) => i !== index));
    } else {
      onOptionalKwsChange(optionalKws.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        キーワードタグ（最大10個）
      </label>

      {/* Display keywords */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {requiredKws.map((kw, idx) => (
          <Badge
            key={`req-${idx}`}
            className="bg-red-100 text-red-800 flex items-center gap-1 px-2 py-1"
          >
            {kw}
            <button
              onClick={() => removeKeyword(idx, true)}
              className="ml-1 hover:opacity-70"
              aria-label="削除"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}

        {optionalKws.map((kw, idx) => (
          <Badge
            key={`opt-${idx}`}
            className="bg-blue-100 text-blue-800 flex items-center gap-1 px-2 py-1"
          >
            {kw}
            <button
              onClick={() => removeKeyword(idx, false)}
              className="ml-1 hover:opacity-70"
              aria-label="削除"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}

        {isMaxed && (
          <Badge className="bg-gray-200 text-gray-700 px-2 py-1">
            上限10個
          </Badge>
        )}
      </div>

      {/* Input field */}
      {!isMaxed && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="キーワードを入力 (Enter or カンマで確定)"
            className="flex-1"
            disabled={isMaxed}
          />
          <button
            onClick={addKeyword}
            disabled={!inputValue.trim() || isMaxed}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        1〜5個目が必須KW（赤）、6〜10個目が補助KW（青）として扱われます
      </p>
    </div>
  );
}
