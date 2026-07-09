"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import type { PsychTestData } from "@/types/psych";
import { scoreMBTI, getMBTIAxisScores } from "@/lib/psych/scoring";

interface Props {
  slug: string;
  data: PsychTestData;
}

const SLIDE = {
  initial: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 48, opacity: 0 }),
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
};

export default function QuizClient({ slug, data }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const storageKey = `psych-quiz-${slug}`;
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const { answers: a, current: c } = JSON.parse(saved) as {
          answers: number[];
          current: number;
        };
        setAnswers(a);
        setCurrent(c);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({ answers, current }));
    }
  }, [answers, current, storageKey]);

  function handleAnswer(optionIdx: number) {
    const newAnswers = [...answers];
    newAnswers[current] = optionIdx;
    setAnswers(newAnswers);
    setDirection(1);

    if (current === data.questions.length - 1) {
      const type = scoreMBTI(newAnswers, data.questions);
      const scores = getMBTIAxisScores(newAnswers, data.questions);
      localStorage.removeItem(storageKey);
      const params = new URLSearchParams({
        type,
        e: String(scores.E), i: String(scores.I),
        s: String(scores.S), n: String(scores.N),
        t: String(scores.T), f: String(scores.F),
        j: String(scores.J), p: String(scores.P),
      });
      router.push(`/psych/${slug}/result?${params.toString()}`);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleBack() {
    if (current === 0) {
      router.push(`/psych/${slug}`);
    } else {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }

  const question = data.questions[current];
  const progress = ((current + 1) / data.questions.length) * 100;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ebf5ff" }}>
      {/* 상단 고정 헤더 */}
      <div
        className="fixed top-0 left-0 right-0 z-10 px-4 pt-4 pb-3"
        style={{ backgroundColor: "#ebf5ff" }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3 mt-14">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-black/5"
              style={{ color: "#535862" }}
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1
              className="flex-1 text-center text-sm font-medium truncate"
              style={{ color: "#535862" }}
            >
              {data.title}
            </h1>
            <button
              onClick={() => router.push(`/psych/${slug}`)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-black/5"
              style={{ color: "#93979f" }}
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 진행률 바 */}
          <div className="psych-progress-track">
            <div
              className="psych-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs mt-1" style={{ color: "#93979f" }}>
            {current + 1} / {data.questions.length}
          </p>
        </div>
      </div>

      {/* 질문 영역 */}
      <div className="max-w-lg mx-auto px-4 pt-36 pb-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={SLIDE}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={SLIDE.transition}
          >
            <h2
              className="text-xl font-semibold mb-8 leading-relaxed"
              style={{ color: "#0a0d12", letterSpacing: "-0.02em" }}
            >
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="psych-option-btn w-full text-left px-5 py-4 text-sm leading-relaxed"
                  style={{ color: "#0a0d12" }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
