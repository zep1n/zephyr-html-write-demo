import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        onLogin(username);
      }, 1500);
    }
  };

  return (
    <div className="w-full bg-white flex flex-col items-center flex-1">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full p-10 flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-violet-100/50">
          <Sparkles className={`w-8 h-8 text-violet-500 ${isSyncing ? 'animate-pulse' : ''}`} />
        </div>
        <h1 className="font-serif text-3xl text-zinc-800 mb-2 font-bold tracking-tight text-center">登录灵源创作</h1>
        <p className="text-zinc-500 text-sm mb-8 text-center text-balance px-4 leading-relaxed tracking-wide">
          登录以使用强大的 AI 辅助生成功能，并与云端同步你的大纲、世界观与草稿库。
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSyncing}
              placeholder="输入任意用户名"
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3.5 outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-medium disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSyncing}
              placeholder="随便输入即可体验"
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3.5 outline-none focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 transition-all text-sm font-medium disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || isSyncing}
            className="w-full mt-2 bg-zinc-900 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold tracking-widest text-sm focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors shadow-md"
          >
            {isSyncing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                同步大纲与设定中...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                登录并同步数据
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
