import type { Metadata } from "next";
import AboutSection from "@/components/home/AboutSection";

export const metadata: Metadata = {
  title: "서비스 소개 | 오늘운",
  description: "오늘운 서비스 소개 및 자주 묻는 질문",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AboutSection />
    </div>
  );
}
