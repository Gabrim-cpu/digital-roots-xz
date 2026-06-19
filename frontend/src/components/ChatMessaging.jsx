/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { User, Message } from "../types";
import { Send, Mic, Play, Globe, MessageSquare, AlertCircle, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessagingProps {
  currentUser: User;
  connectedUsers: User[];
}

const CHAT_PRESETS = [
  {
    language: "Duala",
    original: "A begé lara wa mo ndedi. Onola mboti.",
    meaning: "Please guide my hand carefully while setting up my mobile wallet.",
  },
  {
    language: "Ewondo",
    original: "Mebanga o lara ma eyidi internet.",
    meaning: "I am trying to learn how to connect my camera on WhatsApp.",
  }
];

export default function ChatMessaging({ currentUser, connectedUsers }: ChatMessagingProps) {
  const [activePartner, setActivePartner] = useState<User | null>(connectedUsers[0] || null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize conversations with some welcome messages
  useEffect(() => {
    const initialMap: Record<string, Message[]> = {};
    connectedUsers.forEach((user) => {
      if (user.role === "senior") {
        initialMap[user.id] = [
          {
            id: `init-1-${user.id}`,
            senderId: user.id,
            receiverId: currentUser.id,
            content: "Hello! Thank you for volunteering to help me learn how to use these smartphones. I would love to share some of my favorite oral folklore stories in return.",
            type: "text",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          }
        ];
      } else {
        initialMap[user.id] = [
          {
            id: `init-1-${user.id}`,
            senderId: user.id,
            receiverId: currentUser.id,
            content: "Greetings, Elder! I am excited to connect. I can help with anything, from secure mobile money to internet safety, and I am very keen to learn your traditional wisdom.",
            type: "text",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          }
        ];
      }
    });

    // Add chatbot companion
    initialMap["ngala-bot"] = [
      {
        id: "bot-init",
        senderId: "ngala-bot",
        receiverId: currentUser.id,
        content: currentUser.role === "senior"
          ? "Welcome! I am Ngalá, your AI Digital Helper. Introduce yourself or ask me questions like: 'How do I join a video call?' or 'What is a browser?' in natural simple words."
          : "Salutations! I am Ngalá, your AI Cultural Sage. Ask me about Cameroonian dialects, the history of Ndolé, Ewondo proverbs, or Duala traditions.",
        type: "text",
        timestamp: new Date().toISOString(),
      }
    ];

    setMessagesMap(initialMap);
  }, [connectedUsers, currentUser.id]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesMap, activePartner]);

  const handleSendMessage = async (text: string, type: "text" | "voice" = "text", voiceMeta?: { duration: string; translation?: string }) => {
    if (!activePartner) return;

    const partnerId = activePartner.id;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: partnerId,
      content: text,
      type,
      timestamp: new Date().toISOString(),
      ...(type === "voice"
        ? {
            voiceUrl: "mock_voice.mp3",
            voiceDuration: voiceMeta?.duration || "0:04",
            transcript: text,
            translation: voiceMeta?.translation,
          }
        : {}),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [partnerId]: [...(prev[partnerId] || []), newMessage],
    }));

    setInputText("");

    // Simulate AI response or buddy response
    if (partnerId === "ngala-bot") {
      simulateNgalabotResponse(text);
    } else {
      simulatePartnerResponse(partnerId, text);
    }
  };

  const simulatePartnerResponse = (partnerId: string, userText: string) => {
    const partner = connectedUsers.find((u) => u.id === partnerId);
    if (!partner) return;

    setIsTranscribing("partner-typing");

    setTimeout(() => {
      setIsTranscribing(null);
      let replyContent = "That sounds fascinating! I look forward to discussing this more in our next live mentorship video session. Let's schedule one soon.";
      
      if (currentUser.role === "senior") {
        if (userText.toLowerCase().includes("money") || userText.toLowerCase().includes("pay") || userText.toLowerCase().includes("cash")) {
          replyContent = "I can definitely show you how to securely set up Mobile Money, Elder! Always remember to never share your 4-digit PIN with anyone, even agents.";
        } else if (userText.toLowerCase().includes("whatsapp") || userText.toLowerCase().includes("call") || userText.toLowerCase().includes("video")) {
          replyContent = "Excellent choice, Elder! Video calling on WhatsApp is easy. We will practice making calls during our scheduled session tomorrow.";
        }
      } else {
        if (userText.toLowerCase().includes("folklore") || userText.toLowerCase().includes("story") || userText.toLowerCase().includes("recipe")) {
          replyContent = "Thank you so much! That is exactly the heritage I want to preserve. Have you recorded it in the Audio story archive yet?";
        }
      }

      const partnerMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: partnerId,
        receiverId: currentUser.id,
        content: replyContent,
        type: "text",
        timestamp: new Date().toISOString(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), partnerMessage],
      }));
    }, 2000);
  };

  const simulateNgalabotResponse = async (userText: string) => {
    setIsTranscribing("bot-typing");

    try {
      // Direct call to Gemini AI Proxy on server
      const response = await fetch("/api/expert-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          userRole: currentUser.role,
          primaryLanguage: currentUser.language,
        }),
      });

      if (!response.ok) {
        throw new Error("Bot proxy failed");
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: "ngala-bot",
        receiverId: currentUser.id,
        content: data.reply || "I am reflecting on your request. Let us connect generationally.",
        type: "text",
        timestamp: new Date().toISOString(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        "ngala-bot": [...(prev["ngala-bot"] || []), botMessage],
      }));
    } catch (err) {
      console.warn("Using localized fallback reply for ChatBot Companion.", err);
      // Fallback
      let fallbackReply = "Let's explore that topic! Together Gen X and Gen Z can solve anything.";
      if (currentUser.role === "senior") {
        fallbackReply = "To set up a video call, click the 'Mentorship Sessions' tab, look for Malik's invitation, and press 'Join Live video'. Very simple and secure!";
      } else {
        fallbackReply = "Cameroon features over 250 local languages. EWONDO and DUALA are major Bantu languages. Elders say: 'Wisdom is like a baobab tree; single arms cannot embrace it.'";
      }

      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: "ngala-bot",
        receiverId: currentUser.id,
        content: fallbackReply,
        type: "text",
        timestamp: new Date().toISOString(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        "ngala-bot": [...(prev["ngala-bot"] || []), botMessage],
      }));
    } finally {
      setIsTranscribing(null);
    }
  };

  const handleSendVoicePreset = (presetIdx: number) => {
    const preset = CHAT_PRESETS[presetIdx];
    if (!preset) return;

    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      handleSendMessage(preset.original, "voice", {
        duration: "0:06",
        translation: preset.meaning,
      });
    }, 1500);
  };

  const currentMessages = activePartner ? messagesMap[activePartner.id] || [] : [];

  return (
    <div id="chat-messaging-container" className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden min-h-[500px]">
      {/* Partners List Side Panel (Cols = 4) */}
      <div className="md:col-span-4 border-r border-stone-100 p-4 bg-stone-50/50 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#7A1C16] font-bold uppercase mb-3 block">
            Connections Messaging
          </span>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {/* Real connections */}
            {connectedUsers.map((user) => {
              const isActive = activePartner?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setActivePartner(user)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                    isActive ? "bg-[#7A1C16] text-[#FDFBF7] shadow-sm" : "bg-white hover:bg-stone-100 text-stone-800 border border-stone-100"
                  }`}
                  style={{ gap: "12px" }}
                  type="button"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm leading-tight truncate">{user.name}</h4>
                    <span className={`text-[10px] font-mono leading-none ${isActive ? "text-amber-200" : "text-stone-400"}`}>
                      {user.role === "senior" ? `Elder (${user.language})` : `Youth (Mentor)`}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* AI Assistant companion connection card */}
            <button
              onClick={() => setActivePartner({
                id: "ngala-bot",
                name: "Ngalá (AI Sage)",
                email: "ngala@digitalroots.org",
                age: 35,
                role: "admin",
                language: currentUser.language,
                avatar: "bot_avatar",
                points: 9999,
                interests: ["African History", "Digital Literacy"]
              })}
              className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                activePartner?.id === "ngala-bot"
                  ? "bg-[#7A1C16] text-white shadow-sm"
                  : "bg-amber-50/70 hover:bg-amber-100 text-stone-800 border border-amber-100"
              }`}
              style={{ gap: "12px" }}
              type="button"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Ngalá (AI Companion)
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-300" />
                </h4>
                <span className="text-[10px] font-mono leading-none text-stone-400">
                  Dual Digital/Culture assistant
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Cameroon Anchor cultural reference card */}
        <div className="bg-[#7A1C16]/5 border border-[#7A1C16]/10 p-4 rounded-2xl hidden md:block">
          <h5 className="font-serif font-bold text-stone-800 text-xs mb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#7A1C16]" />
            Pillar 3: Dual Native Tags
          </h5>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Record voice notes in traditional tongues below to trigger auto phonetic translations using server-side Gemini.
          </p>
        </div>
      </div>

      {/* Main Conversational Messenger (Cols = 8) */}
      <div className="md:col-span-8 flex flex-col justify-between h-[520px]">
        {/* Active conversation header */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/20 flex items-center gap-3">
          {activePartner && activePartner.id !== "ngala-bot" ? (
            <>
              <img
                referrerPolicy="no-referrer"
                src={activePartner.avatar}
                alt={activePartner.name}
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
              />
              <div>
                <h3 className="font-bold text-stone-900 text-sm">{activePartner.name}</h3>
                <span className="text-xs text-stone-400">
                  {activePartner.role === "senior"
                    ? `Traditional knowledge keeper • Primary dialect: ${activePartner.language}`
                    : `Sleek Digital Mentor`}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Ngalá AI Helper</h3>
                <span className="text-xs text-stone-400">Dual Expert: Digital Smartphone navigation & West African Traditions</span>
              </div>
            </>
          )}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF9]">
          {currentMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl p-3.5 shadow-sm text-sm ${
                  isMe
                    ? "bg-[#7A1C16] text-[#FDFBF7] rounded-tr-none"
                    : "bg-white border border-stone-100 text-stone-800 rounded-tl-none"
                }`}>
                  {/* Handling Simulated Voice Messages */}
                  {msg.type === "voice" ? (
                    <div className="space-y-2 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? "bg-stone-900/10 text-[#FDFBF7]" : "bg-stone-100 text-[#7A1C16]"}`}>
                          <Play className="w-4 h-4 fill-current" />
                        </div>
                        <div className="flex-1 h-8 flex items-center gap-1">
                          {/* Simulated sound frequency bars */}
                          {[8, 14, 20, 10, 16, 22, 12, 18, 6, 12, 16, 8].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}px` }}
                              className={`w-0.5 rounded-full ${isMe ? "bg-[#FDFBF7]/80" : "bg-[#7A1C16]/80"}`}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-xs text-stone-400 shrink-0">{msg.voiceDuration || "0:04"}</span>
                      </div>

                      {/* Expandable Transcription Transcription */}
                      <div className={`p-2.5 rounded-xl text-xs space-y-1 ${isMe ? "bg-stone-900/15" : "bg-stone-50"}`}>
                        <div className="flex items-center gap-1 text-amber-600 font-mono text-[9px] uppercase tracking-wider font-bold">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Gemini Voice Transcription ({activePartner?.language || "Duala"})</span>
                        </div>
                        <p className={`font-mono italic ${isMe ? "text-[#FDFBF7]/90" : "text-stone-700"}`}>
                          “{msg.content}”
                        </p>
                        {msg.translation && (
                          <p className={`pt-1 border-t ${isMe ? "text-[#FDFBF7]/70 border-[#FDFBF7]/10" : "text-stone-500 border-stone-200/50"} text-[11px]`}>
                            <strong>Translation:</strong> {msg.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span className={`block text-[9px] font-mono mt-1 w-full text-right ${isMe ? "text-[#FDFBF7]/65" : "text-stone-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing simulation */}
          {isTranscribing && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-stone-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce delay-200"></div>
                </div>
                <span>
                  {isTranscribing === "partner-typing"
                    ? `${activePartner?.name} is thinking...`
                    : "Ngalá AI companion is transcribing..."}
                </span>
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>

        {/* Preset voice note simulation box */}
        <div className="px-4 py-2 bg-amber-50/50 border-t border-stone-100 flex gap-2 items-center overflow-x-auto">
          <span className="text-[10px] font-mono text-stone-500 shrink-0 uppercase">Voice Presets:</span>
          {CHAT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendVoicePreset(idx)}
              disabled={isRecordingVoice}
              className="text-[11px] bg-white hover:bg-stone-100 border border-stone-200 text-[#7A1C16] px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              type="button"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Send voice in {p.language}</span>
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputText.trim()) return;
            handleSendMessage(inputText, "text");
          }}
          className="p-4 bg-white border-t border-stone-100 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activePartner?.id === "ngala-bot" ? "Ask a technology or cultural question..." : "Type your message..."}
            className="flex-1 px-4 py-3 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7A1C16] text-sm text-stone-900 bg-stone-50 placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-[#7A1C16] text-white hover:bg-[#631410] disabled:opacity-50 transition-colors cursor-pointer"
            title="Send text message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
