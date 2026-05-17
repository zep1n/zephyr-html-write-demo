import React, { useState } from 'react';
import { EditorView } from './components/EditorView';
import { BrainstormSidebar } from './components/BrainstormSidebar';
import { LoginView } from './components/LoginView';
import { AppState, CompletionScope, SettingItem } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

const genId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // fallback
    }
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completionScope, setCompletionScope] = useState<CompletionScope>('paragraph');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [username, setUsername] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Global settings state for AI context
  const [settingsData, setSettingsData] = useState<Record<string, SettingItem[]>>({
    'AI 补充范围设置': [
      { id: 'sentence', name: '短句扩写', desc: '扩展当前的短句，增加细节。' },
      { id: 'paragraph', name: '段落丰满', desc: '丰富当前段落的描写内容。' },
      { id: 'continue', name: '延续下文', desc: '根据现有文本顺延剧情。' }
    ],
    '世界观设定': [
      { id: 'lore1', name: '主要环境', desc: "根据文本中的永久冻土和之前的设定，'卡伦-9号'的生存环境极其恶劣，目前处于与外界完全失联的孤立状态。" }
    ],
    '人物形象': [
      { id: 'char1', name: '阿里斯·索恩博士', desc: '严谨、冷静，面对极端环境展现出惊人的意志力，常隐瞒绝望的真相。' },
      { id: 'char2', name: '克拉克', desc: '年轻助理，经验不足，在压力下容易恐慌。' }
    ],
    '故事情节': [
      { id: 'plot1', name: '当前危机', desc: '卡伦-9号科研站与外界失联40天，物资匮乏。冻土层下传来的不明巨大震动打破了死寂，预示着未知的巨大威胁正在逼近...' }
    ],
    '添加设定与大纲': []
  });

  const handleApplyPrompt = (promptText: string) => {
    console.log("Applying prompt to editor context:", promptText);
    setInitialPrompt(promptText);
  };

  const handleLogin = (user: string) => {
    setUsername(user);
    setShowLoginModal(false);
  };

  const requireLogin = () => {
    if (!username) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  return (
    <div className="h-screen w-full bg-zinc-50 flex overflow-hidden text-zinc-900 font-sans select-none">
      <div className="flex-1 flex w-full h-full">
        <div className="flex-1 flex flex-col min-w-0 relative">
          <EditorView 
            initialPrompt={initialPrompt} 
            onOpenSidebar={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
            completionScope={completionScope}
            username={username}
            onLogout={() => setUsername('')}
            onRequireLogin={requireLogin}
            loreSettings={settingsData}
          />
        </div>
        <BrainstormSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onApplyPrompt={handleApplyPrompt}
          completionScope={completionScope}
          onScopeChange={setCompletionScope}
          onRequireLogin={requireLogin}
          settingsData={settingsData}
          onSettingsChange={setSettingsData}
        />
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
                id="close-login-modal"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <LoginView onLogin={handleLogin} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
