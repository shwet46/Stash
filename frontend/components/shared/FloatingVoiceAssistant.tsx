"use client";
import { useState, useRef } from "react";
import { LuMic, LuSquare } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function FloatingVoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceReply, setVoiceReply] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const { data: session } = useSession();
  const recorderOptions = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? { mimeType: "audio/webm;codecs=opus" }
    : undefined;

  if ((session?.user as any)?.role === "worker") {
    return null;
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = recorderOptions ? new MediaRecorder(stream, recorderOptions) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setVoiceReply(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required for voice features.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("source", "floating_assistant");
    formData.append("role", ((session?.user as any)?.role || "admin").toString());
    formData.append("caller", ((session?.user as any)?.phone || (session?.user as any)?.name || "web_user").toString());
    formData.append("user_name", ((session?.user as any)?.name || "Admin").toString());
    formData.append("language_hint", navigator.language.startsWith("hi") ? "hi-IN" : "en-IN");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/web`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const audioBlobResp = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlobResp);
      const audio = new Audio(audioUrl);
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      audio.play();

      const commandId = response.headers.get("X-Voice-Command-Id");
      const voiceIntent = response.headers.get("X-Voice-Intent");
      const reply = response.headers.get("X-Voice-Activity") || response.headers.get("X-Voice-Reply");
      
      setVoiceReply(
        reply || `${commandId ? "Saved" : "Processed"}${voiceIntent ? ` • ${voiceIntent}` : ""}`
      );
    } catch (err) {
      console.error("Error processing voice:", err);
      setVoiceReply("Could not process voice command");
      alert("Could not process voice command at this time.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 99,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <AnimatePresence>
        {(voiceReply || isRecording || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              backgroundColor: "var(--color-brand-50)",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--color-brand-800)",
              boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
              border: "1px solid var(--color-brand-200)",
              maxWidth: "18rem",
              textAlign: "center",
            }}
          >
            {voiceReply || (isRecording ? "Listening..." : "Processing...")}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          backgroundColor: isRecording ? "var(--color-danger-500)" : "var(--color-brand-600)",
          color: "white",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isProcessing ? "not-allowed" : "pointer",
          boxShadow: isRecording
            ? "0 0 0 4px rgba(239, 68, 68, 0.3)"
            : "0 10px 25px rgba(179, 107, 65, 0.4)",
          opacity: isProcessing ? 0.7 : 1,
          transition: "background-color 0.3s",
        }}
      >
        {isRecording ? <LuSquare size={20} /> : <LuMic size={24} />}
      </motion.button>
    </div>
  );
}
