"use client"

import { useConversation } from "@elevenlabs/react"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface VoiceConversationProps {
  agentId: string
  userId: string
}

export function VoiceConversation({ agentId, userId }: VoiceConversationProps) {
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs")
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs")
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error)
    },
  })

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop the test stream (we just needed to check permissions)
      stream.getTracks().forEach((track) => track.stop())

      // Start the ElevenLabs conversation
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
        dynamicVariables: {
          user_id: userId,
        },
      })
    } catch (error) {
      console.error("Failed to start conversation:", error)
    }
  }, [agentId, userId, conversation])

  const stopConversation = useCallback(async () => {
    await conversation.endSession()
  }, [conversation])

  const getStatusText = () => {
    switch (conversation.status) {
      case "connecting":
        return "Conectando..."
      case "connected":
        return conversation.isSpeaking ? "Hablando..." : "Escuchando..."
      case "disconnected":
        return "Desconectado"
      default:
        return "Listo para hablar"
    }
  }

  const getStatusColor = () => {
    switch (conversation.status) {
      case "connecting":
        return "text-yellow-600 dark:text-yellow-500"
      case "connected":
        return conversation.isSpeaking
          ? "text-green-600 dark:text-green-500"
          : "text-blue-600 dark:text-blue-500"
      case "disconnected":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  const isConnecting = conversation.status === "connecting"
  const isConnected = conversation.status === "connected"

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Status Indicator */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Animated circle when speaking */}
          {isConnected && conversation.isSpeaking && (
            <div className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
          )}

          {/* Main status circle */}
          <div
            className={`relative flex size-24 items-center justify-center rounded-full border-4 transition-all ${
              isConnected
                ? conversation.isSpeaking
                  ? "border-green-500 bg-green-500/10"
                  : "border-blue-500 bg-blue-500/10"
                : "border-muted bg-muted/10"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="size-10 animate-spin text-yellow-600" />
            ) : isConnected ? (
              <Mic
                className={`size-10 ${conversation.isSpeaking ? "text-green-600 dark:text-green-500" : "text-blue-600 dark:text-blue-500"}`}
              />
            ) : (
              <MicOff className="size-10 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Status text */}
        <p className={`text-center text-lg font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </p>
      </div>

      {/* Control Button */}
      <Button
        size="lg"
        variant={isConnected ? "destructive" : "default"}
        onClick={isConnected ? stopConversation : startConversation}
        disabled={isConnecting}
        className="min-w-[200px]"
      >
        {isConnecting ? (
          <>
            <Loader2 className="animate-spin" />
            Conectando...
          </>
        ) : isConnected ? (
          "Terminar conversación"
        ) : (
          "Iniciar conversación"
        )}
      </Button>

      {/* Helper text */}
      {!isConnected && !isConnecting && (
        <p className="text-muted-foreground max-w-md text-center text-sm">
          Haz clic para comenzar una conversación de voz con tu compañero de
          bienestar
        </p>
      )}
    </div>
  )
}
