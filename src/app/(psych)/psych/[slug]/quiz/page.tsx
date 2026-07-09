import { notFound } from "next/navigation";
import { getPsychTest } from "@/lib/psych/registry";
import QuizClient from "@/components/psych/QuizClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const test = getPsychTest(slug);
  if (!test) notFound();

  return <QuizClient slug={slug} data={test} />;
}
