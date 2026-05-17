import { Send, FileText, Sparkles, MessageSquare, ChevronRight, X, Settings2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, CompletionScope, SettingItem } from '../types';

interface BrainstormSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (promptText: string) => void;
  completionScope: CompletionScope;
  onScopeChange: (scope: CompletionScope) => void;
  onRequireLogin: () => boolean;
  settingsData: Record<string, SettingItem[]>;
  onSettingsChange: React.Dispatch<React.SetStateAction<Record<string, SettingItem[]>>>;
}

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

const mockInitialChat: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'ai',
    text: "你好！我已读取当前的草稿内容。接下来你想探讨什么方向？\n你可以选择探讨剧情发展、世界观、人物形象、或是修改某段情节。我将根据现存资料为你提供具体的计划和选项：",
    options: [
      { label: '探讨剧情发展', prompt: '那阵嗡嗡声到底是什么？接下来会发生什么？' },
      { label: '展开世界观', prompt: '卡伦-9号的极寒环境和轨道阵列的背景设定' },
      { label: '深化人物形象', prompt: '完善阿里斯博士的心理侧写和她的绝望感' }
    ]
  }
];

const Accordion = ({ title, active, onClick, onSettingsClick, children }: any) => (
  <div className="border-b border-zinc-200/60 last:border-0">
    <div className="group/acc flex items-center w-full hover:bg-zinc-100 transition-colors pr-2">
      <button 
        onClick={onClick}
        className="flex-1 flex items-center justify-between pl-4 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500"
      >
        <span>{title}</span>
        <span className="mr-2">
          {active ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {onSettingsClick && (
        <button 
          onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
          className="p-1.5 text-zinc-400 hover:text-violet-600 rounded-md hover:bg-white border border-transparent hover:border-zinc-200 shadow-sm opacity-0 group-hover/acc:opacity-100 transition-all"
          title="管理设定"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    <AnimatePresence>
      {active && (
        <motion.div
           initial={{ height: 0, opacity: 0 }}
           animate={{ height: 'auto', opacity: 1 }}
           exit={{ height: 0, opacity: 0 }}
           className="overflow-hidden"
        >
          <div className="px-4 pb-4 bg-transparent text-xs leading-relaxed text-zinc-600">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export function BrainstormSidebar({ 
  isOpen, 
  onClose, 
  onApplyPrompt, 
  completionScope, 
  onScopeChange, 
  onRequireLogin, 
  settingsData, 
  onSettingsChange 
}: BrainstormSidebarProps) {
  const [loreMessages, setLoreMessages] = useState<ChatMessage[]>(mockInitialChat);
  const [suggestionMessages, setSuggestionMessages] = useState<ChatMessage[]>([{
    id: 'sugg-1', role: 'ai', text: '你好！这里是建议栏。你可以选中左侧的建议，点击"采用"或者向我提问关于这些建议的具体修改方案。'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('settings');
  const [activeTab, setActiveTab] = useState<'lore' | 'suggestions'>('lore');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [manageSetting, setManageSetting] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string, name: string, desc: string } | null>(null);

  const messages = activeTab === 'lore' ? loreMessages : suggestionMessages;
  const setMessages = activeTab === 'lore' ? setLoreMessages : setSuggestionMessages;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = { id: genId(), role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [...prev, {
        id: genId(),
        role: 'ai',
        text: activeTab === 'lore' 
           ? '收到你的方向，我为你制定了以下几个可行的计划供你选择或者直接应用：'
           : '了解，我将根据你的要求修改这段建议内容，你可以选择以下方向：',
        options: activeTab === 'lore' ? [
          { label: '展开环境描写', prompt: `在下文中详细描写 ${newMsg.text.split(' ').slice(0,3).join(' ')} 的具体外貌和它的破坏力` },
          { label: '深化心理活动', prompt: `增加一段内心独白，展现角色面对该情节时的无力感。` },
          { label: '引入突发事件', prompt: '引入一个新的角色或者意外事件来打破当前的僵局。' }
        ] : []
      }]);
    }, 1500);
  };

  const handleAdoptSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-[340px] border-l border-zinc-200 bg-white/95 backdrop-blur flex flex-col shrink-0 overflow-hidden shadow-2xl z-50 relative"
        >
          <div className="p-3 border-b border-zinc-200 shrink-0 bg-white/80 backdrop-blur z-10 flex items-center justify-between shadow-sm relative">
            <div className="flex bg-zinc-100 p-1 rounded-xl w-full mr-4 border border-zinc-200/50 shadow-inner">
              <button
                onClick={() => setActiveTab('lore')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'lore' 
                    ? 'bg-white/90 backdrop-blur-md shadow text-violet-600' 
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                情节与设定库
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'suggestions' 
                    ? 'bg-white/90 backdrop-blur-md shadow text-violet-600' 
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                建议
              </button>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0">
              <X className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>

          <div className="shrink-0 max-h-[45vh] overflow-y-auto bg-zinc-50/50 border-b border-zinc-200 shadow-sm scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {activeTab === 'suggestions' ? (
              <div className="p-4 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-white border border-violet-100 shadow-sm relative group cursor-pointer hover:border-violet-300 transition-all flex flex-col gap-3">
                  <div className="absolute -left-1 top-4 w-1 h-8 bg-violet-400 rounded-full"></div>
                  <div className="text-[10px] font-bold text-violet-500 uppercase tracking-tighter">内容建议</div>
                  <p className="text-xs leading-relaxed text-zinc-600">考虑将这种嗡嗡声的描写更贴近角色体验，以增强眼前的紧张感，而不是首先关注环境。</p>
                  <button 
                    onClick={() => handleAdoptSuggestion("考虑将这种嗡嗡声的描写更贴近角色体验，以增强眼前的紧张感，而不是首先关注环境。")}
                    className="self-end text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors mt-2"
                  >
                    采用建议
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Accordion title="AI 补充范围设置" active={activeAccordion === 'settings'} onClick={() => setActiveAccordion(a => a === 'settings' ? null : 'settings')} onSettingsClick={() => { setManageSetting('AI 补充范围设置'); setEditingItem(null); }}>
                  <div className="flex flex-col gap-3 pt-2">
                    {settingsData['AI 补充范围设置'].map(item => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" name="scope" value={item.id} checked={completionScope === item.id} onChange={() => onScopeChange(item.id)} className="accent-violet-500 w-3 h-3 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-700 group-hover:text-violet-600 transition-colors">{item.name}</span>
                          <span className="text-[10px] text-zinc-400 leading-tight">{item.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </Accordion>
                
                <Accordion title="世界观设定" active={activeAccordion === 'lore'} onClick={() => setActiveAccordion(a => a === 'lore' ? null : 'lore')} onSettingsClick={() => { setManageSetting('世界观设定'); setEditingItem(null); }}>
                  <ul className="space-y-2 italic text-zinc-500 list-disc pl-4 hover:marker:text-violet-400">
                    {settingsData['世界观设定'].map(item => (
                      <li key={item.id}><strong className="font-semibold text-zinc-700 not-italic">{item.name}：</strong>{item.desc}</li>
                    ))}
                  </ul>
                </Accordion>
                
                <Accordion title="人物形象" active={activeAccordion === 'characters'} onClick={() => setActiveAccordion(a => a === 'characters' ? null : 'characters')} onSettingsClick={() => { setManageSetting('人物形象'); setEditingItem(null); }}>
                  <ul className="space-y-2 italic text-zinc-500 list-disc pl-4 hover:marker:text-violet-400">
                    {settingsData['人物形象'].map(char => (
                      <li key={char.id}><strong className="font-semibold text-zinc-700 not-italic">{char.name}：</strong>{char.desc}</li>
                    ))}
                  </ul>
                </Accordion>
                
                <Accordion title="故事情节" active={activeAccordion === 'plot'} onClick={() => setActiveAccordion(a => a === 'plot' ? null : 'plot')} onSettingsClick={() => { setManageSetting('故事情节'); setEditingItem(null); }}>
                  <ul className="space-y-2 italic text-zinc-500 list-disc pl-4 hover:marker:text-violet-400">
                    {settingsData['故事情节'].map(item => (
                      <li key={item.id}><strong className="font-semibold text-zinc-700 not-italic">{item.name}：</strong>{item.desc}</li>
                    ))}
                  </ul>
                </Accordion>
                
                <Accordion title="添加设定与大纲" active={activeAccordion === 'upload'} onClick={() => setActiveAccordion(a => a === 'upload' ? null : 'upload')} onSettingsClick={() => { setManageSetting('添加设定与大纲'); setEditingItem(null); }}>
                  {settingsData['添加设定与大纲'].length > 0 ? (
                    <ul className="space-y-2 italic text-zinc-500 list-disc pl-4 hover:marker:text-violet-400 mb-4">
                      {settingsData['添加设定与大纲'].map(item => (
                        <li key={item.id}><strong className="font-semibold text-zinc-700 not-italic">{item.name}：</strong>{item.desc}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div onClick={() => { setManageSetting('添加设定与大纲'); setEditingItem({ id: crypto.randomUUID(), name: '', desc: '' }); }} className="py-6 rounded-xl border border-dashed border-zinc-300 hover:border-violet-300 hover:bg-violet-50/50 transition-colors cursor-pointer group text-center mt-2 flex flex-col items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-300 group-hover:text-violet-400" />
                    <p className="font-medium text-zinc-500 group-hover:text-violet-600 text-[10px] uppercase tracking-wider">点击添加设定或大纲条目</p>
                  </div>
                </Accordion>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-white/50 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[92%] shadow-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white py-2.5 px-4 rounded-2xl rounded-tr-none text-[12px]' : 'bg-white border border-zinc-200 text-[12px] text-zinc-700 py-3 px-4 rounded-2xl rounded-tl-none'}`}>
                  {msg.role === 'ai' && <Sparkles className="w-3.5 h-3.5 mb-2 text-violet-500" />}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col gap-2">
                      {msg.options.map((opt, i) => (
                        <div key={i} className="flex flex-col p-2.5 bg-zinc-50 rounded-lg hover:bg-violet-50 hover:border-violet-100 transition-colors border border-transparent cursor-pointer group shadow-sm" onClick={() => {
                            onApplyPrompt(opt.prompt);
                        }}>
                          <div className="font-bold text-xs text-violet-700 mb-1">{opt.label}</div>
                          <p className="text-zinc-600 mb-1.5 leading-snug">{opt.prompt}</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>应用到编辑器</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="p-4 bg-white border border-zinc-200 rounded-2xl rounded-tl-none shadow-sm">
                  <span className="flex gap-1.5">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full"></motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full"></motion.span>
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full"></motion.span>
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-zinc-200 bg-white shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="询问关于剧情、人物的发展..."
                className="w-full bg-zinc-100 border border-transparent rounded-full py-3 px-4 pr-10 text-[11px] outline-none focus:bg-white focus:border-violet-200 focus:ring-2 focus:ring-violet-50 transition-all text-zinc-900 placeholder:text-zinc-400 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center disabled:bg-zinc-200 disabled:text-zinc-400 text-white transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.aside>
      )}

      {/* Manage Setting Modal */}
      {manageSetting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setManageSetting(null)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-800 tracking-tight">管理配置: {manageSetting}</h3>
              <button onClick={() => setManageSetting(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-col gap-4">
                {editingItem ? (
                   <div className="flex flex-col gap-3">
                     <input 
                       value={editingItem.name}
                       onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                       placeholder="项目名称"
                       className="w-full border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-violet-300 transition-colors"
                     />
                     <textarea 
                       value={editingItem.desc}
                       onChange={e => setEditingItem({ ...editingItem, desc: e.target.value })}
                       placeholder="详细描述设定..."
                       className="w-full h-32 border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-violet-300 resize-none transition-colors"
                     />
                     <div className="flex justify-end gap-2 mt-2">
                       <button onClick={() => setEditingItem(null)} className="px-4 py-1.5 hover:bg-zinc-100 rounded-lg text-sm text-zinc-600 font-medium transition-colors">取消</button>
                       <button onClick={() => {
                         if (!editingItem.name.trim()) return;
                         onSettingsChange(prev => ({
                           ...prev,
                           [manageSetting]: prev[manageSetting].some(c => c.id === editingItem.id)
                             ? prev[manageSetting].map(c => c.id === editingItem.id ? editingItem : c)
                             : [...prev[manageSetting], editingItem]
                         }));
                         setEditingItem(null);
                       }} className="px-4 py-1.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled={!editingItem.name.trim()}>保存</button>
                     </div>
                   </div>
                ) : (
                  <>
                    {(settingsData as any)[manageSetting]?.map((item: any) => (
                      <div key={item.id} className="group p-3 border border-zinc-100 rounded-xl hover:border-violet-200 cursor-pointer shadow-sm hover:shadow" onClick={() => setEditingItem(item)}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-zinc-800 text-sm">{item.name}</span>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            onSettingsChange(prev => ({ ...prev, [manageSetting]: prev[manageSetting].filter(c => c.id !== item.id) }));
                          }} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 -m-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">{item.desc}</p>
                      </div>
                    ))}
                    {(settingsData as any)[manageSetting]?.length === 0 && (
                      <div className="text-center py-6 text-zinc-400 text-xs">暂无内容，点击下方新增。</div>
                    )}
                    <button 
                      onClick={() => setEditingItem({ id: crypto.randomUUID(), name: '', desc: '' })}
                      className="p-3 border border-dashed border-zinc-300 rounded-xl text-zinc-500 text-sm font-medium hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600 flex items-center justify-center transition-colors"
                    >
                      + 新增配置项
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
