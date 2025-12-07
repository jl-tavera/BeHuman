import { getSupabaseServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat/chat-interface"

export default async function ChatPage() {
  const supabase = await getSupabaseServerClient()

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Check if user is a company user - they should only access dashboard
  const { data: companyData } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (companyData) {
    redirect("/dashboard")
  }

  // Fetch user's ElevenLabs agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("elevenlabs_agent_id, agent_name")
    .eq("user_id", user.id)
    .single()

  if (agentError || !agent) {
    return (
      <div className="container flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No se pudo cargar tu agente. Por favor, contacta con soporte.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ChatInterface
      agentId={agent.elevenlabs_agent_id}
      userId={user.id}
      agentName={agent.agent_name}
    />
  )
}
