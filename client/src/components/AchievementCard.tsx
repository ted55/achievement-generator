import { Copy, Calendar, Pencil, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateGoogleCalendarUrl } from "@/lib/gcal";
import { useState } from "react";

interface AchievementCardProps {
  title: string;
  text: string;
  date: string;
  isSelected: boolean;
  isAdjusted: boolean;
  onSelect: () => void;
}

export default function AchievementCard({
  title,
  text,
  date,
  isSelected,
  isAdjusted,
  onSelect,
}: AchievementCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [savedText, setSavedText] = useState(text);

  const displayText = savedText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleOpenCalendar = () => {
    const url = generateGoogleCalendarUrl(displayText, date);
    window.open(url, "_blank");
  };

  const handleEditSave = () => {
    setSavedText(editedText);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedText(savedText);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-6 transition-all ${
        isSelected ? "border-blue-600 shadow-lg" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={!isEditing ? onSelect : undefined}
      style={{ cursor: isEditing ? "default" : "pointer" }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {isAdjusted && (
              <Badge className="bg-yellow-100 text-yellow-800">一部調整しました</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full min-h-[120px] p-3 border border-blue-400 rounded-md text-gray-700 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-xs text-gray-400 text-right">{[...editedText].length}文字</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded p-4 min-h-[100px]">
            <p className="text-gray-700 whitespace-pre-wrap break-words">{displayText}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEditSave(); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check size={16} />保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEditCancel(); }}
                className="flex items-center gap-2"
              >
                <X size={16} />キャンセル
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                {copied ? "コピーしました" : "コピー"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditedText(savedText); }}
                className="flex items-center gap-2"
              >
                <Pencil size={16} />書き直す
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleOpenCalendar(); }}
                className="flex items-center gap-2"
              >
                <Calendar size={16} />カレンダーに追加
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
