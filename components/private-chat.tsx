"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, ArrowLeft } from "lucide-react"

interface PrivateChatProps {
  recipient: string
  onBack?: () => void
  onSend: (recipient: string, message: string) => void
}

export function PrivateChat({ recipient, onBack, onSend }: PrivateChatProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<
    { id: number; from: string; content: string; time: string }[]
  >([])

  const handleSend = () => {
    if (message.trim()) {
      onSend(recipient, message)
      setMessages([
        ...messages,
        {
          id: Date.now(),
          from: "You",
          content: message,
          time: new Date().toLocaleTimeString(),
        },
      ])
      setMessage("")
    }
  }

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-amber-400">Chat with {recipient}</CardTitle>
        {onBack && (
          <Button
            onClick={onBack}
            size="sm"
            variant="outline"
            className="border-amber-600/50 text-amber-400 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-2 rounded bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-amber-400">{msg.from}</span>
                <span className="text-xs text-slate-400">{msg.time}</span>
              </div>
              <p className="text-sm text-slate-200">{msg.content}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${recipient}...`}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
          />
          <Button onClick={handleSend} className="bg-amber-600 hover:bg-amber-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
