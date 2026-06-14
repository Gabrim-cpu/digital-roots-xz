import React, { useState } from 'react';
import { BookOpen, Users, Eye, ArrowRight } from 'lucide-react';

export default function Login() {
  const [identity, setIdentity] = useState('Senior');

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 font-sans">
      {/* Left Branding Panel */}
      <div className="md:col-span-5 bg-brand-burgundy p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="text-2xl font-serif tracking-wide"></div>
        
        <div className="relative z-10 my-auto">
          <h1 className="text-4xl font-bold leading-tight max-w-sm">
            Passing on <span className="text-brand-roseMuted opacity-90">Knowledge</span>, nurturing the bond.
          </h1>
          {/* Subtle Watermark Stylized Icon */}
          <div className="absolute -left-10 top-20 text-[18rem] font-serif opacity-5 pointer-events-none select-none">
            ⏳
          </div>
        </div>

        <div className="italic text-sm opacity-80 max-w-xs space-y-1">
          <p>Every generation has something to teach.</p>
          <p>Every generation has something to learn.</p>
          <p className="font-semibold not-italic mt-2 text-brand-roseMuted">XZ is where those lessons meet</p>
        </div>
        
        {/* Pagination Dots Indicator */}
        <div className="flex gap-2 mt-6">
          <span className="w-6 h-1 bg-white rounded-full"></span>
          <span className="w-2 h-1 bg-white/40 rounded-full"></span>
          <span className="w-2 h-1 bg-white/40 rounded-full"></span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="md:col-span-7 bg-white p-8 md:p-24 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-serif text-brand-darkText">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Continue your intergenerational journey.</p>
          </div>

          {/* Identity Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Choose your identity</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIdentity('Senior')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  identity === 'Senior'
                    ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Senior</span>
              </button>
              <button
                onClick={() => setIdentity('Youth')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  identity === 'Youth'
                    ? 'border-brand-burgundy bg-brand-burgundy text-white shadow-md'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Youth</span>
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Email Address</label>
              <input 
                type="email" 
                placeholder="name@archive.com" 
                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-burgundy"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-500">Password</label>
                <a href="#" className="text-xs text-brand-burgundy font-medium hover:underline">Forgot password?</a>
              </div>
              <div className="relative mt-1">
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-burgundy"
                />
                <Eye className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-2">
            <button className="w-full bg-brand-burgundy text-white py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all">
              Enter The Archive <ArrowRight className="w-4 h-4" />
            </button>
            
            <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.216 1.744 15.44 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.897 0 11.82-4.154 11.82-12.03 0-.816-.088-1.427-.197-2.165H12.24z"/></svg>
              Sign in with Google
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            New to our community? <a href="#" className="text-brand-burgundy font-semibold hover:underline">Create an account</a>
          </div>

          <div className="text-center text-[10px] text-gray-400 tracking-widest uppercase pt-4">
            Secure Encryption • Editorial Access v2.4
          </div>
        </div>
      </div>
    </div>
  );
}