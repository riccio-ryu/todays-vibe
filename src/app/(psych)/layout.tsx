import Header from "@/components/Header";

export default function PsychLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#ebf5ff" }}>
      <Header />
      <main className="pt-20">{children}</main>
    </div>
  );
}
