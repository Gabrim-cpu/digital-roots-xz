import React from 'react';
import { Mic, Video, PhoneOff, Captions, Volume2, Search, Bell, HelpCircle, Maximize2, Send } from 'lucide-react';

export default function LiveCall() {
  return (
    <div className="min-h-screen bg-brand-bgLight p-6 font-sans">
      {/* Top Bar Navigation */}
      <header className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-brand-burgundy text-lg">📁</span>
          <span className="font-serif font-bold text-brand-burgundy text-lg tracking-wide">Live Connection</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search archive..." className="w-full pl-9 pr-4 py-1.5 bg-gray-200/50 rounded-full text-xs focus:outline-none" />
          </div>
          <Bell className="w-4 h-4 text-gray-500 cursor-pointer" />
          <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" className="w-7 h-7 rounded-full" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Video/Call Container Workspace */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-3xl relative overflow-hidden flex flex-col justify-center items-center min-h-[500px] text-white shadow-xl">
          {/* Active Status Badge */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Arthur Miller
          </div>

          {/* Main Visual Center Graphic Accent */}
          <div className="text-center space-y-4">
            <div className="text-8xl select-none opacity-80">▶</div>
            <h2 className="text-3xl tracking-widest font-sans font-light opacity-60">PRIMARY</h2>
            <p className="text-sm uppercase tracking-wider opacity-40">Safe Work</p>
          </div>

          {/* Self Preview Floating Screen Overlay */}
          <div className="absolute bottom-4 right-4 w-28 h-20 bg-gray-800 rounded-xl overflow-hidden border border-white/20 shadow-md">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" className="w-full h-full object-cover" />
          </div>

          {/* Interactive Absolute Call Controller Dock */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 border border-white/10">
            <button className="flex flex-col items-center text-[9px] opacity-70 hover:opacity-100"><Mic className="w-4 h-4 mb-0.5 bg-white/10 p-2 rounded-full box-content"/>MUTE</button>
            <button className="flex flex-col items-center text-[9px] opacity-70 hover:opacity-100"><Video className="w-4 h-4 mb-0.5 bg-white/10 p-2 rounded-full box-content"/>CAMERA</button>
            <button className="flex flex-col items-center text-[9px] text-red-400 font-bold hover:text-red-500"><PhoneOff className="w-4 h-4 mb-0.5 bg-red-600 p-2.5 text-white rounded-full box-content shadow-lg shadow-red-900/30"/>END CALL</button>
            <button className="flex flex-col items-center text-[9px] opacity-100 text-white"><Captions className="w-4 h-4 mb-0.5 bg-white/20 p-2 rounded-full box-content"/>CAPTIONS</button>
            <button className="flex flex-col items-center text-[9px] opacity-70 hover:opacity-100"><Volume2 className="w-4 h-4 mb-0.5 bg-white/10 p-2 rounded-full box-content"/>LOUD</button>
          </div>
        </div>

        {/* Right Side Interaction Panel Drawer */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Top Panel Element: Archive Artifact Box */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-serif font-bold text-brand-burgundy text-sm">Shared Archive</span>
              <Maximize2 className="w-3 h-3 text-gray-400 cursor-pointer" />
            </div>
            <div className="bg-zinc-100 rounded-xl h-28 overflow-hidden relative group cursor-pointer border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-700 to-zinc-400 opacity-60 mix-blend-multiply"></div>
              {/* Dynamic abstract wave lines mockup element */}
              <div className="absolute inset-0 flex flex-col justify-between p-2 text-white">
                <div className="w-6 h-6 bg-black/40 rounded-full flex items-center justify-center self-center my-auto"><Search className="w-3 h-3 text-white"/></div>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-[9px] uppercase font-bold tracking-wider text-red-800 bg-red-50 px-1.5 py-0.5 rounded">Discussion Topic</span>
              <p className="text-xs italic text-gray-700 mt-1">"The first road trip across the coast, 1958"</p>
            </div>
          </div>

          {/* Bottom Live Text Call Captions Stream Box */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex-1 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4 overflow-y-auto max-h-[280px] pr-1">
              <div className="flex gap-1 items-center text-[9px] text-gray-400 uppercase tracking-wider font-semibold"><span className="w-3 h-3">💬</span> Live Captions</div>
              
              {/* Message Bubble Block: Remote Incoming */}
              <div className="space-y-1">
                <div className="text-[9px] text-gray-400 uppercase tracking-tight">Arthur • 2:14 PM</div>
                <div className="bg-gray-50 text-xs text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[90%] border border-gray-100 leading-relaxed">
                  I remember that day so clearly. The engine hummed all the way through the valley.
                </div>
              </div>

              {/* Message Bubble Block: Client Target Outgoing */}
              <div className="space-y-1 flex flex-col items-end">
                <div className="text-[9px] text-gray-400 uppercase tracking-tight self-end">Sarah • 2:15 PM</div>
                <div className="bg-brand-burgundy text-xs text-white p-3 rounded-2xl rounded-tr-none max-w-[90%] shadow-sm leading-relaxed">
                  Was it hard to navigate back then without GPS?
                </div>
              </div>

              {/* Message Bubble Block: Remote Incoming */}
              <div className="space-y-1">
                <div className="text-[9px] text-gray-400 uppercase tracking-tight">Arthur • 2:15 PM</div>
                <div className="bg-gray-50 text-xs text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[90%] border border-gray-100 leading-relaxed">
                  We had paper maps and intuition, Sarah. Much more adventurous!
                </div>
              </div>
            </div>

            {/* Input Form Action Row Container */}
            <div className="relative mt-4 pt-2 border-t border-gray-100">
              <input type="text" placeholder="Type a message..." className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-brand-burgundy" />
              <button className="absolute right-3 top-5 text-brand-burgundy hover:scale-105 transition-transform"><Send className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}