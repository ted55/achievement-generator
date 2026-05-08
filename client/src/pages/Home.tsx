import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import KeywordInput from "@/components/KeywordInput";
import AchievementCard from "@/components/AchievementCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

type ToneType = "gratitude" | "achievementDiary" | "powerful" | "healing";

const toneLabels: Record<ToneType, string> = {
  gratitude: "感謝型",
  achievementDiary: "達成日記型",
  powerful: "パワフル型",
  healing: "癒し型",
};

const DAY_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const dow = DAY_OF_WEEK[d.getDay()];
  return `${dateStr.replace(/-/g, "/")}（${dow}）`;
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [requiredKws, setRequiredKws] = useState<string[]>([]);
  const [optionalKws, setOptionalKws] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(() => {
    // JSTで今日の日付を取得（UTC+9）
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().split("T")[0];
  });
  const [selectedTone, setSelectedTone] = useState<ToneType>("gratitude");

  const generateMutation = trpc.achievement.generate.useMutation();
  const isLoading = generateMutation.isPending;
  const results = generateMutation.data;

  const sortedResults = useMemo(() => {
    if (!results) return null;
    const order: ToneType[] = ["gratitude", "achievementDiary", "powerful", "healing"];
    const items = [
      { key: "gratitude" as const,        title: toneLabels.gratitude,        text: results.gratitude,        adjusted: results.adjustedFlags.gratitude },
      { key: "achievementDiary" as const, title: toneLabels.achievementDiary, text: results.achievementDiary, adjusted: results.adjustedFlags.achievementDiary },
      { key: "powerful" as const,         title: toneLabels.powerful,         text: results.powerful,         adjusted: results.adjustedFlags.powerful },
      { key: "healing" as const,          title: toneLabels.healing,          text: results.healing,          adjusted: results.adjustedFlags.healing },
    ];
    return items.sort((a, b) => {
      if (a.key === selectedTone) return -1;
      if (b.key === selectedTone) return 1;
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  }, [results, selectedTone]);

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast.error("目標テキストを入力してください");
      return;
    }
    try {
      await generateMutation.mutateAsync({
        goal: goal.trim(),
        requiredKws,
        optionalKws,
        deadline,
        primaryTone: selectedTone,
      });
      toast.success("達成文を生成しました！");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "生成に失敗しました。再試行してください。");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <h1 className="text-3xl font-bold text-gray-900">達成文生成アプリ</h1>
          <p className="text-gray-600 mt-1">目標とキーワードから、4パターンの達成文を自動生成して、Googleカレンダーに追加できます。</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-3">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-4">

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-base font-semibold">目標テキスト（最大120文字）</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value.slice(0, 120))}
              placeholder="例：英語で日常会話ができるようになる"
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500">{goal.length}/120文字</p>
          </div>

          {/* Keywords */}
          <KeywordInput
            requiredKws={requiredKws}
            optionalKws={optionalKws}
            onRequiredKwsChange={setRequiredKws}
            onOptionalKwsChange={setOptionalKws}
          />

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">今日</Label>
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">{formatDateWithDay(deadline)}</span>
              <span className="text-gray-400">→</span>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tone */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">トーン選択</Label>
            <RadioGroup value={selectedTone} onValueChange={(v) => setSelectedTone(v as ToneType)}>
              {(["gratitude", "achievementDiary", "powerful", "healing"] as ToneType[]).map((tone) => (
                <div key={tone} className="flex items-center space-x-2">
                  <RadioGroupItem value={tone} id={`tone-${tone}`} />
                  <Label htmlFor={`tone-${tone}`} className="font-normal cursor-pointer">
                    {toneLabels[tone]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "生成中..." : "達成文を生成"}
          </Button>
        </div>

        {/* Error */}
        {generateMutation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-semibold">エラーが発生しました</p>
              <p className="text-red-700 text-sm mt-1">{generateMutation.error.message}</p>
              <Button onClick={handleGenerate} variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-50">
                再試行
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">生成中...</h2>
            <div className="grid gap-4">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          </div>
        )}

        {/* Results */}
        {sortedResults && !isLoading && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">生成結果</h2>
            <div className="grid gap-4">
              {sortedResults.map((item) => (
                <AchievementCard
                  key={item.key}
                  title={item.title}
                  text={item.text}
                  date={deadline}
                  isSelected={item.key === selectedTone}
                  isAdjusted={item.adjusted}
                  onSelect={() => setSelectedTone(item.key)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
