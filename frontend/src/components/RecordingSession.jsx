import React, { useRef, useState } from 'react';
import { ArrowLeft, ImagePlus, Library, Mic, Pause, Play, Send, UploadCloud, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecordingSession({ libraryItems = [] }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [storyType, setStoryType] = useState('video');
  const [isRecording, setIsRecording] = useState(false);
  const [localStories, setLocalStories] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setStoryType(file.type.startsWith('video/') ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
  };

  const publishStory = () => {
    if (!selectedFile && !caption.trim()) return;
    setLocalStories((prev) => [
      {
        id: `local-story-${Date.now()}`,
        caption: caption.trim(),
        previewUrl,
        type: storyType,
        localOnly: true,
      },
      ...prev,
    ]);
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
  };

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white md:bg-[#F8F7F4] md:p-6 md:text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 overflow-hidden bg-black md:min-h-[760px] md:grid-cols-12 md:rounded-[2rem] md:bg-white md:shadow-sm">
        <section className="relative flex min-h-[72vh] flex-col bg-black md:col-span-7 md:min-h-full">
          <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4">
            <button onClick={() => navigate('/dashboard')} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              Story upload
            </span>
            <button onClick={clearSelection} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Clear">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center">
            {previewUrl ? (
              storyType === 'video' ? (
                <video src={previewUrl} controls className="h-full max-h-screen w-full object-contain" />
              ) : (
                <img src={previewUrl} alt="Story preview" className="h-full max-h-screen w-full object-contain" />
              )
            ) : (
              <div className="px-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                  <Video className="h-9 w-9 text-white" />
                </div>
                <h1 className="mt-5 text-2xl font-bold">Create a story</h1>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Upload vertical video, audio, or images. Published content will appear in the community feed once `/stories` and `/feed` are connected.
                </p>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-16">
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Add a caption, language, context, or tags..."
              className="min-h-20 w-full resize-none rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur focus:border-white/40"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" onChange={handleFileChange} className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-white px-4 py-3 text-xs font-bold text-stone-900">
                  <ImagePlus className="mr-1.5 inline h-4 w-4" />
                  Upload
                </button>
                <button onClick={() => setIsRecording((value) => !value)} className={`rounded-full px-4 py-3 text-xs font-bold text-white ${isRecording ? 'bg-red-600' : 'bg-white/15'}`}>
                  {isRecording ? <Pause className="mr-1.5 inline h-4 w-4" /> : <Mic className="mr-1.5 inline h-4 w-4" />}
                  {isRecording ? 'Pause' : 'Voice'}
                </button>
              </div>
              <button onClick={publishStory} disabled={!selectedFile && !caption.trim()} className="rounded-full bg-brand-burgundy px-5 py-3 text-xs font-bold text-white disabled:opacity-40">
                <Send className="mr-1.5 inline h-4 w-4" />
                Publish
              </button>
            </div>
          </div>
        </section>

        <aside className="bg-[#F8F7F4] p-5 text-stone-900 md:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy">Archive</p>
              <h2 className="mt-1 text-xl font-bold">Knowledge library</h2>
            </div>
            <Library className="h-5 w-5 text-brand-burgundy" />
          </div>

          <div className="mt-5 rounded-3xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-bold">Content Service endpoints</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {['/posts', '/stories', '/library', '/feed', '/recommendations'].map((endpoint) => (
                <span key={endpoint} className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-brand-burgundy">
                  {endpoint}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[...localStories, ...libraryItems].length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
                <UploadCloud className="mx-auto h-8 w-8 text-brand-burgundy" />
                <h3 className="mt-3 text-sm font-bold">No uploaded stories yet</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">
                  Your real MongoDB posts, stories, and knowledge articles will appear here after the media upload service is connected.
                </p>
              </div>
            ) : (
              [...localStories, ...libraryItems].map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3">
                  <div className="flex h-14 w-10 items-center justify-center overflow-hidden rounded-2xl bg-stone-900 text-white">
                    {item.previewUrl ? (
                      item.type === 'video' ? <Play className="h-5 w-5 fill-current" /> : <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Library className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.caption || item.title || 'Untitled story'}</p>
                    <p className="text-[11px] text-stone-500">{item.localOnly ? 'Local preview' : 'Published'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
