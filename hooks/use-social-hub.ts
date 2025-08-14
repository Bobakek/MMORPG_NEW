"use client"

import { useState } from "react"
import { chatMessages, onlinePlayers, corporations } from "@/data"

export function useSocialHub() {
  const [activeTab, setActiveTab] = useState<"chat" | "corporations" | "players">("chat")
  const [chatMessage, setChatMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<"global" | "local" | "corp">("global")

  const filteredMessages = chatMessages.filter((msg) => msg.channel === selectedChannel)

  const sendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message to a server
      console.log(`Sending message to ${selectedChannel}: ${chatMessage}`)
      setChatMessage("")
    }
  }

  const switchTab = (tab: "chat" | "corporations" | "players") => {
    setActiveTab(tab)
  }

  const switchChannel = (channel: "global" | "local" | "corp") => {
    setSelectedChannel(channel)
  }

  return {
    activeTab,
    chatMessage,
    selectedChannel,
    filteredMessages,
    onlinePlayers,
    corporations,
    setChatMessage,
    sendMessage,
    switchTab,
    switchChannel,
  }
}
