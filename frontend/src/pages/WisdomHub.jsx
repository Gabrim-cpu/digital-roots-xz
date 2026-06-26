import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, MessageCircle, BookOpen, Users, Settings as SettingsIcon, LogOut, Search, Bell, HelpCircle, Plus, Diamond, Send, Mic, Paperclip, Smile, Phone, Video, MoreVertical, Square, Play, Check, UserPlus, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getThreads, getMessages, sendMessage, uploadChatMedia, getRecommendations, getAllUsers, requestConnection, getPendingRequests, acceptConnection, rejectConnection, getAcceptedConnections, getFeed, createPost } from '../services/apiService';
import { updateProfile } from '../services/authService';
import NotificationBell from '../components/NotificationBell';
import { io } from 'socket.io-client';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';
import logoWhite from '../Assets/logo_blanc-removebg-preview (1).png';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WisdomHub() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  // When set, the Messages tab opens this specific connection's conversation.
  const [chatTarget, setChatTarget] = useState(null);

  const openChatWith = (user) => {
    setChatTarget(user);
    setActiveTab('messages');
  };

  const appUser = auth?.appUser || {};
  const userName = appUser?.displayName || appUser?.display_name || 'User';
  const userEmail = appUser?.email || '';
  const userPoints = appUser?.root_points ?? 0;
  const userAvatar = appUser?.avatar_url || appUser?.photoURL || null;

  // Re-sync the profile from the backend on mount so name/avatar/points are current
  useEffect(() => {
    auth?.refreshUser?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
      navigate('/login');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'wisdom', label: 'The Archive', icon: BookOpen },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[#FBF9F8]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-0'} bg-white border-r border-gray-100 transition-all duration-300 overflow-hidden flex flex-col flex-shrink-0`}>
        <div className="px-5 py-5 flex items-center gap-2">
          <img src={logoXZ} alt="XZ" className="w-7 h-7" />
          <div>
            <h1 className="text-base font-serif font-bold text-brand-burgundy leading-none">The Archive</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Bridging Generations</p>
          </div>
        </div>

        <nav className="flex-1 py-2 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  active
                    ? 'bg-[#FBF1F0] text-brand-burgundy font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3">
          <button
            onClick={() => setActiveTab('mentorship')}
            className="w-full flex items-center justify-center gap-2 bg-brand-burgundy text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            New Connection
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <div className="bg-[#FBF9F8] px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-100/50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white rounded-lg transition-colors lg:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search wisdom..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 shadow-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#FBF1F0] text-brand-burgundy px-2.5 py-1 rounded-full font-semibold text-xs">
              <Diamond className="w-3 h-3 fill-current" />
              {userPoints.toLocaleString()}
            </div>
            <NotificationBell />
            <button className="p-1.5 hover:bg-white rounded-full text-gray-400"><HelpCircle className="w-4 h-4" /></button>
            <button onClick={() => setActiveTab('settings')} className="w-8 h-8 bg-brand-burgundy rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName?.[0]?.toUpperCase() || 'U'
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <div className="overflow-auto h-full"><HomeContent userName={userName} userAvatar={userAvatar} currentUser={appUser} /></div>}
          {activeTab === 'wisdom' && <div className="overflow-auto h-full"><ArchiveContent /></div>}
          {activeTab === 'messages' && <MessagesContent currentUser={appUser} chatTarget={chatTarget} onConsumeTarget={() => setChatTarget(null)} />}
          {activeTab === 'settings' && <div className="overflow-auto h-full"><SettingsContent userName={userName} userEmail={userEmail} appUser={appUser} onLogout={handleLogout} language={language} changeLanguage={changeLanguage} auth={auth} /></div>}
          {activeTab === 'mentorship' && <div className="overflow-auto h-full"><MentorshipContent currentUser={appUser} onOpenChat={openChatWith} /></div>}
        </div>
      </div>
    </div>
  );
}

