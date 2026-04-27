"use client";

import { usePathname } from "next/navigation";
import FloatingVoiceAssistant from "@/components/shared/FloatingVoiceAssistant";

export default function DashboardVoiceAssistant() {
  const pathname = usePathname();

  // Bartering has its own chat voice flow, so avoid mixing two voice pipelines.
  if (pathname?.startsWith("/dashboard/bartering")) {
    return null;
  }

  return <FloatingVoiceAssistant />;
}