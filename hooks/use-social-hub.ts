"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
  onlinePlayers,
  corporations,
  friendRequests as initialFriendRequests,
  friendsList as initialFriends,
  blockedUsersList as initialBlocked,
} from "@/data"
import type { ChatMessage } from "@/types"

export function useSocialHub() {
  const [activeTab, setActiveTab] = useState<"chat" | "corporations" | "players">("chat")
  const [chatMessage, setChatMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<"global" | "local" | "corp">("global")
  const [friends, setFriends] = useState(initialFriends)
  const [blockedUsers, setBlockedUsers] = useState(initialBlocked)
  const [pendingRequests, setPendingRequests] = useState(initialFriendRequests)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      transports: ["websocket"],
      reconnection: true,
    })

    socketRef.current = socket

    socket.on("chat message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        socket.connect()
      }
    })

    socket.on("connect_error", () => {
      setTimeout(() => socket.connect(), 1000)
    })

    return () => {
      socket.off("chat message")
      socket.disconnect()
    }
  }, [])

  const filteredMessages = messages.filter((msg) => msg.channel === selectedChannel)

  const sendMessage = () => {
    if (chatMessage.trim() && socketRef.current) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        channel: selectedChannel,
        player: "You",
        message: chatMessage,
        time: new Date().toLocaleTimeString(),
      }
      socketRef.current.emit("chat message", newMessage)
      setChatMessage("")
    }
  }

  const addFriend = (player: { id: number; name: string }) => {
    if (!friends.find((f) => f.id === player.id)) {
      setFriends([...friends, player])
    }
    setPendingRequests(pendingRequests.filter((req) => req.id !== player.id))
  }

  const blockUser = (player: { id: number; name: string }) => {
    if (!blockedUsers.find((b) => b.id === player.id)) {
      setBlockedUsers([...blockedUsers, player])
    }
    setFriends(friends.filter((f) => f.id !== player.id))
    setPendingRequests(pendingRequests.filter((req) => req.id !== player.id))
  }

  const sendPrivateMessage = (recipient: string, message: string) => {
    if (message.trim()) {
      console.log(`Sending private message to ${recipient}: ${message}`)
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
    friends,
    blockedUsers,
    friendRequests: pendingRequests,
    setChatMessage,
    sendMessage,
    addFriend,
    blockUser,
    sendPrivateMessage,
    switchTab,
    switchChannel,
  }
}
