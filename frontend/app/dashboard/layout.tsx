import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import FloatingVoiceAssistant from "@/components/shared/FloatingVoiceAssistant";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Stash AI",
  description: "Manage your godown operations from a single dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="dashboard-shell">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">{children}</div>
        </main>
        <FloatingVoiceAssistant />
      </div>
    </LanguageProvider>
  );
}
