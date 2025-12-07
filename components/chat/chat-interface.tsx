"use client";

import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { ArrowLeft, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AudioWave } from "./audio-wave";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  agentId: string;
  userId: string;
  humanName?: string;
}

type CallState = "idle" | "connecting" | "connected";

export function ChatInterface({
  agentId,
  humanName = "Tu Compañero",
}: ChatInterfaceProps) {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the test stream (we just needed to check permissions)
      stream.getTracks().forEach((track) => track.stop());

      // Start the ElevenLabs conversation
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [agentId, conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality with ElevenLabs
  }, [isMuted]);

  const getCallState = (): CallState => {
    switch (conversation.status) {
      case "connecting":
        return "connecting";
      case "connected":
        return "connected";
      default:
        return "idle";
    }
  };

  const callState = getCallState();

  const getStatusText = () => {
    switch (callState) {
      case "connecting":
        return "Conectando...";
      case "connected":
        return conversation.isSpeaking ? "Hablando..." : "Escuchando...";
      default:
        return humanName;
    }
  };

  const getStatusIndicator = () => {
    if (callState === "connected") {
      return (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              conversation.isSpeaking ? "bg-green-500" : "bg-blue-500"
            )}
          />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      );
    }

    if (callState === "connecting") {
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      );
    }

    return <span className="text-sm font-medium text-muted-foreground">{humanName}</span>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 pt-8 pb-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {getStatusIndicator()}
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content - AudioWave visualization */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Title and status */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {humanName}
            </h2>
            {callState !== "idle" && (
              <p className="text-sm text-muted-foreground">
                {callState === "connecting" && "Conectando..."}
                {callState === "connected" && conversation.isSpeaking && "Hablando..."}
                {callState === "connected" && !conversation.isSpeaking && "Escuchando..."}
              </p>
            )}
          </div>

          {/* Audio wave container */}
          <div className="relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center">
            {callState === "idle" ? (
              <div className="text-center space-y-6">
                {/* Static audio waves when idle */}
                <div className="h-48 flex items-center justify-center">
                  <AudioWave
                    isActive={false}
                    barCount={7}
                    className="h-48 w-full"
                  />
                </div>
                <p className="text-muted-foreground text-base">
                  Toca el botón para iniciar
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-8 w-full">
                {/* Animated waves when speaking, static when listening */}
                <div className="h-48 flex items-center justify-center w-full">
                  <AudioWave
                    isActive={callState === "connected" && conversation.isSpeaking}
                    barCount={7}
                    className="h-48 w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Call controls */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-6">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
          {callState !== "idle" && (
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full",
                isMuted && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              onClick={toggleMute}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          )}

          <Button
            size="icon"
            variant={callState !== "idle" ? "destructive" : "default"}
            className="h-16 w-16 rounded-full"
            onClick={callState !== "idle" ? stopConversation : startConversation}
            disabled={callState === "connecting"}
          >
            {callState !== "idle" ? (
              <PhoneOff className="h-7 w-7" />
            ) : (
              <Phone className="h-7 w-7" />
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
