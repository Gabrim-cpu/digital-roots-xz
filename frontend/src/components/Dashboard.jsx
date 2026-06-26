import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFeed, getRecommendations, requestConnection, createPost, getPendingRequests, acceptConnection, rejectConnection, getPointsSummary } from '../services/apiService';
import {
  Award,
  Bell,
  BookOpen,
  Home,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic2,
  Plus,
  Search,
  Send,
  User,
  Users,
  Video,
  X,
  Languages,
  Heart,
  Star,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import logo from '../Assets/logo_XZ-removebg-preview.png';
import BadgeDisplay from './BadgeDisplay';
import Leaderboard from './Leaderboard';

const navItems = [
  { name: 'Home', translationKey: 'feed', icon: Home, path: '/dashboard' },
  { name: 'Connect', translationKey: 'findMentor', icon: Users, path: '/dashboard', action: 'connect' },
  { name: 'Create', translationKey: 'create', icon: Plus, path: '/recording', primary: true },
  { name: 'Messages', translationKey: 'messages', icon: MessageSquare, path: '/messages' },
  { name: 'Profile', translationKey: 'profile', icon: User, path: '/dashboard', action: 'profile' },
];

export default function Dashboard({ feed = [], recommendations = [], pointsSummary }) {
  const { appUser, signOut } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerText, setComposerText] = useState('');
  const [localFeed, setLocalFeed] = useState(feed);
  const [liveRecommendations, setLiveRecommendations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [livePointsSummary, setLivePointsSummary] = useState(pointsSummary || { totalPoints: 0, badges: [] });
  const [isPublishing, setIsPublishing] = useState(false);

  const displayName = appUser?.display_name || appUser?.email?.split('@')[0] || 'User';
  const isSenior = appUser?.identity === 'Senior';

  const fetchData = async () => {
    try {
      const feedData = await getFeed();
      setLocalFeed(feedData.feed || []);
    } catch (err) {
      console.error('Error fetching feed:', err);
    }
    try {
      const recommendationsData = await getRecommendations();
      setLiveRecommendations(recommendationsData.recommendations || recommendationsData.matches || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
    try {
      const requestsData = await getPendingRequests();
      setPendingRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
    try {
      if (appUser?.id) {
        const pointsData = await getPointsSummary(appUser.id);
        setLivePointsSummary(pointsData);
      }
    } catch (err) {
      console.error('Error fetching points summary:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [appUser]);

  const avatarUrl = appUser?.avatar_url || null;
  const initials = displayName.slice(0, 1).toUpperCase();

  const filteredFeed = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const source = localFeed.length ? localFeed : feed;
    if (!query) return source;
    return source.filter((item) =>
      [item.author_name, item.title, item.body, item.type].filter(Boolean).some((value) => value.toLowerCase().includes(query))
    );
  }, [feed, localFeed, searchQuery]);

  const publishLocalPost = async () => {
    const body = composerText.trim();
    if (!body || isPublishing) return;
    setIsPublishing(true);
    try {
      const response = await createPost(body);
      setLocalFeed((prev) => [response.post, ...prev]);
      setComposerText('');
      if (appUser?.id) {
        const pointsData = await getPointsSummary(appUser.id);
        setLivePointsSummary(pointsData);
      }
    } catch (err) {
      console.error('Error publishing post:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await requestConnection(userId);
      setLiveRecommendations(prev => prev.filter(m => m.id !== userId));
      alert(t('connectionSent'));
    } catch (err) {
      console.error('Error requesting connection:', err);
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      await acceptConnection(connectionId);
      setPendingRequests(prev => prev.filter(r => r.connection_id !== connectionId));
      if (appUser?.id) {
        const pointsData = await getPointsSummary(appUser.id);
        setLivePointsSummary(pointsData);
      }
    } catch (err) {
      console.error('Error accepting connection:', err);
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      await rejectConnection(connectionId);
      setPendingRequests(prev => prev.filter(r => r.connection_id !== connectionId));
    } catch (err) {
      console.error('Error rejecting connection:', err);
    }
  };

  const navigateTo = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const handleNavClick = (item) => {
    if (item.action === 'connect') {
      setActiveTab('connect');
    } else if (item.action === 'profile') {
      setIsProfileOpen(true);
    } else if (item.path === '/dashboard') {
      setActiveTab('home');
    } else {
      navigateTo(item.path);
    }
  };

  const LanguageSelector = () => (
    <div className="flex items-center gap-1.5 border rounded-full px-3 py-2 bg-[#FBF9F6] border-stone-200">
      <Languages className="h-4 w-4 text-stone-400" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-sm outline-none font-bold cursor-pointer text-stone-600"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  );

  const ProfileAvatar = ({ size = 'h-12 w-12', interactive = true }) => {
    const className = `${size} shrink-0 overflow-hidden rounded-full bg-brand-burgundy text-base font-bold text-white ring-2 ring-white flex items-center justify-center`;
    const content = avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials;
    if (!interactive) {
      return <div className={className}>{content}</div>;
    }
    return (
      <button onClick={() => setIsProfileOpen(true)} className={className}>
        {content}
      </button>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, subtitle, onClick, color = 'bg-brand-burgundy/10 text-brand-burgundy' }) => (
    <button
      onClick={onClick}
      className="w-full rounded-3xl border p-5 text-left transition-all active:scale-[0.98] border-stone-200 bg-white hover:border-brand-burgundy/30 hover:shadow-md"
    >
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className={`mt-3 font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{title}</h3>
      <p className={`mt-1 leading-relaxed ${isSenior ? 'text-sm text-stone-500' : 'text-xs text-stone-400'}`}>{subtitle}</p>
      <ChevronRight className="mt-2 h-5 w-5 text-brand-burgundy" />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900" style={{ fontFamily: '"Poppins", sans-serif', paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur md:hidden border-stone-200 bg-white/95" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <button onClick={() => { setActiveTab('home'); }} className="flex items-center gap-2">
            <img src={logo} alt="Digital Roots" className="h-9 w-auto" />
            <span className="text-base font-bold text-brand-burgundy">Digital Roots</span>
          </button>
          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col justify-between border-r p-5 transition-transform md:translate-x-0 border-stone-200 bg-white ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between">
            <button onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} className="flex items-center gap-3 text-left">
              <img src={logo} alt="Digital Roots" className="h-11 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-brand-burgundy">Digital Roots</h1>
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Community</p>
              </div>
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="rounded-full p-2 md:hidden hover:bg-stone-100" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <button onClick={() => { setIsProfileOpen(true); setIsSidebarOpen(false); }} className="mt-7 flex w-full items-center gap-3 rounded-3xl border p-4 text-left border-stone-200 bg-[#FBF9F6]">
            <ProfileAvatar size="h-14 w-14" interactive={false} />
            <div className="min-w-0">
              <p className={`truncate font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{displayName}</p>
              <p className={`${isSenior ? 'text-sm' : 'text-[11px]'} text-stone-500`}>{isSenior ? t('senior') : t('youth')}</p>
              <p className={`mt-0.5 font-bold ${isSenior ? 'text-sm' : 'text-xs'} text-brand-burgundy`}>{livePointsSummary?.totalPoints ?? 0} {t('points')}</p>
            </div>
          </button>

          <nav className="mt-7 space-y-1.5">
            {[
              { label: t('feed'), icon: Home, tab: 'home' },
              { label: t('findMentor'), icon: Users, tab: 'connect' },
              { label: t('wisdomHub'), icon: BookOpen, tab: 'wisdom' },
              { label: t('create'), icon: Plus, path: '/recording' },
              { label: t('messages'), icon: MessageSquare, path: '/messages' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.tab ? activeTab === item.tab : location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    if (item.tab) setActiveTab(item.tab);
                    else if (item.path) navigate(item.path);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'} ${
                    isActive
                      ? 'bg-brand-burgundy text-white'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          <button onClick={signOut} className={`flex items-center gap-2 font-semibold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'} text-stone-400 hover:text-brand-burgundy`}>
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/25 md:hidden" />}

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-4 md:ml-72 md:px-8 md:py-6">

        {/* Desktop Header */}
        <div className="hidden items-center justify-between md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className={`w-full rounded-full border py-3.5 pl-12 pr-4 outline-none focus:border-brand-burgundy ${isSenior ? 'text-base' : 'text-sm'} border-stone-200 bg-white`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border p-3.5 min-h-[48px] min-w-[48px] flex items-center justify-center border-stone-200 bg-white">
              <Bell className="h-5 w-5 text-stone-600" />
            </button>
            <button onClick={() => navigateTo('/messages')} className={`rounded-full bg-brand-burgundy px-5 py-3.5 font-bold text-white min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'}`}>
              {t('messages')}
            </button>
            <ProfileAvatar />
          </div>
        </div>

        {/* ========== HOME TAB ========== */}
        {activeTab === 'home' && (
          <section className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">

            {/* Main Feed */}
            <div className="space-y-5 lg:col-span-8">

              {/* Quick Actions (mobile) */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                <QuickActionCard
                  icon={Users}
                  title={t('findMentor')}
                  subtitle={t('findMentorSub')}
                  onClick={() => setActiveTab('connect')}
                  color="bg-blue-50 text-blue-600"
                />
                <QuickActionCard
                  icon={BookOpen}
                  title={t('wisdomHub')}
                  subtitle={t('wisdomHubSub')}
                  onClick={() => setActiveTab('wisdom')}
                  color="bg-amber-50 text-amber-600"
                />
                <QuickActionCard
                  icon={Mic2}
                  title={t('contribute')}
                  subtitle={t('contributeSub')}
                  onClick={() => navigateTo('/recording')}
                  color="bg-emerald-50 text-emerald-600"
                />
                <QuickActionCard
                  icon={Star}
                  title={t('community')}
                  subtitle={t('communitySub')}
                  onClick={() => setActiveTab('wisdom')}
                  color="bg-purple-50 text-purple-600"
                />
              </div>

              {/* Composer */}
              <div className="rounded-3xl border p-4 shadow-sm border-stone-200 bg-white">
                <div className="flex gap-3">
                  <ProfileAvatar interactive={false} />
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={composerText}
                      onChange={(event) => setComposerText(event.target.value)}
                      placeholder={t('createPostPlaceholder')}
                      className={`min-h-20 w-full resize-none rounded-2xl border p-4 outline-none focus:border-brand-burgundy ${isSenior ? 'text-base' : 'text-sm'} border-stone-200 bg-[#FBF9F6]`}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <button onClick={() => navigateTo('/recording')} className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 font-bold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'} bg-stone-100 text-stone-600`}>
                          <Mic2 className="h-5 w-5" />
                          {t('voice')}
                        </button>
                      </div>
                      <button onClick={publishLocalPost} disabled={!composerText.trim() || isPublishing} className={`rounded-full bg-brand-burgundy px-6 py-3 font-bold text-white disabled:opacity-40 min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'}`}>
                        {isPublishing ? t('saving') : t('publish')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed */}
              {filteredFeed.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-10 text-center border-stone-300 bg-white">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-brand-burgundy">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h2 className={`mt-4 font-bold ${isSenior ? 'text-lg' : 'text-base'}`}>{t('noFeed')}</h2>
                  <p className={`mx-auto mt-2 max-w-sm leading-relaxed ${isSenior ? 'text-base' : 'text-sm'} text-stone-500`}>
                    {t('noFeedSub')}
                  </p>
                  <button onClick={() => navigateTo('/recording')} className={`mt-5 rounded-full bg-brand-burgundy px-6 py-3.5 font-bold text-white min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'}`}>
                    {t('uploadFirstStory')}
                  </button>
                </div>
              ) : (
                filteredFeed.map((item) => (
                  <article key={item.id} className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center rounded-full bg-brand-burgundy font-bold text-white shrink-0 ${isSenior ? 'h-14 w-14 text-base' : 'h-11 w-11 text-sm'}`}>
                        {(item.author_name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{item.author_name || t('communityMember')}</p>
                        <p className={`text-stone-500 ${isSenior ? 'text-sm' : 'text-[11px]'}`}>
                          {item.type === 'audio_archive' ? t('memoryArchive') : item.type || 'post'}
                        </p>
                      </div>
                    </div>
                    <p className={`mt-4 leading-relaxed whitespace-pre-wrap ${isSenior ? 'text-base' : 'text-sm'} text-stone-700`}>{item.body || item.title}</p>

                    {item.media_url && (
                      <div className="mt-4">
                        {item.type === 'audio_archive' ? (
                          <audio src={item.media_url} controls className="w-full max-w-md h-12 accent-brand-burgundy" />
                        ) : (
                          <img src={item.media_url} alt="" className="aspect-[9/16] max-h-[520px] w-full rounded-3xl object-cover" />
                        )}
                      </div>
                    )}

                    <div className={`mt-4 flex items-center gap-3 border-t pt-3 font-bold ${isSenior ? 'text-sm' : 'text-xs'} border-stone-100 text-stone-500`}>
                      <button className="flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] hover:bg-stone-100">
                        <Heart className="h-5 w-5" />
                        {t('like')}
                      </button>
                      <button className="flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] hover:bg-stone-100">
                        <MessageCircle className="h-5 w-5" />
                        {t('comment')}
                      </button>
                      <button className="flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] hover:bg-stone-100">
                        <Send className="h-5 w-5" />
                        {t('share')}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Right sidebar */}
            <aside className="space-y-5 lg:col-span-4">

              {/* Points Summary */}
              <div className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
                <h3 className={`font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{t('rootPoints')}</h3>
                <p className={`mt-1 ${isSenior ? 'text-sm' : 'text-xs'} text-stone-500`}>{t('engagementValue')}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl p-4 bg-[#FBF9F6]">
                    <p className={`font-bold ${isSenior ? 'text-2xl' : 'text-lg'} text-brand-burgundy`}>{livePointsSummary?.totalPoints ?? 0}</p>
                    <p className={`${isSenior ? 'text-xs' : 'text-[10px]'} text-stone-500`}>{t('points')}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl p-4 flex flex-col justify-center items-center bg-[#FBF9F6]">
                    <BadgeDisplay badges={livePointsSummary?.badges || []} />
                  </div>
                </div>
              </div>

              <Leaderboard />

              {/* Desktop Quick Actions */}
              <div className="hidden md:block rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
                <h3 className={`font-bold mb-3 ${isSenior ? 'text-base' : 'text-sm'}`}>{t('quickActions')}</h3>
                <div className="space-y-2">
                  {[
                    { label: t('findMentor'), icon: Users, onClick: () => setActiveTab('connect') },
                    { label: t('wisdomHub'), icon: BookOpen, onClick: () => setActiveTab('wisdom') },
                    { label: t('contribute'), icon: Mic2, onClick: () => navigateTo('/recording') },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'} bg-[#FBF9F6] text-stone-600 hover:bg-stone-100`}
                    >
                      <action.icon className="h-5 w-5" />
                      {action.label}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        )}

        {/* ========== CONNECT TAB (Find Mentor) ========== */}
        {activeTab === 'connect' && (
          <section className="mt-4 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`font-bold ${isSenior ? 'text-2xl' : 'text-xl'}`}>{t('findMentor')}</h2>
                <p className={`mt-1 ${isSenior ? 'text-base text-stone-500' : 'text-sm text-stone-400'}`}>{t('findMentorDesc')}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pending Connection Requests */}
            {pendingRequests.length > 0 && (
              <div className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
                <h3 className={`font-bold ${isSenior ? 'text-lg' : 'text-sm'}`}>{t('connectionRequests')}</h3>
                <div className="mt-3 space-y-3">
                  {pendingRequests.map((item) => (
                    <div key={item.connection_id} className="w-full rounded-2xl p-4 text-left flex justify-between items-center gap-3 bg-[#FBF9F6]">
                      <div className="min-w-0">
                        <p className={`truncate font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{item.display_name}</p>
                        <p className={`text-stone-500 font-normal ${isSenior ? 'text-sm' : 'text-[10px]'}`}>{item.identity === 'Senior' ? t('senior') : t('youth')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleAcceptConnection(item.connection_id)} className={`bg-brand-burgundy text-white px-4 py-2.5 rounded-xl font-bold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'}`}>
                          {t('accept')}
                        </button>
                        <button onClick={() => handleRejectConnection(item.connection_id)} className={`border px-4 py-2.5 rounded-xl font-bold min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'} border-stone-300 text-stone-600 hover:bg-stone-100`}>
                          {t('reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Connections / Browse by skill */}
            <div className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
              <h3 className={`font-bold ${isSenior ? 'text-lg' : 'text-sm'}`}>{t('suggestedConnections')}</h3>
              <p className={`mt-1 ${isSenior ? 'text-sm' : 'text-xs'} text-stone-500`}>{t('recommendations')}</p>
              {liveRecommendations.length === 0 ? (
                <div className="mt-6 text-center py-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-brand-burgundy">
                    <Users className="h-7 w-7" />
                  </div>
                  <p className={`mt-4 leading-relaxed ${isSenior ? 'text-base' : 'text-sm'} text-stone-500`}>
                    {t('noRecommendations')}
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {liveRecommendations.map((item) => (
                    <div key={item.id} className="w-full rounded-2xl p-4 text-left bg-[#FBF9F6]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className={`shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-burgundy font-bold text-white flex ${isSenior ? 'h-14 w-14 text-base' : 'h-11 w-11 text-sm'}`}>
                            {item.avatar_url ? (
                              <img src={item.avatar_url} alt={item.display_name} className="h-full w-full object-cover" />
                            ) : (
                              (item.display_name || 'U').slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`truncate font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{item.display_name}</p>
                            <p className={`font-normal ${isSenior ? 'text-sm' : 'text-[10px]'} text-stone-500`}>
                              {item.identity === 'Senior' ? t('senior') : t('youth')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-full px-3 py-1 font-bold ${isSenior ? 'text-xs' : 'text-[10px]'} bg-brand-burgundy/10 text-brand-burgundy`}>
                                {item.compatibility_score}% {t('compatibilityScore')}
                              </span>
                              {item.reciprocal && (
                                <span className={`rounded-full px-3 py-1 font-bold ${isSenior ? 'text-xs' : 'text-[10px]'} bg-emerald-50 text-emerald-700`}>
                                  {t('reciprocalMatch')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleConnect(item.id)} className={`shrink-0 rounded-xl bg-brand-burgundy px-5 py-3 font-bold text-white min-h-[44px] ${isSenior ? 'text-sm' : 'text-xs'}`}>
                          {t('connect')}
                        </button>
                      </div>
                      {(item.you_can_learn?.length > 0 || item.they_can_learn?.length > 0) && (
                        <div className={`mt-3 space-y-1 border-t pt-3 ${isSenior ? 'text-sm' : 'text-[10px]'} border-stone-200 text-stone-500`}>
                          {item.you_can_learn?.length > 0 && (
                            <p>
                              <span className="font-bold">{t('youCanLearn')}:</span>{' '}
                              {item.you_can_learn.join(', ')}
                            </p>
                          )}
                          {item.they_can_learn?.length > 0 && (
                            <p>
                              <span className="font-bold">{t('theyCanLearn')}:</span>{' '}
                              {item.they_can_learn.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========== WISDOM HUB TAB ========== */}
        {activeTab === 'wisdom' && (
          <section className="mt-4 space-y-5 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`font-bold ${isSenior ? 'text-2xl' : 'text-xl'}`}>{t('wisdomHub')}</h2>
                <p className={`mt-1 ${isSenior ? 'text-base text-stone-500' : 'text-sm text-stone-400'}`}>{t('wisdomHubDesc')}</p>
              </div>
              <button onClick={() => setActiveTab('home')} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Wisdom archive = feed items that are audio_archive type */}
            {filteredFeed.filter(item => item.type === 'audio_archive').length === 0 ? (
              <div className="rounded-3xl border border-dashed p-10 text-center border-stone-300 bg-white">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h2 className={`mt-4 font-bold ${isSenior ? 'text-lg' : 'text-base'}`}>{t('noWisdomYet')}</h2>
                <p className={`mx-auto mt-2 max-w-sm leading-relaxed ${isSenior ? 'text-base' : 'text-sm'} text-stone-500`}>
                  {t('noWisdomYetSub')}
                </p>
                <button onClick={() => navigateTo('/recording')} className={`mt-5 rounded-full bg-brand-burgundy px-6 py-3.5 font-bold text-white min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'}`}>
                  {t('contribute')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeed.filter(item => item.type === 'audio_archive').map((item) => (
                  <article key={item.id} className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center rounded-full bg-brand-burgundy font-bold text-white shrink-0 ${isSenior ? 'h-14 w-14 text-base' : 'h-11 w-11 text-sm'}`}>
                        {(item.author_name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{item.author_name || t('communityMember')}</p>
                        <p className={`text-stone-500 ${isSenior ? 'text-sm' : 'text-[11px]'}`}>{t('memoryArchive')}</p>
                      </div>
                    </div>
                    <p className={`mt-4 leading-relaxed whitespace-pre-wrap ${isSenior ? 'text-base' : 'text-sm'} text-stone-700`}>
                      {item.body || item.title}
                    </p>
                    {item.media_url && (
                      <div className="mt-4">
                        <audio src={item.media_url} controls className="w-full h-12 accent-brand-burgundy" />
                      </div>
                    )}
                    <div className={`mt-4 flex items-center gap-3 border-t pt-3 font-bold ${isSenior ? 'text-sm' : 'text-xs'} border-stone-100 text-stone-500`}>
                      <button className="flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] hover:bg-stone-100">
                        <Star className="h-5 w-5" />
                        {t('rate')}
                      </button>
                      <button className="flex items-center gap-2 rounded-full px-4 py-2.5 min-h-[44px] hover:bg-stone-100">
                        <Heart className="h-5 w-5" />
                        {t('like')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Bottom Mobile Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t px-2 pt-2 md:hidden border-stone-200 bg-white"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.action === 'connect' && activeTab === 'connect') ||
            (item.action === 'profile' && isProfileOpen) ||
            (!item.action && item.path === '/dashboard' && activeTab === 'home') ||
            (!item.action && item.path === location.pathname && item.path !== '/dashboard');
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 min-h-[52px] font-bold ${isSenior ? 'text-xs' : 'text-[10px]'} ${
                item.primary
                  ? 'bg-brand-burgundy text-white'
                  : isActive
                    ? 'text-brand-burgundy'
                    : 'text-stone-400'
              }`}
            >
              <Icon className="h-6 w-6" />
              {t(item.translationKey)}
            </button>
          );
        })}
      </nav>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-0 md:items-center md:justify-center md:p-6" onClick={(e) => { if (e.target === e.currentTarget) setIsProfileOpen(false); }}>
          <div className="w-full rounded-t-3xl p-6 shadow-xl md:max-w-sm md:rounded-3xl bg-white" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <ProfileAvatar size="h-18 w-18" interactive={false} />
                <div>
                  <h2 className={`font-bold ${isSenior ? 'text-xl' : 'text-lg'}`}>{displayName}</h2>
                  <p className={`${isSenior ? 'text-base' : 'text-sm'} text-stone-500`}>{appUser?.email}</p>
                  <p className={`mt-1 font-bold ${isSenior ? 'text-base' : 'text-xs'} text-brand-burgundy`}>{isSenior ? t('senior') : t('youth')}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-stone-100" aria-label="Close profile">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 bg-[#FBF9F6]">
                <p className={`uppercase tracking-wider text-stone-500 ${isSenior ? 'text-xs' : 'text-[10px]'}`}>{t('prefLanguage')}</p>
                <p className={`mt-1 font-bold ${isSenior ? 'text-base' : 'text-sm'}`}>{language === 'fr' ? 'Français' : 'English'}</p>
              </div>
              <div className="rounded-2xl p-4 bg-[#FBF9F6]">
                <p className={`uppercase tracking-wider text-stone-500 ${isSenior ? 'text-xs' : 'text-[10px]'}`}>{t('rootPoints')}</p>
                <p className={`mt-1 font-bold ${isSenior ? 'text-xl' : 'text-base'} text-brand-burgundy`}>{livePointsSummary?.totalPoints || 0}</p>
              </div>
              <div className="col-span-2 rounded-2xl p-4 bg-[#FBF9F6]">
                <p className={`uppercase tracking-wider text-stone-500 mb-2 ${isSenior ? 'text-xs' : 'text-[10px]'}`}>{t('earnedBadges')}</p>
                <BadgeDisplay badges={livePointsSummary?.badges || []} />
              </div>
            </div>
            <button onClick={signOut} className={`mt-5 w-full flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-bold min-h-[48px] ${isSenior ? 'text-base' : 'text-sm'} border-stone-200 text-stone-500 hover:bg-stone-50`}>
              <LogOut className="h-5 w-5" />
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
