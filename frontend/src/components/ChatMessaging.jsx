import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, Paperclip, Play, Send, Square, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatMessaging({
  currentUser,
  threads = [],
  messagesByThread = {},
  onSendMessage,
  onSendVoiceNote,
}) {
  const navigate = useNavigate();
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id || null);
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState(messagesByThread);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const listEndRef = useRef(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) || null;
  const currentMessages = activeThreadId ? localMessages[activeThreadId] || [] : [];

  useEffect(() => {
    setLocalMessages(messagesByThread);
  }, [messagesByThread]);

  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length, activeThreadId]);

  const addLocalMessage = (message) => {
    if (!activeThreadId) return;
    setLocalMessages((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), message],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = inputText.trim();
    if (!content || !activeThreadId) return;

    const message = {
      id: `local-${Date.now()}`,
      senderId: currentUser.id,
      content,
      type: "text",
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    addLocalMessage(message);
    setInputText("");
    await onSendMessage?.({ threadId: activeThreadId, content });
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !activeThreadId) return;
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
      const voiceUrl = URL.createObjectURL(blob);
      const message = {
        id: `voice-${Date.now()}`,
        senderId: currentUser.id,
        content: "Voice note",
        type: "voice",
        voiceUrl,
        status: "sending",
        createdAt: new Date().toISOString(),
      };
      addLocalMessage(message);
      await onSendVoiceNote?.({ threadId: activeThreadId, blob });
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] md:p-6">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col bg-white md:min-h-[760px] md:rounded-[2rem] md:border md:border-stone-200 md:shadow-sm">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="rounded-full p-2 hover:bg-stone-100" aria-label="Back to dashboard">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-stone-900">Messages</h1>
              <p className="text-[11px] text-stone-500">Real-time text and voice messaging</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">WebSocket ready</span>
        </header>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-12">
          <aside className={`${activeThread ? "hidden md:flex" : "flex"} flex-col border-r border-stone-200 bg-[#FBF9F6] md:col-span-4`}>
            <div className="border-b border-stone-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy">Threads</p>
            </div>

            {threads.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-brand-burgundy">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-sm font-bold text-stone-900">No conversations yet</h2>
                <p className="mt-2 max-w-xs text-xs leading-relaxed text-stone-500">
                  Connect this screen to your `/messages` threads from MongoDB. New accepted connections will appear here.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3">
                {threads.map((thread) => {
                  const isActive = thread.id === activeThreadId;
                  const title = thread.title || thread.participantName || "Conversation";
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`w-full rounded-2xl p-3 text-left transition-all ${
                        isActive ? "bg-brand-burgundy text-white" : "hover:bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold">{title}</p>
                      <p className={`mt-1 truncate text-[11px] ${isActive ? "text-white/70" : "text-stone-500"}`}>
                        {thread.lastMessage || "No messages yet"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className={`${activeThread ? "flex" : "hidden md:flex"} min-h-[70vh] flex-col md:col-span-8`}>
            {activeThread ? (
              <>
                <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3">
                  <button onClick={() => setActiveThreadId(null)} className="rounded-full p-2 hover:bg-stone-100 md:hidden" aria-label="Back to threads">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-burgundy text-sm font-bold text-white">
                    {(activeThread.title || activeThread.participantName || "C").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">{activeThread.title || activeThread.participantName || "Conversation"}</h2>
                    <p className="text-[11px] text-stone-500">Text, voice notes, and transcription pipeline</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-[#FDFBF9] p-4 pb-28 md:pb-4">
                  {currentMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <p className="text-sm font-bold text-stone-800">Start the conversation</p>
                      <p className="mt-2 max-w-xs text-xs text-stone-500">
                        Messages should persist through MongoDB collections for messages and threads.
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((message) => {
                      const isMine = message.senderId === currentUser.id;
                      return (
                        <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                            isMine ? "rounded-tr-md bg-brand-burgundy text-white" : "rounded-tl-md border border-stone-100 bg-white text-stone-800"
                          }`}>
                            {message.type === "voice" ? (
                              <div className="flex items-center gap-3">
                                <button className={`flex h-9 w-9 items-center justify-center rounded-full ${isMine ? "bg-white/15" : "bg-stone-100"}`}>
                                  <Play className="h-4 w-4 fill-current" />
                                </button>
                                <div>
                                  <p className="font-bold">Voice note</p>
                                  <p className={`text-[10px] ${isMine ? "text-white/65" : "text-stone-400"}`}>Transcription pending</p>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            )}
                            <span className={`mt-1 block text-right text-[9px] ${isMine ? "text-white/60" : "text-stone-400"}`}>
                              {message.status || "sent"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={listEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white p-3 md:static md:z-auto">
                  <div className="mx-auto flex max-w-6xl items-center gap-2">
                    <button type="button" className="rounded-full p-3 text-stone-500 hover:bg-stone-100" aria-label="Attach file">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <input
                      value={inputText}
                      onChange={(event) => setInputText(event.target.value)}
                      placeholder="Type a message..."
                      className="min-w-0 flex-1 rounded-full border border-stone-200 bg-[#FBF9F6] px-4 py-3 text-sm outline-none focus:border-brand-burgundy"
                    />
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`rounded-full p-3 text-white ${isRecording ? "bg-red-600" : "bg-stone-900"}`}
                      aria-label={isRecording ? "Stop recording" : "Record voice note"}
                    >
                      {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button type="submit" disabled={!inputText.trim()} className="rounded-full bg-brand-burgundy p-3 text-white disabled:opacity-40" aria-label="Send message">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden flex-1 items-center justify-center text-center md:flex">
                <div>
                  <h2 className="text-lg font-bold">Select a thread</h2>
                  <p className="mt-2 text-sm text-stone-500">Your real conversations will appear after `/messages` is connected.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
