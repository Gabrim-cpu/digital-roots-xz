import React, { useState } from 'react';
import { 
  Home, 
  MessageSquare, 
  Library, 
  Award, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  Plus, 
  Menu, 
  X, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../Assets/logo XZ.png';

export default function Dashboard() {
  const { appUser, signOut } = useAuth();
  
  // Mobile Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Interactive States for Buttons/Actions
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState({});
  const [activeTab, setActiveTab] = useState('Home');

  const handleToggleAdd = (id) => {
    setAddedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Messages', icon: MessageSquare },
    { name: 'WISDOM HUB', icon: Library },
    { name: 'Mentorship', icon: Award },
    { name: 'Settings', icon: Settings },
  ];

  const displayName = appUser?.display_name || appUser?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-white flex relative" style={{ fontFamily: '"Montserrat", sans-serif' }}>
      
      {/* Mobile Header Top-Bar (Only displays on small screens) */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 p-4 flex justify-between items-center fixed top-0 left-0 z-30">
        <div className="flex items-center gap-3">
          <img src={logo} alt="XZ logo" className="w-10 h-auto" />
          <div>
            <h1 className="text-lg font-bold tracking-wide text-red-900" style={{ fontFamily: '"Poppins", sans-serif' }}>WISDOM HUB</h1>
            <p className="text-[9px] uppercase tracking-wider text-gray-400">Bridging Generations</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        w-64 bg-white border-r border-gray-200/60 p-6 flex flex-col justify-between fixed h-full z-20 
        transition-transform duration-300 ease-in-out
        md:translate-x-0 pt-20 md:pt-6
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          <div className="hidden md:flex items-center gap-3">
            <img src={logo} alt="XZ logo" className="w-12 h-auto" />
            <div>
              <h1 className="text-xl font-bold tracking-wide text-red-900" style={{ fontFamily: '"Poppins", sans-serif' }}>WISDOM HUB</h1>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Bridging Generations</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsSidebarOpen(false); // Close mobile drawer on select
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive 
                      ? 'bg-red-50 text-red-900 shadow-sm border border-red-100/50' 
                      : 'text-gray-500 hover:bg-gray-100/60'
                  }`}
                >
                  <Icon className="w-4 h-4"/> {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <button 
          onClick={() => alert('Initiating a connection sequence...')}
          className="w-full bg-red-900 text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:bg-red-950 transition-all mt-8"
        >
          <Plus className="w-4 h-4"/> New Connection
        </button>
      </aside>

      {/* Backdrop for Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 p-4 sm:p-8 max-w-5xl pt-24 md:pt-8 w-full overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
            <input 
              type="text" 
              placeholder="Search wisdom..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-red-900/20 transition-all" 
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <div className="bg-red-50 text-red-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600解决方案 animate-pulse"></span> 1,240 XP
            </div>
            <div className="flex items-center gap-4">
              <div onClick={() => alert('No new notifications')} className="relative cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-all">
                <Bell className="w-5 h-5 text-gray-600"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-white"></span>
              </div>
              <HelpCircle onClick={() => alert('Help center module coming soon!')} className="w-5 h-5 text-gray-600 cursor-pointer hover:text-red-900 transition-all" />
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm" 
              />
            </div>
          </div>
        </header>

        {/* Welcome Block */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Welcome back, {displayName}
          </h2>
          <p className="text-gray-400 italic text-xs sm:text-sm mt-1">
            "Wisdom is the reward you get for a lifetime of listening."
          </p>
        </div>

        {/* Dynamic Top Grid Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Main Hero Card */}
          <div className="md:col-span-2 bg-red-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
            <div className="space-y-2 z-10">
              <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded font-semibold tracking-wider">Mentorship</span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: '"Poppins", sans-serif' }}>I Teach</h3>
              <p className="text-xs text-white/70 max-w-xs leading-relaxed">Share your lifetime of experience with a new generation seeking guidance and grounding.</p>
            </div>
            <div className="flex justify-between items-center mt-6 z-10">
              <button 
                onClick={() => alert('Routing to Student Workspace...')}
                className="bg-white text-red-900 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                Manage Students &rarr;
              </button>
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-red-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Student" />
                <img className="w-7 h-7 rounded-full border-2 border-red-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Student" />
                <div className="w-7 h-7 bg-red-800 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-red-900 text-white">+4</div>
              </div>
            </div>
            {/* Absolute Background Graphics (Hidden neatly on mobile viewports if cramped) */}
            <div className="hidden sm:flex absolute right-0 bottom-0 top-0 w-1/3 bg-black/10 flex-col gap-1 p-2 justify-center origin-bottom rotate-12 translate-x-4">
              <div className="h-6 bg-white/5 rounded-md"></div>
              <div className="h-6 bg-white/5 rounded-md"></div>
              <div className="h-6 bg-white/5 rounded-md"></div>
            </div>
          </div>

          {/* Side Module Info */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[200px]">
            <div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>I Learn</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">Explore new perspectives from the digital native generation. Stay curious, stay young.</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100 my-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">💻</div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Modern Tech 101</h4>
                <p className="text-[10px] text-gray-400">Upcoming: Tuesday, 4 PM</p>
              </div>
            </div>
            <button 
              onClick={() => alert('Opening workshop directory...')}
              className="w-full bg-gray-100 text-gray-700 text-xs py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Browse Workshops
            </button>
          </div>
        </div>

        {/* Analytical Middle Content Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
            <h3 className="text-sm font-bold tracking-wide text-gray-400 uppercase">Archive Pulse</h3>
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Stories Shared</span>
                <span className="text-2xl font-bold text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Global Impact</span>
                <span className="text-xl font-bold text-red-900" style={{ fontFamily: '"Poppins", sans-serif' }}>High</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-500 font-medium">Mentor Score</span>
                <span className="text-xl font-bold text-gray-900">4.9<span className="text-xs text-gray-400 font-normal">/5</span></span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>Recommended for You</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Loading recommendations...'); }} className="text-xs text-red-700 font-semibold hover:underline">See all</a>
            </div>
            <div className="space-y-4">
              {/* Rec Item 1 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-sm shrink-0">🌐</div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">Navigating Digital Landscapes</h4>
                    <p className="text-[10px] text-gray-400 flex flex-wrap items-center gap-1 mt-0.5">
                      <span>Tools...</span>
                      <span className="uppercase text-[8px] bg-gray-100 px-1 py-0.5 rounded font-semibold text-gray-500">Technology</span> 
                      <span>• 45 mins</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAdd('item1')}
                  className={`w-7 h-7 border rounded-full flex items-center justify-center shrink-0 transition-all ${
                    addedItems['item1'] ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-200 text-gray-400 hover:border-red-900 hover:text-red-900'
                  }`}
                >
                  {addedItems['item1'] ? <Check className="w-3.5 h-3.5" /> : '+'}
                </button>
              </div>

              {/* Rec Item 2 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center text-white text-sm shrink-0">📜</div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">The Art of Oral History</h4>
                    <p className="text-[10px] text-gray-400 flex flex-wrap items-center gap-1 mt-0.5">
                      <span>Techniques...</span>
                      <span className="uppercase text-[8px] bg-gray-100 px-1 py-0.5 rounded font-semibold text-gray-500">Legacy</span> 
                      <span>• 60 mins</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAdd('item2')}
                  className={`w-7 h-7 border rounded-full flex items-center justify-center shrink-0 transition-all ${
                    addedItems['item2'] ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-200 text-gray-400 hover:border-red-900 hover:text-red-900'
                  }`}
                >
                  {addedItems['item2'] ? <Check className="w-3.5 h-3.5" /> : '+'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Accent Promo CTA */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 w-full sm:flex-1">
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>Your legacy is waiting.</h3>
            <p className="text-xs text-gray-400 max-w-md leading-relaxed">Every story you tell is a bridge to someone's future. Our newest archival tools allow you to record and tag your memories for the next generation.</p>
            <div className="flex items-center gap-4 pt-2">
              <button onClick={() => alert('Opening Archive Panel...')} className="bg-red-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-red-950 transition-all">
                Open The Archive
              </button>
              <button onClick={() => alert('Loading documentation...')} className="text-xs text-red-900 font-bold hover:underline">
                Learn more
              </button>
            </div>
          </div>
          <div className="w-full sm:w-44 h-28 bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
            <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300')]"></div>
          </div>
        </div>
      </main>
    </div>
  );
}