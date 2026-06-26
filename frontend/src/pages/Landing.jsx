import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, MessageCircle, Video } from 'lucide-react';
import laptopImg from '../Assets/intergenerational_laptop.png';
import logoXZ from '../Assets/logo_XZ-removebg-preview.png';

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-50px) rotateX(20deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px) rotateX(-20deg); }
          to { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 29, 32, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 29, 32, 0.6); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes rotate-in {
          from { opacity: 0; transform: rotate(-10deg) scale(0.8); }
          to { opacity: 1; transform: rotate(0) scale(1); }
        }

        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.8s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-rotate-in { animation: rotate-in 0.8s ease-out forwards; }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

        .transition-smooth { transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

        button { perspective: 1000px; }
        button:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
        button:active { transform: translateY(-1px); }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 transition-all duration-300" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <img src={logoXZ} alt="XZ" className="w-8 h-8" />
            <span className="text-xl font-bold text-brand-burgundy">XZ</span>
          </div>
          <div className="flex gap-3 animate-fade-in delay-100">
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-base font-semibold text-gray-600 hover:text-gray-900 min-h-[44px] transition-smooth">
              Sign in
            </button>
            <button onClick={() => navigate('/register')} className="px-6 py-2.5 bg-brand-burgundy text-white rounded-lg font-semibold min-h-[44px] hover:shadow-lg transition-smooth">
              Join XZ
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-6 py-20">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={laptopImg}
            alt="Intergenerational Connection"
            className="w-full h-full object-cover"
            style={{ opacity: 0.35 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />

          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-brand-burgundy/15 rounded-full blur-3xl animate-bounce-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-amber-100/10 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '3s' }} />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="space-y-6">
            <h1
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-down"
              style={{ perspective: '1200px' }}
            >
              Every Generation Has Something to <span className="text-brand-burgundy inline-block animate-scale-in delay-300">Teach.</span>
            </h1>
            <h2
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-up delay-200"
              style={{ perspective: '1200px' }}
            >
              Every Generation Has Something to <span className="text-brand-burgundy inline-block animate-scale-in delay-400">Learn.</span>
            </h2>

            <p
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300"
              style={{ opacity: isVisible ? 1 : 0 }}
            >
              From digital skills to cultural heritage, XZ creates meaningful connections between youth and elders through reciprocal learning and authentic conversations.
            </p>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-brand-burgundy text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 min-h-[56px] mx-auto animate-fade-in delay-400 animate-glow"
          >
            Join XZ Today <ArrowRight className="w-5 h-5 animate-bounce-slow" style={{ animationDuration: '2s' }} />
          </button>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ animationDuration: '2s' }}>
            <div className="w-6 h-10 border-2 border-brand-burgundy rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-brand-burgundy rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6 animate-fade-in-up" style={{ animation: 'fadeInUp 0.8s ease-out forwards', opacity: scrollY > 500 ? 1 : 0 }}>
            <h2 className="text-5xl font-bold text-gray-900 animate-rotate-in">Why XZ Exists</h2>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in delay-200">
              Modern technology connects millions of people, yet generations are growing further apart. Valuable knowledge is being lost, while digital opportunities remain inaccessible to many. XZ bridges this gap by creating a space where youth and elders can learn from one another, exchange skills, and preserve cultural heritage together.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16 animate-fade-in-down">Discover Meaningful Connections</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: Users,
                title: 'Find People Whose Knowledge Complements Yours',
                desc: 'Our matching algorithm connects you with mentors and learners based on shared interests and complementary skills.'
              },
              {
                icon: BookOpen,
                title: 'Learn and Teach',
                desc: 'Share what you know and learn what you don\'t. Every conversation is an opportunity for mutual growth.'
              },
              {
                icon: MessageCircle,
                title: 'Build Strong Roots',
                desc: 'Grow relationships through conversations, mentorship, and collaboration that last beyond any single interaction.'
              },
              {
                icon: Video,
                title: 'Preserve Cultural Heritage',
                desc: 'Record stories, traditions, languages, and experiences for future generations to learn from.'
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="space-y-4 p-8 bg-white rounded-2xl border border-gray-200 hover:border-brand-burgundy hover:shadow-2xl transition-smooth animate-scale-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                  <Icon className="w-12 h-12 text-brand-burgundy animate-rotate-in" style={{ animationDelay: `${i * 150}ms` }} />
                  <h3 className="text-2xl font-bold text-gray-900 animate-fade-in delay-100">{feature.title}</h3>
                  <p className="text-lg text-gray-600 animate-fade-in delay-200">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Root Strength Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-brand-burgundy/5 to-blue-400/5">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-5xl font-bold text-gray-900 animate-fade-in-down">Relationships That Grow Over Time</h2>
          <p className="text-xl text-gray-600 leading-relaxed animate-fade-in delay-200">
            Unlike traditional social networks that measure popularity, XZ measures the strength of meaningful connections. Every conversation, lesson, and shared experience helps your roots grow deeper.
          </p>
          <div className="inline-block animate-bounce-slow" style={{ perspective: '1000px' }}>
            <div className="flex items-center gap-4 bg-white px-8 py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-smooth border border-gray-100">
              <div className="text-5xl font-bold text-brand-burgundy animate-float">→</div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-500 animate-fade-in delay-100">Meaningful growth comes from</div>
                <div className="text-2xl font-bold text-gray-900 animate-fade-in delay-200">Real connections, not metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-brand-burgundy to-brand-burgundy/90 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h2 className="text-5xl font-bold animate-fade-in-down">Your Knowledge Matters. So Does Theirs.</h2>
          <p className="text-xl leading-relaxed opacity-95 animate-fade-in delay-200">
            Join a new generation of learners, mentors, storytellers, and innovators building stronger communities together.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-brand-burgundy rounded-lg font-bold text-lg flex items-center justify-center gap-2 min-h-[56px] hover:shadow-2xl mx-auto animate-fade-in-up delay-300 animate-glow"
            style={{ animationDelay: '600ms' }}
          >
            Start Building Your Roots <ArrowRight className="w-5 h-5 animate-bounce-slow" style={{ animationDuration: '2s' }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in">
            <img src={logoXZ} alt="XZ" className="w-6 h-6 brightness-0 invert" />
            <span className="font-bold text-white">XZ Digital Roots</span>
          </div>
          <p className="text-sm animate-fade-in delay-100">Bridging generations through knowledge, stories, and connection.</p>
          <p className="text-sm mt-4 animate-fade-in delay-200">© 2026 Digital Roots. Every generation has something to teach.</p>
        </div>
      </footer>
    </div>
  );
}
