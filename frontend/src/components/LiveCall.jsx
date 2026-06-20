import React, { useState } from 'react';
import { ArrowLeft, Captions, MessageSquare, Mic, PhoneOff, Send, Users, Video, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveCall({ activeRoom = null, captions = [], sharedItems = [] }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [localCaptions, setLocalCaptions] = useState(captions);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const sendCaptionMessage = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setLocalCaptions((prev) => [
      ...prev,
      {
        id: `local-caption-${Date.now()}`,
        author: 'You',
        body: text,
        created_at: new Date().toISOString(),
        localOnly: true,
      },
    ]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white md:bg-[#F8F7F4] md:p-6 md:text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 overflow-hidden bg-black md:min-h-[760px] md:grid-cols-12 md:rounded-[2rem] md:bg-white md:shadow-sm">
        <section className="relative flex min-h-[62vh] flex-col items-center justify-center bg-stone-950 md:col-span-8 md:min-h-full">
          <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4">
            <button onClick={() => navigate('/dashboard')} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 backdrop-blur">
              {activeRoom ? 'Live room' : 'No active room'}
            </span>
            <button onClick={() => navigate('/messages')} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Open messages">
              <MessageSquare className="h-5 w-5" />
            </button>
          </header>

          {activeRoom ? (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-burgundy text-3xl font-bold">
                {(activeRoom.title || 'R').slice(0, 1).toUpperCase()}
              </div>
              <h1 className="mt-5 text-2xl font-bold">{activeRoom.title}</h1>
              <p className="mt-2 text-sm text-white/60">{activeRoom.description}</p>
            </div>
          ) : (
            <div className="px-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <Users className="h-9 w-9 text-white" />
              </div>
              <h1 className="mt-5 text-2xl font-bold">No live session selected</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/60">
                Connect this screen to your live-session service. Accepted mentorship calls and rooms can open here.
              </p>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-3 backdrop-blur">
            <button onClick={() => setIsMuted((value) => !value)} className={`rounded-full p-3 ${isMuted ? 'bg-red-600' : 'bg-white/10'}`} aria-label="Toggle microphone">
              <Mic className="h-5 w-5" />
            </button>
            <button onClick={() => setIsCameraOn((value) => !value)} className={`rounded-full p-3 ${isCameraOn ? 'bg-white/10' : 'bg-red-600'}`} aria-label="Toggle camera">
              <Video className="h-5 w-5" />
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-full bg-red-600 p-4" aria-label="End call">
              <PhoneOff className="h-5 w-5" />
            </button>
            <button className="rounded-full bg-white/10 p-3" aria-label="Captions">
              <Captions className="h-5 w-5" />
            </button>
            <button className="rounded-full bg-white/10 p-3" aria-label="Volume">
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </section>

        <aside className="flex min-h-[38vh] flex-col bg-[#F8F7F4] text-stone-900 md:col-span-4">
          <div className="border-b border-stone-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy">Session panel</p>
            <h2 className="mt-1 text-lg font-bold">Captions and shared archive</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-bold">Shared items</h3>
              {sharedItems.length === 0 ? (
                <p className="mt-2 text-xs leading-relaxed text-stone-500">
                  Media, notes, or knowledge cards shared during a session will appear here.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sharedItems.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-[#FBF9F6] p-3 text-sm font-bold">
                      {item.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-bold">Live captions</h3>
              <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                {localCaptions.length === 0 ? (
                  <p className="text-xs leading-relaxed text-stone-500">
                    Captions and chat messages will stream here when your real-time service is connected.
                  </p>
                ) : (
                  localCaptions.map((caption) => (
                    <div key={caption.id} className="rounded-2xl bg-[#FBF9F6] p-3">
                      <p className="text-[10px] font-bold uppercase text-stone-400">{caption.author}</p>
                      <p className="mt-1 text-sm text-stone-700">{caption.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <form onSubmit={sendCaptionMessage} className="border-t border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type in-session message..."
                className="min-w-0 flex-1 rounded-full border border-stone-200 bg-[#FBF9F6] px-4 py-3 text-sm outline-none focus:border-brand-burgundy"
              />
              <button disabled={!message.trim()} className="rounded-full bg-brand-burgundy p-3 text-white disabled:opacity-40" aria-label="Send">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
