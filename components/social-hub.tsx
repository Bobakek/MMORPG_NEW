"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MessageSquare, Building, Users, Send, UserPlus, Mail, Shield } from "lucide-react"
import { useSocialHub } from "@/hooks/use-social-hub"

interface SocialHubProps {
  onBack: () => void
}

export function SocialHub({ onBack }: SocialHubProps) {
  const {
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
  } = useSocialHub()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Community Nexus
            </h1>
            <p className="text-slate-300 mt-2">Connect with pilots across the galaxy</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="border-amber-600/50 text-amber-400 hover:bg-amber-600/20 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Main
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => switchTab("chat")}
            variant={activeTab === "chat" ? "default" : "outline"}
            className={
              activeTab === "chat"
                ? "bg-amber-600 hover:bg-amber-700"
                : "border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
            }
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            onClick={() => switchTab("corporations")}
            variant={activeTab === "corporations" ? "default" : "outline"}
            className={
              activeTab === "corporations"
                ? "bg-amber-600 hover:bg-amber-700"
                : "border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
            }
          >
            <Building className="w-4 h-4 mr-2" />
            Corporations
          </Button>
          <Button
            onClick={() => switchTab("players")}
            variant={activeTab === "players" ? "default" : "outline"}
            className={
              activeTab === "players"
                ? "bg-amber-600 hover:bg-amber-600/20"
                : "border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
            }
          >
            <Users className="w-4 h-4 mr-2" />
            Online Players
          </Button>
        </div>

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 h-96">
                <CardHeader>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => switchChannel("global")}
                      variant={selectedChannel === "global" ? "default" : "outline"}
                      className={
                        selectedChannel === "global"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Global
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => switchChannel("local")}
                      variant={selectedChannel === "local" ? "default" : "outline"}
                      className={
                        selectedChannel === "local"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Local
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => switchChannel("corp")}
                      variant={selectedChannel === "corp" ? "default" : "outline"}
                      className={
                        selectedChannel === "corp"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "border-amber-600/50 text-amber-400"
                      }
                    >
                      Corporation
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {filteredMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 p-2 rounded bg-slate-800/50">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-rose-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {msg.player[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-amber-400">{msg.player}</span>
                            <span className="text-xs text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-sm text-slate-200">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={`Type message in ${selectedChannel} chat...`}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                    <Button
                      onClick={sendMessage}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
                <CardHeader>
                  <CardTitle className="text-amber-400">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                  <Button className="w-full bg-slate-700 hover:bg-slate-600">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button className="w-full bg-slate-700 hover:bg-slate-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Block User
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "corporations" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {corporations.map((corp) => (
              <Card
                key={corp.id}
                className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30 hover:border-amber-600/60 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-rose-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-amber-400">{corp.name}</CardTitle>
                      <p className="text-sm text-slate-400">{corp.members} members</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-4">{corp.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CEO:</span>
                      <span className="text-amber-400">{corp.ceo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Founded:</span>
                      <span className="text-slate-300">{corp.founded}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700">
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-600/50 text-amber-400 bg-transparent">
                      Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "players" && (
          <Card className="bg-slate-900/80 backdrop-blur-sm border-amber-600/30">
            <CardHeader>
              <CardTitle className="text-amber-400">Online Players ({onlinePlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlinePlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-rose-600 rounded-full flex items-center justify-center font-bold">
                        {player.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-sm text-slate-400">{player.corporation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            player.status === "online"
                              ? "bg-green-500"
                              : player.status === "in-combat"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-sm text-slate-300 capitalize">{player.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">{player.location}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="border-amber-600/50 text-amber-400 bg-transparent">
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-rose-600/50 text-rose-400 bg-transparent">
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
