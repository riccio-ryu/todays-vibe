import { notFound } from "next/navigation";
import { getPsychTest } from "@/lib/psych/registry";
import DiagnosticResult from "@/components/psych/DiagnosticResult";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const test = getPsychTest(slug);
  if (!test) notFound();

  const typeCode = (sp.type ?? "").toUpperCase();
  const result = test.results[typeCode];
  if (!result) notFound();

  const scores = {
    E: Number(sp.e ?? 0), I: Number(sp.i ?? 0),
    S: Number(sp.s ?? 0), N: Number(sp.n ?? 0),
    T: Number(sp.t ?? 0), F: Number(sp.f ?? 0),
    J: Number(sp.j ?? 0), P: Number(sp.p ?? 0),
  };

  return (
    <DiagnosticResult
      slug={slug}
      typeCode={typeCode}
      result={result}
      scores={scores}
    />
  );
}
