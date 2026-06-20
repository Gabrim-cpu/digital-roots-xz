import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  Home,
  Library,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic2,
  Plus,
  Search,
  Send,
  Settings,
  User,
  Video,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../Assets/logo XZ.png';

const navItems = [
  { name: 'Feed', icon: Home, path: '/dashboard' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
  { name: 'Create', icon: Plus, path: '/recording', primary: true },
  { name: 'Library', icon: Library, path: '/recording' },
  { name: 'Live', icon: Video, path: '/call' },
];

export default function Dashboard({ feed = [], recommendations = [], pointsSummary }) {
  const { appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composerText, setComposerText] = useState('');
  const [localFeed, setLocalFeed] = useState(feed);

  const displayName = appUser?.display_name || appUser?.email?.split('@')[0] || 'User';
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

  const publishLocalPost = () => {
    const body = composerText.trim();
    if (!body) return;
    setLocalFeed((prev) => [
      {
        id: `local-${Date.now()}`,
        type: 'post',
        author_name: displayName,
        body,
        created_at: new Date().toISOString(),
        localOnly: true,
      },
      ...prev,
    ]);
    setComposerText('');
  };

  const navigateTo = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  const ProfileAvatar = ({ size = 'h-10 w-10', interactive = true }) => {
    const className = `${size} shrink-0 overflow-hidden rounded-full bg-brand-burgundy text-sm font-bold text-white ring-2 ring-white`;
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

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-20 text-stone-900 md:pb-0" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="rounded-full p-2 hover:bg-stone-100" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigateTo('/dashboard')} className="flex items-center gap-2">
            <img src={logo} alt="Digital Roots" className="h-8 w-auto" />
            <span className="text-sm font-bold text-brand-burgundy">Digital Roots</span>
          </button>
          <ProfileAvatar />
        </div>
      </header>

      <aside className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col justify-between border-r border-stone-200 bg-white p-5 transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between">
            <button onClick={() => navigateTo('/dashboard')} className="flex items-center gap-3 text-left">
              <img src={logo} alt="Digital Roots" className="h-11 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-brand-burgundy">Digital Roots</h1>
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">Community PWA</p>
              </div>
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="rounded-full p-2 hover:bg-stone-100 md:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <button onClick={() => setIsProfileOpen(true)} className="mt-7 flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-[#FBF9F6] p-4 text-left">
            <ProfileAvatar size="h-12 w-12" interactive={false} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="text-[11px] text-stone-500">{appUser?.identity || 'Community member'}</p>
            </div>
          </button>

          <nav className="mt-7 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path && !item.primary;
              return (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.path)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-brand-burgundy text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <button onClick={signOut} className="text-xs font-semibold text-stone-400 hover:text-brand-burgundy">
          Sign out
        </button>
      </aside>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/25 md:hidden" />}

      <main className="mx-auto max-w-6xl px-4 py-4 md:ml-72 md:px-8 md:py-6">
        <div className="hidden items-center justify-between md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search your feed, library, and connections"
              className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-burgundy"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-stone-200 bg-white p-3">
              <Bell className="h-4 w-4 text-stone-600" />
            </button>
            <button onClick={() => navigateTo('/messages')} className="rounded-full bg-brand-burgundy px-4 py-3 text-sm font-bold text-white">
              Message
            </button>
            <ProfileAvatar />
          </div>
        </div>

        <section className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <ProfileAvatar />
                <div className="min-w-0 flex-1">
                  <textarea
                    value={composerText}
                    onChange={(event) => setComposerText(event.target.value)}
                    placeholder="Create a post for the community feed..."
                    className="min-h-24 w-full resize-none rounded-3xl border border-stone-200 bg-[#FBF9F6] p-4 text-sm outline-none focus:border-brand-burgundy"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button onClick={() => navigateTo('/recording')} className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600">
                        <Mic2 className="h-4 w-4" />
                        Story
                      </button>
                      <button onClick={() => navigateTo('/call')} className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600">
                        <Video className="h-4 w-4" />
                        Live
                      </button>
                    </div>
                    <button onClick={publishLocalPost} disabled={!composerText.trim()} className="rounded-full bg-brand-burgundy px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40">
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filteredFeed.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-brand-burgundy">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-bold">Your feed is ready for real content</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
                  Connect `/feed` and `/recommendations` to MongoDB + Redis. Posts, stories, and ranked recommendations will render here.
                </p>
                <button onClick={() => navigateTo('/recording')} className="mt-5 rounded-full bg-brand-burgundy px-5 py-3 text-xs font-bold text-white">
                  Upload first story
                </button>
              </div>
            ) : (
              filteredFeed.map((item) => (
                <article key={item.id} className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-burgundy text-sm font-bold text-white">
                      {(item.author_name || 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.author_name || 'Community member'}</p>
                      <p className="text-[11px] text-stone-500">{item.type || 'post'}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-stone-700">{item.body || item.title}</p>
                  {item.media_url && <img src={item.media_url} alt="" className="mt-4 aspect-[9/16] max-h-[520px] w-full rounded-3xl object-cover" />}
                  <div className="mt-4 flex items-center gap-3 border-t border-stone-100 pt-3 text-xs font-bold text-stone-500">
                    <button className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-stone-100">
                      <MessageCircle className="h-4 w-4" />
                      Comment
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-stone-100">
                      <Send className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold">Root Points</h3>
              <p className="mt-1 text-xs text-stone-500">Connect the Point Service to show balances, badges, and daily limits.</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#FBF9F6] p-3">
                  <p className="text-lg font-bold text-brand-burgundy">{pointsSummary?.balance ?? 0}</p>
                  <p className="text-[10px] text-stone-500">Points</p>
                </div>
                <div className="rounded-2xl bg-[#FBF9F6] p-3">
                  <p className="text-lg font-bold text-brand-burgundy">{pointsSummary?.badges ?? 0}</p>
                  <p className="text-[10px] text-stone-500">Badges</p>
                </div>
                <div className="rounded-2xl bg-[#FBF9F6] p-3">
                  <p className="text-lg font-bold text-brand-burgundy">{pointsSummary?.rank ?? '-'}</p>
                  <p className="text-[10px] text-stone-500">Rank</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold">Recommendations</h3>
              {recommendations.length === 0 ? (
                <p className="mt-2 text-xs leading-relaxed text-stone-500">
                  `/recommendations` can return connection suggestions once your ranking engine is online.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {recommendations.map((item) => (
                    <button key={item.id} className="w-full rounded-2xl bg-[#FBF9F6] p-3 text-left text-sm font-bold">
                      {item.title || item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-stone-200 bg-white px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path && !item.primary;
          return (
            <button
              key={item.name}
              onClick={() => navigateTo(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-bold ${
                item.primary ? 'bg-brand-burgundy text-white' : isActive ? 'text-brand-burgundy' : 'text-stone-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-0 md:items-center md:justify-center md:p-6">
          <div className="w-full rounded-t-[2rem] bg-white p-5 shadow-xl md:max-w-sm md:rounded-[2rem]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <ProfileAvatar size="h-16 w-16" />
                <div>
                  <h2 className="text-lg font-bold">{displayName}</h2>
                  <p className="text-sm text-stone-500">{appUser?.email}</p>
                  <p className="mt-1 text-xs font-bold text-brand-burgundy">{appUser?.identity || 'Community member'}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="rounded-full p-2 hover:bg-stone-100" aria-label="Close profile">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[#FBF9F6] p-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Language</p>
                <p className="mt-1 font-bold">{appUser?.language || 'Not set'}</p>
              </div>
              <div className="rounded-2xl bg-[#FBF9F6] p-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Root Points</p>
                <p className="mt-1 font-bold">{appUser?.root_points || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
