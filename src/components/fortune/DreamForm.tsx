"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { DreamInput } from "@/types/fortune";
import FortuneResult from "./FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";
import FavoriteButton from "@/components/common/FavoriteButton";

const MOOD_OPTIONS = [
  { value: "행복함", label: "😊 행복함" },
  { value: "무서움", label: "😨 무서움" },
  { value: "슬픔", label: "😢 슬픔" },
  { value: "설렘", label: "🥰 설렘" },
  { value: "불안함", label: "😰 불안함" },
  { value: "신기함", label: "🤔 신기함" },
  { value: "평온함", label: "😌 평온함" },
];

export default function DreamForm() {
  const [dreamDescription, setDreamDescription] = useState("");
  const [mood, setMood] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus("dream");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dreamDescription.trim()) return;

    const input: DreamInput = {
      dreamDescription: dreamDescription.trim(),
      mood: mood || undefined,
    };

    await submit("dream", input);
  };

  const handleReset = () => {
    reset();
    setDreamDescription("");
    setMood("");
  };

  if (result || isLoading) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        error={error}
        onReset={handleReset}
        title="꿈해몽 결과"
        icon="💭"
        fortuneType="dream"
      />
    );
  }

  if (fortuneStatus?.todayReading && !showForm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> 홈
        </Link>
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💭</div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-white mb-2">꿈해몽</h1>
            <FavoriteButton menuId="dream" />
          </div>
        </div>
        <TodayFortuneCard
          label="오늘의 꿈해몽 결과"
          todayReading={fortuneStatus.todayReading}
          highlightColor="text-purple-300"
          exhausted={fortuneStatus.exhausted}
          onNewReading={() => setShowForm(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> 홈
      </Link>
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">💭</div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-white mb-2">꿈해몽</h1>
          <FavoriteButton menuId="dream" />
        </div>
        <p className="text-purple-300 text-sm">
          꾼 꿈을 자세히 적어주세요. 전통 해몽과 심리학적 관점으로 풀이해
          드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 꿈 내용 입력 */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            꿈 내용 <span className="text-purple-400">*</span>
          </label>
          <textarea
            value={dreamDescription}
            onChange={(e) => setDreamDescription(e.target.value)}
            placeholder="어떤 꿈을 꾸셨나요? 기억나는 내용을 최대한 자세히 적어주세요. (사람, 장소, 사건, 색깔 등)"
            rows={6}
            maxLength={1000}
            className="w-full rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/30 resize-none transition-colors"
            required
          />
          <div className="text-right text-white/30 text-xs mt-1">
            {dreamDescription.length}/1000
          </div>
        </div>

        {/* 감정 선택 (선택) */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            꿈에서 느낀 감정{" "}
            <span className="text-white/40 font-normal">(선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setMood(mood === option.value ? "" : option.value)
                }
                className={`px-3 py-1.5 rounded-[32px] text-sm transition-all duration-150 ${
                  mood === option.value
                    ? "bg-[#5046e4] text-[#f4f0ff] border border-[#9382ff]/40"
                    : "bg-white/5 text-[#a8a6b7] border border-white/10 hover:bg-white/10 hover:text-[#f4f0ff]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-2xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!dreamDescription.trim() || isLoading}
          className="w-full py-3.5 rounded-[5px] font-medium text-[#f4f0ff] bg-[#5046e4] hover:bg-[#3d36c4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ✨ 꿈 해석하기
        </button>
      </form>
    </div>
  );
}