/* ============ MESSAGES TAB ============ */
function MessagesContent({ currentUser, chatTarget, onConsumeTarget }) {
  const { t, language } = useLanguage();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  // Holds the participant info for a conversation opened from outside (a
  // connection card / the new-chat picker) so the thread renders immediately
  // even before getThreads has it in the list.
  const [targetInfo, setTargetInfo] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const listEndRef = useRef(null);
  // Kept in sync each render so the single long-lived socket listener can read
  // the currently-open thread without re-subscribing on every thread switch.
  const activeThreadIdRef = useRef(null);

  const activeThread =
    threads.find((th) => th.id === activeThreadId) ||
    (targetInfo && targetInfo.id === activeThreadId ? targetInfo : null);

  activeThreadIdRef.current = activeThreadId;

  // Open a specific conversation when asked from outside (connection card / picker).
  useEffect(() => {
    if (chatTarget?.id) {
      setActiveThreadId(chatTarget.id);
      setTargetInfo(chatTarget);
      onConsumeTarget?.();
    }
  }, [chatTarget, onConsumeTarget]);

  // Connect the socket once per user (not per thread switch). The listener reads
  // the open thread via a ref and dedupes by message id so live delivery is safe.
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join', currentUser.id);
    });
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('message', (msg) => {
      const otherId = activeThreadIdRef.current;
      if (msg.senderId === otherId || msg.receiverId === otherId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
      fetchThreads();
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const fetchThreads = useCallback(async () => {
    try {
      const data = await getThreads();
      if (data.success) setThreads(data.threads || []);
    } catch (err) { console.error('Error fetching threads:', err); }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  useEffect(() => {
    if (!activeThreadId) { setMessages([]); return; }
    (async () => {
      try {
        const data = await getMessages(activeThreadId);
        if (data.success) setMessages(data.messages || []);
      } catch (err) { console.error('Error fetching messages:', err); }
    })();
  }, [activeThreadId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || !activeThreadId) return;
    setInputText('');
    try {
      const data = await sendMessage(activeThreadId, content, 'text');
      if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
    } catch (err) { console.error('Send error:', err); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeThreadId) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const uploadResult = await uploadChatMedia(reader.result, 'image');
        if (uploadResult.success) {
          const data = await sendMessage(activeThreadId, 'Image', 'image', uploadResult.url);
          if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
        }
      } catch (err) { console.error('Upload error:', err); }
      finally { setIsUploading(false); }
    };
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !activeThreadId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) recordedChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            setIsUploading(true);
            const uploadResult = await uploadChatMedia(reader.result, 'video');
            if (uploadResult.success) {
              const transcript = liveTranscript.trim() || 'Voice note';
              const data = await sendMessage(activeThreadId, transcript, 'voice', uploadResult.url, transcript);
              if (data.success) { setMessages((prev) => [...prev, data.message]); fetchThreads(); }
            }
          } catch (err) { console.error('Voice error:', err); }
          finally { setIsUploading(false); setLiveTranscript(''); }
        };
      };
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; recognition.interimResults = true;
        recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
        recognition.onresult = (event) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) text += event.results[i][0].transcript;
          }
          if (text) setLiveTranscript((prev) => prev + ' ' + text);
        };
        recognitionRef.current = recognition;
        recognition.start();
      }
      recorder.start();
      setIsRecording(true);
    } catch (err) { console.error('Mic error:', err); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return formatTime(dateStr);
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full bg-white">
      {/* Conversation List */}
      <div className={`${activeThreadId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100 flex-shrink-0`}>
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Conversations</h2>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search wisdom..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 opacity-30 mb-3" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Connect with mentors to start chatting</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-l-4 ${
                  activeThreadId === thread.id
                    ? 'bg-[#FBF1F0] border-brand-burgundy'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                  {thread.participantAvatar ? (
                    <img src={thread.participantAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    thread.participantName?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900 truncate">{thread.participantName}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(thread.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{thread.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Thread */}
      {activeThreadId && activeThread ? (
        <>
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveThreadId(null)} className="md:hidden p-1"><X className="w-5 h-5" /></button>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm overflow-hidden">
                  {activeThread.participantAvatar ? (
                    <img src={activeThread.participantAvatar} alt="" className="w-full h-full object-cover" />
                  ) : activeThread.participantName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeThread.participantName}</h3>
                  <p className="text-[10px] text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Last seen: 5 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Phone className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Video className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-5 space-y-4 bg-[#FEFCFB]">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? 'bg-brand-burgundy text-white rounded-br-sm'
                        : 'bg-[#F4F2F1] text-gray-900 rounded-bl-sm'
                    }`}>
                      {msg.type === 'image' && msg.mediaUrl && (
                        <img src={msg.mediaUrl} alt="Shared" className="rounded-lg mb-2 max-w-full" />
                      )}
                      {msg.type === 'voice' && msg.mediaUrl && (
                        <div className="flex items-center gap-2 mb-1">
                          <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isMine ? 'bg-white/20' : 'bg-brand-burgundy/10'}`}>
                            <Play className={`w-4 h-4 ${isMine ? 'text-white' : 'text-brand-burgundy'}`} />
                          </button>
                          <div className="flex-1 h-6 flex items-center gap-0.5">
                            {[...Array(20)].map((_, j) => (
                              <div key={j} className={`w-1 rounded-full ${isMine ? 'bg-white/40' : 'bg-brand-burgundy/20'}`} style={{ height: `${Math.random() * 100}%` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-sm font-serif leading-relaxed">{msg.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                        {isMine && <span className="text-[10px]">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={listEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="w-5 h-5" /></button>
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600"><Smile className="w-5 h-5" /></button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-h-[44px]"
                disabled={isUploading}
              />
              {isRecording ? (
                <button type="button" onClick={stopRecording} className="p-2.5 bg-red-500 text-white rounded-full"><Square className="w-4 h-4" /></button>
              ) : (
                <button type="button" onClick={startRecording} className="p-2 text-gray-400 hover:text-gray-600"><Mic className="w-5 h-5" /></button>
              )}
              <button type="submit" disabled={!inputText.trim() || isUploading} className="p-2.5 bg-brand-burgundy text-white rounded-full disabled:opacity-40 hover:bg-opacity-90 transition-all"><Send className="w-4 h-4" /></button>
            </form>
          </div>

          {/* User Profile Panel (desktop) */}
          <div className="hidden xl:flex flex-col w-64 border-l border-gray-100 p-5 items-center flex-shrink-0 bg-[#FEFCFB]">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden mb-4">
              {activeThread.participantAvatar ? (
                <img src={activeThread.participantAvatar} alt="" className="w-full h-full object-cover" />
              ) : activeThread.participantName?.[0]?.toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">{activeThread.participantName}</h3>
            <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide mt-1">Archive Member</p>

            <div className="w-full mt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {['Gardening', 'Philosophy', 'Classic Literature'].map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{tag}</span>
                ))}
              </div>
            </div>

            <div className="w-full mt-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shared Media</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
                ))}
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-bold">+12</div>
              </div>
            </div>

            <button className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              Report Connection
            </button>
          </div>
        </>
      ) : (
        !activeThreadId && threads.length > 0 && (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 opacity-20 mx-auto mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your connections to start chatting</p>
            </div>
          </div>
        )
      )}

      {/* Floating "new conversation" button + connection picker.
          Hidden while a conversation is open so it never overlaps the composer. */}
      {!activeThreadId && (
        <>
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-burgundy text-white shadow-lg flex items-center justify-center hover:bg-opacity-90 active:scale-95 transition-all"
            aria-label="New conversation"
          >
            <Plus className="w-6 h-6" />
          </button>

          {showPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
              <div className="fixed bottom-24 right-6 z-50 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">
                  Start a conversation
                </div>
                <div className="max-h-80 overflow-auto">
                  {threads.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                      No connections yet. Add some from Mentorship → Discover.
                    </div>
                  ) : (
                    threads.map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => {
                          setActiveThreadId(conn.id);
                          setTargetInfo(conn);
                          setShowPicker(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs overflow-hidden flex-shrink-0">
                          {conn.participantAvatar ? (
                            <img src={conn.participantAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            conn.participantName?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{conn.participantName}</p>
                          {conn.participantIdentity && (
                            <p className="text-[11px] text-brand-burgundy font-semibold uppercase tracking-wide">
                              {conn.participantIdentity}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ============ HOME TAB ============ */
function HomeContent({ userName, userAvatar, currentUser }) {
  const firstName = userName?.split(' ')[0] || 'Friend';
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [composer, setComposer] = useState('');
  const [publishing, setPublishing] = useState(false);

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const data = await getFeed();
      setFeed(data.feed || []);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handlePublish = async () => {
    const body = composer.trim();
    if (!body || publishing) return;
    setPublishing(true);
    try {
      const data = await createPost(body);
      if (data.post) setFeed((prev) => [data.post, ...prev]);
      setComposer('');
    } catch (err) {
      console.error('Error publishing post:', err);
      setError('Could not publish your post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6 pt-4">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-burgundy flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
          {userAvatar ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" /> : firstName[0]?.toUpperCase()}
        </div>
        <div className="space-y-0.5">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-400 italic font-serif text-sm">"Wisdom is the reward you get for a lifetime of listening."</p>
        </div>
      </div>

      {/* Composer */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden flex-shrink-0">
            {userAvatar ? <img src={userAvatar} alt="" className="w-full h-full object-cover" /> : firstName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Share a story, lesson, or reflection..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-[#FBF9F8] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePublish}
                disabled={!composer.trim() || publishing}
                className="bg-brand-burgundy text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px] disabled:opacity-40"
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-burgundy/20 border-t-brand-burgundy rounded-full animate-spin" />
        </div>
      ) : error ? (
        <EmptyState icon={X} title="Couldn't load the feed" subtitle={error} action={{ label: 'Try again', onClick: loadFeed }} />
      ) : feed.length === 0 ? (
        <EmptyState icon={BookOpen} title="No stories yet" subtitle="Be the first to share a story or lesson with the community using the box above." />
      ) : (
        <div className="space-y-4">
          {feed.map((post) => {
            const isMine = post.author_id === currentUser?.id;
            return (
              <article key={post.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={post.author_name} avatar={post.avatar_url} size="w-10 h-10" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {post.author_name || 'Community member'}{isMine && <span className="text-gray-400 font-normal"> · You</span>}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {post.identity || 'Member'} · {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 font-serif leading-relaxed whitespace-pre-wrap mt-3">{post.body || post.title}</p>
                {post.media_url && (
                  <div className="mt-3">
                    {post.type === 'audio_archive' || post.type === 'voice' ? (
                      <audio src={post.media_url} controls className="w-full" />
                    ) : (
                      <img src={post.media_url} alt="" className="rounded-xl max-h-[420px] w-full object-cover" />
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ THE ARCHIVE TAB (Wisdom Hub) ============ */
function ArchiveContent() {
  const [activeFilter, setActiveFilter] = useState('All Wisdom');
  const [selectedPost, setSelectedPost] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  const [viewMode, setViewMode] = useState('explore');

  const filters = ['All Wisdom', 'Resilience', 'Philosophy', 'Career Legacy', 'Relationships', 'Oral History'];

  const posts = [
    {
      id: 1,
      type: 'video',
      tag: 'VIDEO INSIGHT',
      duration: '12:48',
      title: 'Crafting Meaningful Work',
      excerpt: 'Arthur McAllister shares how seventy years of woodturning taught him more about life than any book could ever offer.',
      author: 'Arthur McAllister',
      authorAvatar: null,
      postedAt: 'Posted 2 days ago',
      category: 'Career Legacy',
      fullContent: `I began in a small schoolhouse in the valley, where the air always smelled of cedar and old paper. Back then, I taught my job was to speak—to pour knowledge into the quiet vessels sitting in front of me. I didn't realise that the most profound lessons would come from the silence between my sentences.\n\nOver five decades, the faces changed, yet the fundamental need remained the same: to be heard. Modern teaching talks about "engagement" and "active participation," but, in my experience, the most important skill a teacher develops is patience—the patience to let understanding grow at its own pace.`,
      images: ['📸', '🖼️'],
      reflections: [
        { id: 1, author: 'Eleanor Chen', avatar: null, text: 'This resonates so deeply with my experience in graduate school right now. We\'re so focused on the "doing" that we forget the beauty of just being with knowledge.', likes: 23, time: '2 hours ago' },
        { id: 2, author: 'Jacob Santos', text: 'The National Pastime — I\'m writing a book about this. It\'s a beautiful way to describe outdoor creativity.', likes: 8, time: '5 hours ago' },
      ],
    },
    {
      id: 2,
      type: 'audio',
      tag: 'AUDIO',
      duration: '8 MIN',
      title: 'The Sound of Resilience',
      excerpt: 'Short reflections on overcoming economic hardship during the late 70s and what it teaches us about today\'s volatile markets.',
      author: 'Margaret Thorne',
      authorAvatar: null,
      postedAt: 'Posted 5 days ago',
      category: 'Resilience',
      fullContent: 'Resilience isn\'t about being tough. It\'s about knowing when to bend so you don\'t break. In 1978, when my husband lost his job and we had four children to feed, I didn\'t have the luxury of falling apart. I learned that survival is creative — you find ways that nobody teaches you.',
      reflections: [],
    },
    {
      id: 3,
      type: 'article',
      tag: 'PHILOSOPHY',
      title: 'The Vanishing Art of Letter Writing',
      excerpt: 'Why tactile communication matters in a digital world.',
      author: 'Elena Rossi',
      authorAvatar: null,
      postedAt: '1 week ago',
      category: 'Philosophy',
      fullContent: 'When I was young, a letter was an event. The weight of the envelope, the scent of the ink, the careful handwriting — each letter was a small gift of someone\'s time. Today we send hundreds of messages without thinking. I wonder: have we gained speed but lost meaning?',
      reflections: [],
    },
  ];

  const featuredMentor = {
    name: 'Dr. Silas Vance',
    title: 'Historian & Life Mentor',
    bio: 'Specialising at the intersection of traditional ethics and modern tech.',
  };

  if (selectedPost) {
    return <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} reflectionText={reflectionText} setReflectionText={setReflectionText} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pt-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-4 text-sm">
          <button onClick={() => setViewMode('explore')} className={`font-semibold transition-colors ${viewMode === 'explore' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Explore</button>
          <button onClick={() => setViewMode('trending')} className={`font-semibold transition-colors ${viewMode === 'trending' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Trending</button>
        </div>
      </div>

      {/* Spotlight Hero */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy mb-3">Archive Spotlight</p>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 leading-tight">
            The Art of{' '}
            <span className="text-brand-burgundy italic">Patience</span>{' '}
            in a Digital Age
          </h1>
        </div>
        <div className="space-y-3 max-w-xs">
          <p className="text-sm text-gray-500 leading-relaxed">
            Elder connections reveal how silence and deliberate action create more impact than the frantic pace of the modern web. Explore our curated audio series.
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-brand-burgundy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all min-h-[44px]">
              <Play className="w-4 h-4 fill-current" /> Listen to Story
            </button>
            <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Read Transcript
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === f
                ? 'bg-brand-burgundy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Post Card */}
        <button onClick={() => setSelectedPost(posts[0])} className="text-left group">
          <div className="bg-gradient-to-br from-gray-800 to-gray-600 rounded-2xl p-6 text-white relative overflow-hidden min-h-[240px] flex flex-col justify-end">
            <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{posts[0].tag} · {posts[0].duration}</span>
            <h3 className="text-2xl font-serif font-bold group-hover:text-white/90 transition-colors">{posts[0].title}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{posts[0].excerpt}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">{posts[0].author[0]}</div>
            <span className="text-sm font-semibold text-gray-900">{posts[0].author}</span>
            <span className="text-xs text-gray-400 ml-auto">{posts[0].postedAt}</span>
          </div>
        </button>

        {/* Audio Card */}
        <button onClick={() => setSelectedPost(posts[1])} className="text-left group bg-[#F4F2F1] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{posts[1].tag} · {posts[1].duration}</p>
            <h3 className="text-xl font-serif font-bold text-gray-900 mt-2 group-hover:text-brand-burgundy transition-colors">{posts[1].title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{posts[1].excerpt}</p>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 h-8">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="w-1 bg-brand-burgundy/30 rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
              ))}
            </div>
            <div className="flex items-center justify-end mt-2">
              <span className="text-xs text-brand-burgundy font-semibold">PLAY</span>
            </div>
          </div>
        </button>
      </div>

      {/* Quote + Article + Mentor Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quote Card */}
        <div className="bg-brand-burgundy/10 rounded-2xl p-6 flex flex-col justify-center">
          <MessageCircle className="w-8 h-8 text-brand-burgundy/40 mb-4" />
          <blockquote className="text-xl font-serif italic text-gray-800 leading-relaxed">
            "Do not seek to follow in the footsteps of the men of old; seek what they sought."
          </blockquote>
          <p className="text-sm text-gray-500 mt-4 font-semibold">— Matsuo Bashō</p>
        </div>

        {/* Article Card */}
        <button onClick={() => setSelectedPost(posts[2])} className="text-left group bg-[#F4F2F1] rounded-2xl p-6">
          <div className="w-full h-28 bg-gradient-to-br from-gray-300 to-gray-200 rounded-xl mb-4 flex items-center justify-center text-4xl">📝</div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{posts[2].tag}</p>
          <h3 className="text-lg font-serif font-bold text-gray-900 mt-1 group-hover:text-brand-burgundy transition-colors">{posts[2].title}</h3>
          <p className="text-xs text-gray-500 mt-1">{posts[2].excerpt}</p>
          <p className="text-[10px] text-gray-400 mt-2">12 MIN READ</p>
        </button>

        {/* Featured Mentor */}
        <div className="bg-[#F4F2F1] rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mb-3 flex items-center justify-center text-2xl font-bold text-gray-500">SV</div>
          <h3 className="font-bold text-gray-900">{featuredMentor.name}</h3>
          <p className="text-xs text-brand-burgundy font-semibold">{featuredMentor.title}</p>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{featuredMentor.bio}</p>
          <button className="mt-4 px-5 py-2 border border-brand-burgundy text-brand-burgundy rounded-xl text-sm font-semibold hover:bg-brand-burgundy hover:text-white transition-all">
            View Mentor Profile
          </button>
        </div>
      </div>

      {/* Newsletter / Deepen Connection */}
      <div className="bg-[#F4F2F1] rounded-2xl p-8 text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Deepen Your Connection</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Join 12,000+ members who receive a weekly digest of intergenerational wisdom directly in their inbox.
          </p>
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          <input type="email" placeholder="Enter your email address" className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 min-w-[220px]" />
          <button className="px-6 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all">Subscribe</button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 py-4">
        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">EH</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Evelyn Harper</p>
          <p className="text-[10px] text-brand-burgundy">Master Mentor</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-300 uppercase tracking-widest pb-4">
        2026 All intergenerational stories · Form V 0.97
      </p>
    </div>
  );
}

/* ============ POST DETAIL VIEW ============ */
function PostDetail({ post, onBack, reflectionText, setReflectionText }) {
  const [liked, setLiked] = useState(false);
  const [thoughtful, setThoughtful] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-6 pt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Post Detail</h2>
      </div>

      {/* Hero Image */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-500 rounded-2xl overflow-hidden min-h-[280px] flex items-end p-6 text-white relative">
        <div className="absolute top-4 left-4">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-burgundy px-3 py-1 rounded-full">{post.tag}</span>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-1">{post.author} · {post.postedAt}</p>
          <h1 className="text-3xl font-serif font-bold leading-tight">{post.title}</h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
            liked ? 'bg-brand-burgundy text-white border-brand-burgundy' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          ❤️ Like
        </button>
        <button
          onClick={() => setThoughtful(!thoughtful)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
            thoughtful ? 'bg-brand-burgundy text-white border-brand-burgundy' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          💭 Think
        </button>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        {post.fullContent?.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-gray-700 font-serif leading-[1.9] text-base mb-6">{paragraph}</p>
        ))}
      </div>

      {/* Pull Quote */}
      <div className="border-l-4 border-brand-burgundy pl-6 py-4 my-8">
        <p className="text-xl font-serif italic text-gray-800 leading-relaxed">
          "True mentorship isn't the passing of a torch; it's the quiet act of holding a mirror so someone else can see their own light."
        </p>
      </div>

      {/* Reflections */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Reflections <span className="text-gray-400 font-normal text-sm">({post.reflections?.length || 0})</span></h3>

        {/* Add Reflection */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Share your reflections..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20"
          />
          <button className="px-5 py-2.5 bg-brand-burgundy text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-all">
            Post Reflection
          </button>
        </div>

        {/* Reflection List */}
        <div className="space-y-5">
          {(post.reflections || []).map((r) => (
            <div key={r.id} className="flex gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                {r.author?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.author}</span>
                  <span className="text-xs text-gray-400">{r.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <button className="hover:text-brand-burgundy transition-colors">♥ {r.likes}</button>
                  <button className="hover:text-brand-burgundy transition-colors">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {post.reflections?.length > 2 && (
          <button className="text-sm text-brand-burgundy font-semibold mt-4 hover:underline">
            Load more reflections ↓
          </button>
        )}
      </div>
    </div>
  );
}

/* ============ SETTINGS TAB ============ */
function SettingsContent({ userName, userEmail, appUser, onLogout, language, changeLanguage, auth }) {
  const [profile, setProfile] = useState({
    displayName: userName || '',
    email: userEmail || '',
    bio: appUser?.bio || '',
    location: appUser?.location || '',
    identity: appUser?.identity || 'Senior',
    age: appUser?.age || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        display_name: profile.displayName,
        bio: profile.bio,
        identity: profile.identity,
        age: profile.age ? parseInt(profile.age, 10) : null,
        language,
      });
      setSaved(true);
      if (auth?.refreshUser) auth.refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pt-4">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Settings & Profile</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-burgundy flex items-center justify-center text-white font-bold text-2xl overflow-hidden flex-shrink-0">
            {appUser?.avatar_url ? (
              <img src={appUser.avatar_url} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              profile.displayName?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile.displayName || 'Your name'}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wide text-brand-burgundy">{profile.identity}</span>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Display Name</label>
            <input type="text" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={profile.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 min-h-[44px]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell others about yourself..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
              <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="e.g. 65" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[44px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Identity</label>
              <div className="flex gap-3 mt-1">
                {['Senior', 'Youth'].map((id) => (
                  <button key={id} onClick={() => setProfile({ ...profile, identity: id })} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${profile.identity === id ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{id}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full bg-brand-burgundy text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all min-h-[48px] disabled:opacity-50">
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-500">Choose your preferred language</p>
            </div>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-gray-100 text-gray-700 text-sm rounded-xl px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 min-h-[40px]"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          {[
            { label: 'Email notifications', desc: 'Get updates on new matches and messages' },
            { label: 'Public profile', desc: 'Let others see your profile' },
            { label: 'Allow mentorship requests', desc: 'Accept requests from potential mentees' },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
              <div><p className="font-medium text-gray-900">{pref.label}</p><p className="text-sm text-gray-500">{pref.desc}</p></div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-burgundy"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]">
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}

/* ============ MENTORSHIP TAB ============ */
function MentorshipContent({ currentUser, onOpenChat }) {
  const [view, setView] = useState('discover'); // discover | requests | circle
  const [filter, setFilter] = useState('recommended'); // recommended | Senior | Youth | All
  const [recommendations, setRecommendations] = useState([]);
  const [people, setPeople] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requestedIds, setRequestedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getPendingRequests();
      setPendingRequests(data.requests || []);
    } catch (err) { console.error('Error fetching requests:', err); }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const data = await getAcceptedConnections();
      setConnections(data.connections || []);
    } catch (err) { console.error('Error fetching connections:', err); }
  }, []);

  // Initial load: requests + connections + recommendations
  useEffect(() => {
    fetchRequests();
    fetchConnections();
  }, [fetchRequests, fetchConnections]);

  // Load the discover list whenever the filter changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (filter === 'recommended') {
          const data = await getRecommendations();
          if (!cancelled) setRecommendations(data.recommendations || data.matches || []);
        } else {
          const identity = filter === 'All' ? null : filter;
          const data = await getAllUsers(identity);
          if (!cancelled) setPeople(data.users || []);
        }
      } catch (err) {
        console.error('Error loading people:', err);
        if (!cancelled) setError("We couldn't reach the server. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filter, reloadKey]);

  const handleRequest = async (userId) => {
    setRequestedIds((prev) => new Set(prev).add(userId));
    try {
      await requestConnection(userId);
    } catch (err) {
      console.error('Error requesting connection:', err);
      // Roll back the optimistic update on failure
      setRequestedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAccept = async (connectionId) => {
    setPendingRequests((prev) => prev.filter((r) => r.connection_id !== connectionId));
    try {
      await acceptConnection(connectionId);
      fetchConnections();
    } catch (err) {
      console.error('Error accepting connection:', err);
      fetchRequests();
    }
  };

  const handleReject = async (connectionId) => {
    setPendingRequests((prev) => prev.filter((r) => r.connection_id !== connectionId));
    try {
      await rejectConnection(connectionId);
    } catch (err) {
      console.error('Error rejecting connection:', err);
      fetchRequests();
    }
  };

  const sourceList = filter === 'recommended' ? recommendations : people;
  const query = search.trim().toLowerCase();
  const discoverList = !query
    ? sourceList
    : sourceList.filter((p) => (p.display_name || '').toLowerCase().includes(query));

  const filters = [
    { id: 'recommended', label: 'Recommended', icon: Sparkles },
    { id: 'Senior', label: 'Seniors', icon: Users },
    { id: 'Youth', label: 'Youth', icon: Users },
    { id: 'All', label: 'Everyone', icon: Users },
  ];

  const tabs = [
    { id: 'discover', label: 'Discover' },
    { id: 'requests', label: 'Requests', count: pendingRequests.length },
    { id: 'circle', label: 'My Circle', count: connections.length },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 pt-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold text-gray-900">Mentorship</h1>
        <p className="text-gray-400 italic font-serif mt-1">Find a mentor, share your wisdom, build connections across generations.</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
              view === tab.id ? 'text-brand-burgundy' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-brand-burgundy text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {tab.count}
                </span>
              )}
            </span>
            {view === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-burgundy rounded-full" />}
          </button>
        ))}
      </div>

      {/* ===== DISCOVER ===== */}
      {view === 'discover' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    filter === f.id ? 'bg-brand-burgundy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-burgundy/20 shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-burgundy/20 border-t-brand-burgundy rounded-full animate-spin" />
            </div>
          ) : error ? (
            <EmptyState
              icon={X}
              title="Couldn't load people"
              subtitle={error}
              action={{ label: 'Try again', onClick: () => setReloadKey((k) => k + 1) }}
            />
          ) : discoverList.length === 0 ? (
            <EmptyState icon={Users} title="No one to show here yet" subtitle="Check back soon as more members join the Archive." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {discoverList.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  requested={requestedIds.has(person.id)}
                  onRequest={() => handleRequest(person.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== REQUESTS ===== */}
      {view === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <EmptyState icon={Clock} title="No pending requests" subtitle="When someone asks to connect, you'll see it here." />
          ) : (
            pendingRequests.map((req) => (
              <div key={req.connection_id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <Avatar name={req.display_name} avatar={req.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{req.display_name}</p>
                  <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">{req.identity}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(req.connection_id)}
                    className="flex items-center gap-1.5 bg-brand-burgundy text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px]"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.connection_id)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== MY CIRCLE ===== */}
      {view === 'circle' && (
        <div className="space-y-4">
          {connections.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Your circle is empty"
              subtitle="Connect with mentors and mentees in the Discover tab to grow your circle."
              action={{ label: 'Discover people', onClick: () => setView('discover') }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {connections.map((conn) => (
                <div key={conn.connection_id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <Avatar name={conn.display_name} avatar={conn.avatar_url} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{conn.display_name}</p>
                    <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">{conn.identity}</p>
                  </div>
                  <button
                    onClick={() => onOpenChat({
                      id: conn.connected_user_id,
                      participantName: conn.display_name,
                      participantAvatar: conn.avatar_url,
                      participantIdentity: conn.identity,
                    })}
                    className="flex items-center gap-1.5 bg-[#FBF1F0] text-brand-burgundy px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-burgundy hover:text-white transition-all min-h-[44px] flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({ name, avatar, size = 'w-12 h-12' }) {
  return (
    <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0 overflow-hidden`}>
      {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() || '?')}
    </div>
  );
}

function PersonCard({ person, requested, onRequest }) {
  const interests = [
    ...(person.share_interests || []),
    ...(person.learn_interests || []),
    ...(person.you_can_learn || []),
    ...(person.they_can_learn || []),
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
      <div className="flex items-start gap-3">
        <Avatar name={person.display_name} avatar={person.avatar_url} size="w-14 h-14" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{person.display_name}</p>
          <p className="text-xs text-brand-burgundy font-semibold uppercase tracking-wide">
            {person.identity}{person.age ? ` · ${person.age}` : ''}
          </p>
          {typeof person.compatibility_score === 'number' && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> {person.compatibility_score}% match
            </span>
          )}
        </div>
      </div>

      {person.bio && <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-2">{person.bio}</p>}

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {interests.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{tag}</span>
          ))}
        </div>
      )}

      <button
        onClick={onRequest}
        disabled={requested}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
          requested
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : 'bg-brand-burgundy text-white hover:bg-opacity-90'
        }`}
      >
        {requested ? <><Check className="w-4 h-4" /> Request sent</> : <><UserPlus className="w-4 h-4" /> Request session</>}
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <Icon className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-sm">{subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 bg-brand-burgundy text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all min-h-[44px]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-20">
      <BookOpen className="w-12 h-12 opacity-30" />
      <p className="text-lg font-medium">{label} — coming soon</p>
    </div>
  );
}
