"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFortuneStream } from "@/lib/hooks/useFortuneStream";
import { useFortuneStatus } from "@/lib/hooks/useFortuneStatus";
import { useBirthInfo } from "@/lib/hooks/useBirthInfo";
import { type FortuneType, type GeneralFortuneInput } from "@/types/fortune";
import FortuneResult from "./FortuneResult";
import TodayFortuneCard from "@/components/common/TodayFortuneCard";
import FavoriteButton from "@/components/common/FavoriteButton";
import SavedBirthBanner from "@/components/common/SavedBirthBanner";

interface Config {
  type: FortuneType;
  title: string;
  icon: string;
  questionLabel: string;
  questionPlaceholder: string;
}

interface Props {
  config: Config;
}

export default function GeneralFortuneForm({ config }: Props) {
  const { user } = useAuth();
  const { result, isLoading, error, submit, reset } = useFortuneStream();
  const { fortuneStatus } = useFortuneStatus(config.type);
  const { savedInfo, saving, saveStatus, saveBirthInfo } = useBirthInfo();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [question, setQuestion] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [wantSave, setWantSave] = useState(false);

  // 저장된 정보로 자동 채우기
  useEffect(() => {
    if (savedInfo && !isOtherMode) {
      setYear(String(savedInfo.year));
      setMonth(String(savedInfo.month));
      setDay(String(savedInfo.day));
      setGender(savedInfo.gender ?? "male");
    }
  }, [savedInfo, isOtherMode]);

  useEffect(() => {
    setWantSave(!!savedInfo && !isOtherMode);
  }, [savedInfo, isOtherMode]);

  function handleOtherMode() {
    setIsOtherMode(true);
    setYear(""); setMonth(""); setDay(""); setGender("male");
  }

  function handleRestoreMyInfo() {
    setIsOtherMode(false);
    if (savedInfo) {
      setYear(String(savedInfo.year));
      setMonth(String(savedInfo.month));
      setDay(String(savedInfo.day));
      setGender(savedInfo.gender ?? "male");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d) return;

    const input: GeneralFortuneInput = {
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      gender,
      question: question.trim() || undefined,
    };

    await submit(config.type, input);
  }

  async function handleToggleSave() {
    const newVal = !wantSave;
    setWantSave(newVal);
    if (newVal) {
      const y = parseInt(year), m = parseInt(month), d = parseInt(day);
      if (y && m && d) {
        await saveBirthInfo({ year: y, month: m, day: d, gender });
      }
    }
  }

  if (result || isLoading || error) {
    return (
      <FortuneResult
        result={result}
        isLoading={isLoading}
        error={error}
        onReset={() => { reset(); setQuestion(""); }}
        title={`${config.title} 결과`}
        icon={config.icon}
      />
    );
  }

  if (fortuneStatus?.todayReading && !result && !showForm) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-xs transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /><Home className="w-3.5 h-3.5" />
          </Link>
          <FavoriteButton menuId={config.type} />
        </div>
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{config.icon}</span>
          <h1 className="text-white font-bold text-2xl">{config.title}</h1>
          <p className="text-white/50 text-sm mt-2">{config.questionLabel}</p>
        </div>
        <TodayFortuneCard
          label={`오늘의 ${config.title} 결과`}
          todayReading={fortuneStatus.todayReading}
          exhausted={fortuneStatus.exhausted}
          onNewReading={() => setShowForm(true)}
        />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-xs transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /><Home className="w-3.5 h-3.5" />
        </Link>
        <FavoriteButton menuId={config.type} />
      </div>

      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">{config.icon}</span>
        <h1 className="text-white font-bold text-2xl">{config.title}</h1>
        <p className="text-white/50 text-sm mt-2">{config.questionLabel}</p>
      </div>

      {/* 저장된 내 정보 배너 */}
      {user && savedInfo && (
        <SavedBirthBanner
          savedInfo={savedInfo}
          isOtherMode={isOtherMode}
          onOtherMode={handleOtherMode}
          onRestoreMyInfo={handleRestoreMyInfo}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">

          {/* 생년월일 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">생년월일</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-white/40 text-[10px] mb-1">년도</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1900}
                  max={currentYear}
                  placeholder="1990"
                  required
                  className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm placeholder-white/20 focus:outline-none focus:border-[#9382ff]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-white/40 text-[10px] mb-1">월</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm focus:outline-none focus:border-[#9382ff]/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="bg-gray-900">{m}월</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] mb-1">일</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm focus:outline-none focus:border-[#9382ff]/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900 text-white/40">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-gray-900">{d}일</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">성별</label>
            <div className="flex gap-2">
              {([["male", "남성"], ["female", "여성"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGender(val)}
                  className={`flex-1 py-2 rounded-[5px] text-sm font-medium transition-colors ${
                    gender === val
                      ? "bg-[#5046e4] text-[#f4f0ff]"
                      : "bg-white/5 text-[#a8a6b7] hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 상황/질문 */}
          <div>
            <label className="block text-white/60 text-xs mb-2">
              상황 / 질문 <span className="text-white/30">(선택)</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={config.questionPlaceholder}
              className="w-full px-3 py-2.5 rounded-[5px] bg-white/5 border border-white/10 text-[#f4f0ff] text-sm placeholder-white/25 focus:outline-none focus:border-[#9382ff]/50 transition-colors"
            />
          </div>
        </div>

        {/* 출생정보 저장 버튼 */}
        {user && !isOtherMode && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-white/60">
              {saving ? "저장 중..." : wantSave ? "생년월일 저장중" : "생년월일 저장"}
              {saveStatus === "saved" && <span className="text-[#9382ff] text-xs ml-2">✓</span>}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={wantSave}
              onClick={handleToggleSave}
              disabled={saving}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 shrink-0 focus:outline-none ${
                wantSave ? "bg-[#5046e4]" : "bg-white/20"
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                wantSave ? "translate-x-[22px]" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={fortuneStatus?.exhausted === true}
          className={`w-full py-3 rounded-[5px] font-medium text-sm transition-colors ${
            fortuneStatus?.exhausted
              ? "bg-white/8 text-[#a8a6b7]/40 cursor-not-allowed"
              : "bg-[#5046e4] text-[#f4f0ff] hover:bg-[#3d36c4]"
          }`}
        >
          {fortuneStatus?.exhausted
            ? `오늘 ${config.title}을 이미 이용했어요`
            : `${config.icon} ${config.title} 보기`}
        </button>
      </form>
    </div>
  );
}
