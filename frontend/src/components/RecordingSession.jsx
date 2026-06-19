import React from 'react';
import { X, Pause, Square, FileText, UploadCloud, Bell, HelpCircle } from 'lucide-react';

export default function RecordingSession() {
  // Static mockup array weights representing active audio frequencies
  const audioBars = [16, 24, 40, 18, 56, 32, 68, 22, 50, 44, 60, 36, 28, 54, 40, 48, 14, 58, 30, 62, 12];

  return (
    <div className="min-h-screen bg-brand-bgLight p-6 font-sans">
      {/* Upper Navigation Anchor Row */}
      <header className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <h1 className="font-serif font-bold text-brand-burgundy text-lg tracking-wide">Recording Session</h1>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer"><Bell className="w-4 h-4 text-gray-500"/><span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-600 rounded-full"></span></div>
          <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80" className="w-7 h-7 rounded-full" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Main Recorder Workspace Area */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[440px]">
          <div className="bg-red-50 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Recording Live
          </div>
          
          <div className="text-5xl font-serif text-brand-darkText font-bold tracking-tight">04:12</div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Life Story: The Summer of 1968</p>

          {/* Sound Waveform Visualization Block Container */}
          <div className="w-full bg-gray-50 rounded-2xl h-32 my-8 flex items-center justify-center gap-1 px-6 border border-gray-100/80">
            {audioBars.map((height, idx) => (
              <div 
                key={idx} 
                className="w-1.5 bg-brand-burgundy rounded-full transition-all duration-300"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-6">
            <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all"><X className="w-4 h-4" /></button>
            <button className="w-14 h-14 rounded-full bg-brand-burgundy text-white flex items-center justify-center shadow-lg shadow-red-900/20 hover:scale-102 transition-all ring-4 ring-red-50"><Pause className="w-5 h-5 fill-white" /></button>
            <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all"><Square className="w-4 h-4 fill-gray-500" /></button>
          </div>
        </div>

        {/* Right Side Segment: Realtime Live Transcription Box */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-brand-darkText">
              <h3 className="font-serif font-bold text-sm">Transcription Preview</h3>
              <span className="text-brand-burgundy text-xs">📝</span>
            </div>
            
            <div className="space-y-3 font-serif text-xs text-gray-400/90 leading-relaxed overflow-y-auto max-h-[220px] pr-1">
              <p className="italic">"...it was a warm Tuesday afternoon when we first saw the shoreline. The air smelled of salt and promise..."</p>
              <p className="text-gray-700 font-sans not-italic">"My brother was holding the old Leica camera, the same one Dad brought back from the service. We didn't know then that this would be the last summer..."</p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Post-Recording Actions</span>
              
              <button className="w-full bg-brand-roseMuted text-white text-xs py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-opacity-95 transition-all">
                <UploadCloud className="w-3.5 h-3.5"/> Publish to Archive
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 text-xs py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                <FileText className="w-3.5 h-3.5"/> Full Transcription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}