import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, Paperclip, Play, Send, Square, Users, Image, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useLanguage } from "../context/LanguageContext";
import { getThreads, getMessages, sendMessage, uploadChatMedia } from "../services/apiService";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatMessaging({ currentUser }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const listEndRef = useRef(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) || null;

  // 1. Initialize WebSocket socket.io client
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to Chat WebSocket");
      setSocketConnected(true);
      if (currentUser?.id) {
        socket.emit("join", currentUser.id);
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Listen to real-time incoming messages
    socket.on("message", (msg) => {
      // If message is for the currently open thread, add to message list
      if (msg.senderId === activeThreadId || msg.receiverId === activeThreadId) {
        setMessages((prev) => [...prev, msg]);
      }
      
      // Refresh threads list to update last message preview
      fetchThreads();
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, activeThreadId]);

  // 2. Fetch all threads
  const fetchThreads = async () => {
    try {
      const data = await getThreads();
      if (data.success) {
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  // 3. Fetch messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      const fetchMessagesList = async () => {
        try {
          const data = await getMessages(activeThreadId);
          if (data.success) {
            setMessages(data.messages || []);
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };
      fetchMessagesList();
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  // 4. Scroll to bottom
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeThreadId]);

  // 5. Submit text message
  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = inputText.trim();
    if (!content || !activeThreadId) return;

    setInputText("");

    try {
      const data = await sendMessage(activeThreadId, content, "text");
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        fetchThreads();
      }
    } catch (err) {
      console.error("Error sending text message:", err);
    }
  };

  // 6. Handle Image attachment
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeThreadId) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result;
        // Upload to Cloudinary (or local fallback)
        const uploadResult = await uploadChatMedia(base64Data, "image");
        if (uploadResult.success) {
          // Send photo message
          const data = await sendMessage(activeThreadId, t('imageSent'), "image", uploadResult.url);
          if (data.success) {
            setMessages((prev) => [...prev, data.message]);
            fetchThreads();
          }
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  // 7. Audio recording & live Speech-to-Text Transcription
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !activeThreadId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        
        // Convert audio blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            setIsUploading(true);
            const base64Data = reader.result;
            // Upload audio to Cloudinary (or local fallback)
            const uploadResult = await uploadChatMedia(base64Data, "video");
            
            if (uploadResult.success) {
              // Save voice note with transcription
              const finalTranscript = liveTranscript.trim() || t('voiceNote');
              const data = await sendMessage(
                activeThreadId,
                finalTranscript,
                "voice",
                uploadResult.url,
                finalTranscript
              );

              if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                fetchThreads();
              }
            }
          } catch (err) {
            console.error("Error sending voice note:", err);
          } finally {
            setIsUploading(false);
            setLiveTranscript("");
          }
        };
      };

      // Set up speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === "fr" ? "fr-FR" : "en-US";

        recognition.onresult = (event) => {
          let currentText = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentText += event.results[i][0].transcript;
            }
          }
          if (currentText) {
            setLiveTranscript((prev) => prev + " " + currentText);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] md:p-6">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col bg-white md:min-h-[740px] md:rounded-[2rem] md:border md:border-stone-200 md:shadow-sm">

        {/* Chat header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:rounded-t-[2rem]" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="rounded-full p-3 hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Back to dashboard">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-base font-bold text-stone-900">{t('chatTitle')}</h1>
              <p className="text-[11px] text-stone-500">{t('chatSubtitle')}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${socketConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {socketConnected ? t('websocketReady') : "Connecting..."}
          </span>
        </header>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Threads list sidebar */}
          <aside className={`${activeThreadId ? "hidden md:flex" : "flex"} flex-col border-r border-stone-200 bg-[#FBF9F6] md:col-span-4`}>
            <div className="border-b border-stone-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy">{t('threads')}</p>
            </div>

            {threads.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-brand-burgundy">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-sm font-bold text-stone-900">{t('noConvYet')}</h2>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-stone-500">
                  {t('noConvYetSub')}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {threads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  const initials = thread.participantName.slice(0, 1).toUpperCase();
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`w-full rounded-2xl p-3 text-left transition-all flex items-center gap-3 ${
                        isActive ? "bg-brand-burgundy text-white shadow-md" : "hover:bg-white border border-transparent hover:border-stone-100"
                      }`}
                    >
                      <div className={`h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm ${isActive ? "bg-white/20 text-white" : ""}`}>
                        {thread.participantAvatar ? (
                          <img src={thread.participantAvatar} alt={thread.participantName} className="h-full w-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-bold truncate">{thread.participantName}</p>
                          <span className={`text-[9px] ${isActive ? "text-white/60" : "text-stone-400"}`}>
                            {thread.participantIdentity === 'Senior' ? t('senior') : t('youth')}
                          </span>
                        </div>
                        <p className={`mt-1 truncate text-xs ${isActive ? "text-white/70" : "text-stone-500"}`}>
                          {thread.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Active Chat Conversation page */}
          <section className={`${activeThreadId ? "flex" : "hidden md:flex"} min-h-[70vh] flex-col md:col-span-8 bg-[#FDFBF9]`}>
            {activeThread ? (
              <>
                <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 bg-white">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveThreadId(null)} className="rounded-full p-2 hover:bg-stone-100 md:hidden" aria-label="Back to threads">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-burgundy text-sm font-bold text-white flex items-center justify-center">
                      {activeThread.participantAvatar ? (
                        <img src={activeThread.participantAvatar} alt={activeThread.participantName} className="h-full w-full object-cover" />
                      ) : (
                        activeThread.participantName.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-stone-900">{activeThread.participantName}</h2>
                      <p className="text-[10px] text-stone-500">
                        {activeThread.participantIdentity === 'Senior' ? t('senior') : t('youth')} • {activeThread.participantLanguage === 'fr' ? 'Français' : 'English'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages display */}
                <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-28 md:pb-4">
                  {messages.map((message) => {
                    const isMine = message.senderId === currentUser.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                          isMine ? "rounded-tr-md bg-brand-burgundy text-white" : "rounded-tl-md border border-stone-100 bg-white text-stone-800"
                        }`}>
                          {message.type === "voice" ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <audio src={message.mediaUrl} controls className="max-w-full h-10 accent-brand-burgundy" />
                              </div>
                              {message.transcription && (
                                <p className={`text-xs italic leading-relaxed pt-1.5 border-t ${isMine ? "border-white/10 text-white/80" : "border-stone-100 text-stone-600"}`}>
                                  "{message.transcription}"
                                </p>
                              )}
                            </div>
                          ) : message.type === "image" ? (
                            <div className="space-y-1">
                              <img src={message.mediaUrl} alt="Chat attachment" className="rounded-2xl max-w-full max-h-60 object-cover cursor-pointer hover:opacity-95" />
                              {message.content && message.content !== t('imageSent') && (
                                <p className="pt-1">{message.content}</p>
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          )}
                          <span className={`mt-1 block text-right text-[8px] uppercase tracking-wider ${isMine ? "text-white/60" : "text-stone-400"}`}>
                            {t('sent')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={listEndRef} />
                </div>

                {/* Live recording preview bar */}
                {isRecording && (
                  <div className="bg-red-50 border-t border-red-100 px-6 py-3 flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3 text-red-700">
                      <Volume2 className="h-4 w-4 animate-bounce" />
                      <span className="text-xs font-semibold">{t('recordVoice')}...</span>
                    </div>
                    {liveTranscript && (
                      <p className="text-xs italic text-red-900 truncate max-w-md flex-1">
                        "{liveTranscript}"
                      </p>
                    )}
                    <button onClick={stopRecording} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full font-bold">
                      {t('stopRecording')}
                    </button>
                  </div>
                )}

                {/* Chat input controller */}
                <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white p-3 md:static md:z-auto" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                  <div className="mx-auto flex max-w-6xl items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full p-3 text-stone-500 hover:bg-stone-100 disabled:opacity-40 min-h-[48px] min-w-[48px] flex items-center justify-center"
                      title={t('attachFile')}
                    >
                      <Paperclip className="h-6 w-6" />
                    </button>

                    <input
                      value={inputText}
                      onChange={(event) => setInputText(event.target.value)}
                      placeholder={t('typeMessage')}
                      disabled={isRecording || isUploading}
                      className="min-w-0 flex-1 rounded-full border border-stone-200 bg-[#FBF9F6] px-4 py-3.5 text-base outline-none focus:border-brand-burgundy disabled:opacity-50 min-h-[48px]"
                    />

                    {!inputText.trim() && (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isUploading}
                        className={`rounded-full p-3 text-white transition disabled:opacity-50 min-h-[48px] min-w-[48px] flex items-center justify-center ${isRecording ? "bg-red-600" : "bg-stone-900 hover:bg-stone-800"}`}
                        title={isRecording ? t('stopRecording') : t('recordVoice')}
                      >
                        {isRecording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-6 w-6" />}
                      </button>
                    )}

                    {(inputText.trim() || isUploading) && (
                      <button
                        type="submit"
                        disabled={!inputText.trim() || isUploading}
                        className="rounded-full bg-brand-burgundy p-3 text-white disabled:opacity-40 hover:bg-opacity-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                      >
                        <Send className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden flex-1 items-center justify-center text-center md:flex">
                <div className="p-8">
                  <div className="h-16 w-16 bg-[#FBF9F6] rounded-full flex items-center justify-center mx-auto text-brand-burgundy mb-4 border border-stone-100">
                    <Users className="h-6 w-6" />
                  </div>
                  <h2 className="text-base font-bold text-stone-800">{t('selectThread')}</h2>
                  <p className="mt-2 text-xs text-stone-500 max-w-xs mx-auto">{t('selectThreadSub')}</p>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
