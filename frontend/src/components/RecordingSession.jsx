import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Mic, Pause, Play, Send, Square, UploadCloud, Volume2, X, Library } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { createPost, uploadChatMedia } from '../services/apiService';

export default function RecordingSession() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { appUser } = useAuth();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [localStories, setLocalStories] = useState([]);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Browser does not support audio recording');
      return;
    }

    try {
      cleanupAudio();
      recordedChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. Setup MediaRecorder for actual voice signals
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      // 2. Setup live waveform visualizer driven by actual voice signals
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 128;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const drawWaveform = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#0F0D0C'; // dark slate
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 4;
        ctx.strokeStyle = '#740A03'; // brand-burgundy
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();

      // 3. Setup real SpeechRecognition transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

        recognition.onresult = (event) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentText += event.results[i][0].transcript;
            }
          }
          if (currentText) {
            setTranscript(prev => prev + ' ' + currentText);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      recorder.start();
      setIsRecording(true);
      setTranscript('');
      setAudioUrl('');
      setAudioBlob(null);
    } catch (err) {
      console.error('Error starting voice capture:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (recognitionRef.current) recognitionRef.current.stop();
    
    // Stop visualizer animation and microphone tracks
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
  };

  const clearArchive = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    setAudioBlob(null);
    setTranscript('');
  };

  const publishStory = async () => {
    if (!audioBlob && !transcript.trim()) return;

    setIsUploading(true);
    try {
      let finalAudioUrl = null;

      if (audioBlob) {
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        
        await new Promise((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64Data = reader.result;
              // Upload voice note
              const uploadResult = await uploadChatMedia(base64Data, 'video');
              if (uploadResult.success) {
                finalAudioUrl = uploadResult.url;
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          };
        });
      }

      // Save as audio archive post
      const bodyText = transcript.trim() || t('voiceNote');
      const response = await createPost(bodyText, 'audio_archive', finalAudioUrl);

      if (response.success) {
        setLocalStories(prev => [
          {
            id: response.post.id,
            caption: response.post.body,
            previewUrl: finalAudioUrl,
            type: 'voice',
          },
          ...prev
        ]);
        
        clearArchive();
        alert('Archive successfully saved to feed!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error publishing archive:', err);
      alert('Failed to publish archive');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0C] text-white md:bg-[#F8F7F4] md:p-6 md:text-stone-900 font-sans">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 overflow-hidden bg-black md:min-h-[760px] md:grid-cols-12 md:rounded-[2rem] md:bg-white md:shadow-sm">
        
        {/* Visualizer & record controls panel */}
        <section className="relative flex min-h-[72vh] flex-col bg-black md:col-span-7 md:min-h-full p-6">
          <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/85 to-transparent">
            <button onClick={() => navigate('/dashboard')} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              {t('storyUpload')}
            </span>
            <button onClick={clearArchive} className="rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Clear">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center pt-16 pb-36">
            
            {/* Visualizer canvas */}
            {isRecording ? (
              <div className="w-full max-w-md space-y-4">
                <canvas ref={canvasRef} className="w-full h-36 bg-[#0F0D0C] rounded-[2rem] border border-stone-800" width={400} height={150} />
                <p className="text-center text-[10px] text-stone-500 uppercase tracking-widest">{t('visualizerLabel')}</p>
              </div>
            ) : audioUrl ? (
              <div className="w-full max-w-md space-y-6 text-center">
                <div className="h-20 w-20 bg-brand-burgundy rounded-full flex items-center justify-center mx-auto text-white animate-pulse">
                  <Volume2 className="h-9 w-9" />
                </div>
                <audio src={audioUrl} controls className="w-full h-10 accent-brand-burgundy" />
              </div>
            ) : (
              <div className="px-8 text-center max-w-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-brand-burgundy mb-6">
                  <Mic className="h-9 w-9 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">{t('createStory')}</h1>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {t('createStorySub')}
                </p>
              </div>
            )}

            {/* Live speech recognition transcription box */}
            {transcript && (
              <div className="w-full max-w-md mt-6 rounded-[2rem] bg-white/5 border border-white/10 p-5 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A77272] mb-2">{t('liveTranscription')}</p>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-transparent resize-none text-sm text-white focus:outline-none min-h-24 leading-relaxed"
                  placeholder={t('reviewTranscript')}
                />
              </div>
            )}
          </div>

          {/* Absolute bottom controls bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent p-6 pt-16" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isUploading}
                  className={`rounded-full px-6 py-4 text-sm font-bold text-white transition flex items-center gap-2 min-h-[52px] ${isRecording ? 'bg-red-600' : 'bg-white/15 hover:bg-white/20'}`}
                >
                  {isRecording ? <Square className="h-5 w-5 fill-current" /> : <Mic className="h-5 w-5" />}
                  {isRecording ? t('stopRecording') : t('voice')}
                </button>
              </div>
              <button
                onClick={publishStory}
                disabled={(!audioBlob && !transcript.trim()) || isUploading}
                className="rounded-full bg-brand-burgundy px-6 py-4 text-sm font-bold text-white disabled:opacity-40 flex items-center gap-2 min-h-[52px]"
              >
                <Send className="h-5 w-5" />
                {isUploading ? t('saving') : t('publishToArchive')}
              </button>
            </div>
          </div>
        </section>

        {/* Side library panel */}
        <aside className="bg-[#F8F7F4] p-5 text-stone-900 md:col-span-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-burgundy">{t('memoryArchive')}</p>
                <h2 className="mt-1 text-xl font-bold">{t('archiveTitle')}</h2>
              </div>
              <Library className="h-5 w-5 text-brand-burgundy" />
            </div>

            <div className="mt-5 space-y-3">
              {localStories.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-brand-burgundy" />
                  <h3 className="mt-3 text-sm font-bold">{t('noStoriesYet')}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    {t('noStoriesYetSub')}
                  </p>
                </div>
              ) : (
                localStories.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-burgundy text-white shrink-0">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.caption || 'Untitled story'}</p>
                      <p className="text-[11px] text-stone-500">{t('sent')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
