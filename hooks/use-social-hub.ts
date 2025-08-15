"use client"

import { useState } from "react"
import {
  chatMessages,
  onlinePlayers,
  corporations,
  friendRequests as initialFriendRequests,
  friendsList as initialFriends,
  blockedUsersList as initialBlocked,
} from "@/data"

export function useSocialHub() {
  const [activeTab, setActiveTab] = useState<"chat" | "corporations" | "players">("chat")
  const [chatMessage, setChatMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<"global" | "local" | "corp">("global")
  const [friends, setFriends] = useState(initialFriends)
  const [blockedUsers, setBlockedUsers] = useState(initialBlocked)
  const [pendingRequests, setPendingRequests] = useState(initialFriendRequests)

  const filteredMessages = chatMessages.filter((msg) => msg.channel === selectedChannel)

  const sendMessage = () => {
    if (chatMessage.trim()) {
      // In a real app, this would send the message to a server
      console.log(`Sending message to ${selectedChannel}: ${chatMessage}`)
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
