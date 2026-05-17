// ... other imports
import { Sparkles, MessageSquare, PanelRightOpen, ArrowRight, Wand2, GripVertical, Settings2, Plus, X, Folder, File, ChevronDown, ChevronRight, Trash2, LogOut, User, Download, Edit2, Share, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Block, CompletionScope, AIFocusOption, FileNode, SettingItem } from '../types';

const mockFileTree: FileNode[] = [
  {
    id: 'proj-1',
    name: '寂静的苔原',
    type: 'project',
    isOpen: true,
    children: [
      {
        id: 'folder-1',
        name: '设定集',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 'file-1', name: '人物设定', type: 'file' },
          { id: 'file-2', name: '卡伦-9号环境', type: 'file' }
        ]
      },
      { id: 'file-3', name: '第1章', type: 'file' },
      { id: 'file-4', name: '第4章', type: 'file' }
    ]
  },
  {
    id: 'proj-2',
    name: '赛博朋克深渊',
    type: 'project',
    children: [
      { id: 'file-5', name: '前传1', type: 'file' }
    ]
  }
];

interface EditorViewProps {
  initialPrompt: string;
  onOpenSidebar: () => void;
  sidebarOpen: boolean;
  completionScope: CompletionScope;
  username: string;
  onLogout: () => void;
  onRequireLogin: () => boolean;
  loreSettings: Record<string, SettingItem[]>;
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

const defaultAIFocusOptions: AIFocusOption[] = [
  { id: 'narrative', label: '叙事节奏', prompt: '侧重于故事流的自然衔接和事件的合理发展。' },
  { id: 'creative', label: '创意补充', prompt: '侧重于引入新奇的设定或出人意料的情节转折。' },
];

const generateMockContent = (prompt: string): Block[] => [

  { id: 'b1', type: 'h1', text: '卡伦-9号的寂静' },
  { id: 'b2', type: 'p', text: '卡伦-9号上的风并没有呼啸；它只有低语，在栖息地的加压外壳上发出干燥、刺耳的摩擦声。阿里斯·索恩博士将手按在观察口上，感受着绝对零度的寒意渗入多层玻璃。' },
  { id: 'b3', type: 'p', text: '距离轨道阵列的最后一次传输已经过去了四十天。[keyword: 极度孤独，物资减少]。他们在此外环边缘完全孤立无援。' },
  { id: 'b4', type: 'p', text: '“氧气循环系统还能撑多久？”年轻的助理研究员克拉克打破了舱内的死寂，他的声音带着无法掩饰的颤抖。' },
  { id: 'b5', type: 'p', text: '阿里斯没有回头，只是在玻璃上留下了一团模糊的白气。“如果备用蓄电池不结冰的话，还能撑三周。”其实她在撒谎，真实数据不到七天。' },
  { id: 'b6', type: 'p', text: '突然，一阵低频的嗡嗡声穿透地板振动，将一个无菌玻璃烧杯从检查台上震落。这不是地震。这个星球没有熔融的内核。有别的东西在永久冻土下移动。', proactiveSuggestion: { id: 's1', text: '建议：考虑将这种嗡嗡声的描写更贴近角色体验，以增强眼前的紧张感，而不是首先关注环境。' } },
  { id: 'b7', type: 'p', text: '震动逐渐变得规律，像是某种庞大生物的心跳。警报器的红光开始在金属舱壁上疯狂闪烁，映照出两人苍白的脸庞。' },
  { id: 'b8', type: 'p', text: '“它在靠近，对吗？”克拉克后退了两步，撞倒了一排标本架。[keyword: 恐惧蔓延，未知巨物]。' },
  { id: 'b9', type: 'p', text: '阿里斯走近控制台，手指飞快地在结霜的键盘上敲击。声呐探测仪屏幕上，一个比整个极地栖息地还要庞大十倍的阴影，正从冰层深处缓慢上浮。' }
];

const generatePRDContent = (): Block[] => [
  { id: genId(), type: 'h1', text: '产品需求文档 (PRD): 智能故事创作辅助系统' },
  { id: genId(), type: 'p', text: '本文档详细阐述了当前“智能故事创作辅助系统”的各项模块和功能机制。该系统利用先进AI技术，在富文本编辑器内无缝融合跨段落推演、多维度AI定制和背景设定库，提高创作者的故事构思与写作效率。' },
  
  { id: genId(), type: 'h2', text: '一、 文件管理系统 (File Management System)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>系统左侧提供文件和文件夹树状管理能力。支持直接节点新建、重命名、删除及使用递归结构克隆副本（副本机制）。内建多个“章节”文稿间的切换逻辑，各文档内部自带独立修改栈记录。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>通过左侧边栏悬浮或者点击对应加号，在工作区快速拉起新文稿，拖拽可调整结构。右键可激活复制及删除，支持双击重命名。<br/><b>为什么要用：</b>为长篇创作提供组织基础，避免多文件切换导致的思路中断，克隆机制（副本）特别适合在尝试不同剧情走向时“存档”，不怕把主线写坏。' },
  
  { id: genId(), type: 'h2', text: '二、 文本编辑交互系统 (Block-Based Editor)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>编辑器采用极简设计，抛弃冗余按钮，采用Block（段块）隔离管理与渲染架构(基于contenteditable)。用户可直接回车划分新段落或使用Backspace合并撤销。通过快捷键与手势结合（如 ctrl+z/ctrl+y）拥有重做撤回保护栈。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>完全贴合日常打字习惯。像使用传统记事本一样自然，所有的AI能力被“藏”在了选中状态和Tab键里。<br/><b>为什么要用：</b>相较于传统富文本的沉重感，该架构能让作者沉浸于单纯的文字当中。撤回机制则能提供容错能力，降低创作焦虑。' },

  { id: genId(), type: 'h2', text: '三、 AI 使用与交互系统 (AI Interaction & Completion)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b><br/>1. <b>AI Tab 补写</b>: 创作者在段落结尾或选中特定文本时，可按下Tab快捷触发后台上下文智能推演(Magic Autocomplete)，系统在模拟请求后向当前光标流入新内容，并辅以Glow霓虹视觉。<br/>2. <b>划词魔法编辑</b>: 选中文本后，编辑器内自动定位弹出"沉浸式浮动交互条"或鼠标快捷菜单。用户可直接要求如"缩短段落"、"扩写场景"，或手打类似"让环境显得更冷清"等提示词，一键完成本段替换。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>写作卡壳时，轻敲Tab键，AI会根据前文衔接生成下文。想精修某一段落时，用鼠标划选该段，在弹出的面板中点击“扩写”或输入具体指令。<br/><b>为什么要用：</b>打破“面对空白文档的恐惧”。Tab补写用于推进剧情进展；魔法编辑则负责“精修润色”，把干瘪的大纲骨架充实为血肉丰满的文字。' },

  { id: genId(), type: 'h2', text: '四、 AI 侧重系统 (AI Focus System)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>右下角呼出"AI 侧重菜单"，供用户调节AI推演的大方向（例如切换到"侧重叙事节奏"或"注重创意灵感"）。系统还提供一个AI对话机器人（Chat），可以通过简短的交流总结出全新的"侧重Prompt"。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>当你进入需要大段动作戏的段落时，可以在右下角将侧重切换为“动作特写”。若默认选项不满足，点击“使用AI帮你生成”，输入“帮我写点更悬疑的”，AI会自动帮你提炼出一段聚焦悬疑感的Prompt，并应用到你的全局补写中。<br/><b>为什么要用：</b>AI往往会写出千篇一律的文字。侧重系统就是AI的“导演指令”，它能逼迫AI按照你的当前场景风格（如武侠、科幻、甚至是特定作家的文风）去生成内容，极大地提升了AI内容的可用性。' },

  { id: genId(), type: 'h2', text: '五、 AI 设定与大纲知识库系统 (Lore & Context System)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>通过展开式"灵感与设定侧边栏"，系统允许管理四类重要长程设定：世界观设定、人物形象、故事情节大纲以及散乱备忘录。这套背景会被自动注入后台Prompt池。右侧划出的边栏分为设定管理与AI灵感对话两个区域。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>在写作开始前或途中，点击右上角的展开图标。在“世界观”里加上“魔法需要消耗寿命”，在“人物”里加上“主角是个左撇子”。之后你可以直接在下方的聊天框问AI：“如果主角现在遇到敌人，他会怎么做？”，AI会结合你的设定进行逻辑解答。甚至你可以把你刚刚聊出来的好点子，一键加入到上面的设定库中。<br/><b>为什么有/为什么要用：</b>如果缺乏基础设定，AI不知道主角叫什么、不知道反派的目的，生成的内容势必牛头不对马嘴。设定库充当了AI的“长期记忆”。分门别类则是为了让AI能更结构化地读取信息，保证逻辑连贯不OOC。' },

  { id: genId(), type: 'h2', text: '六、 AI 补充范围设置 (Completion Scope Settings)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>存在于右侧边栏的顶层设置中，允许用户自定义每次AI按Tab键时补写的文本粒度（如：一句话、一段话、顺势续写更多内容）。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>如果只想找个合适的形容词，设置为“句子级”；如果完全不知道下一幕怎么演，设置为“段落/多段落”。<br/><b>为什么有：</b>AI一次性输出太多可能会破坏作者原本的把控感，生成太少又显得乏力。通过调节粒度，创作者能精准掌控AI是扮演一个“提供灵感的词典”，还是“替我代笔的强力写手”。' },

  { id: genId(), type: 'h2', text: '七、 AI 智能建议系统 (Proactive Suggestion)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>随着文字推进，AI能在旁侧静默输出建议卡片(Proactive Suggestion)，对故事进程或者文笔刻画盲点发出修正提议。' },
  { id: genId(), type: 'p', text: '<b>使用说明及价值阐述：</b><br/><b>怎么用：</b>被动触发。在你打字时，如果旁边浮现卡片（提示“这里好像缺一点环境描写”），你可以忽略它继续写，或者点击卡片上的“应用”，让AI帮你根据该建议直接进行当前段落补充。<br/><b>为什么要用：</b>实现类似“金牌编辑”在一旁伴读审稿的体验。预防作者陷入盲区、拖沓或遗漏重要的情绪铺垫。' },

  { id: genId(), type: 'h2', text: '八、 用户登录系统 (Authentication System)' },
  { id: genId(), type: 'p', text: '<b>核心功能：</b>提供用户登录界面以标识当前用户身份。目前已取消了强制登录拦截限制，用户即使在访客状态下也可自由体验及调用“划词魔法修改”、“AI Tab 补写”等全部AI高级功能，方便创作者低阻力上手。' },

  { id: genId(), type: 'h2', text: '九、 AI 补写底层工作流 (AI Workflow Deep Dive)' },
  { id: genId(), type: 'p', text: '<b>核心逻辑：</b>系统在执行 AI 扩写订单时，遵循严谨的上下文注入机制：<br/>1. <b>种子 Prompt</b>: 首先抓取用户在右下角选择的“AI 侧重”（如叙事节奏、创意灵感等）。<br/>2. <b>背景知识参考</b>: 随后从“世界观设定”、“人物形象”、“故事情节”等板块中提取已保存的设定条目。这些条目作为 AI 的“长期记忆”约束生成逻辑。<br/>3. <b>操作指令确定</b>: 结合“AI 补充范围设置”（句子级/段落级/延续下文）确定生成的字数规模与衔接方式。<br/>4. <b>局部扩写执行</b>: 最后结合当前编辑器中选中的段落上下文，发送最终推理请求。' },

  { id: genId(), type: 'h2', text: '十、 核心技术与采用系统' },
  { id: genId(), type: 'p', text: '本产品构建于 <b>React + Vite + TypeScript</b> 之上。样式利用 <b>Tailwind CSS</b> 确保全局一致。并使用 <b>Framer Motion</b> 构建了无缝柔和动画。底层文本维护并未借助第三方Draftjs，而是自研的状态阵列驱动式块渲染(Block Array)实现，极具轻量化和极高扩展性。' }
];

const BlockNode = memo(({ 
  block, 
  onMouseUp, 
  onContextMenu, 
  onUpdateText, 
  onKeyDown 
}: { 
  block: Block, 
  onMouseUp: (id: string, e: React.MouseEvent) => void,
  onContextMenu: (id: string, e: React.MouseEvent) => void,
  onUpdateText: (id: string, text: string) => void,
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLElement>) => void
}) => {
  return (
    <div 
      className="group relative"
      onMouseUp={(e) => onMouseUp(block.id, e)}
      onContextMenu={(e) => onContextMenu(block.id, e)}
    >
      {block.type === 'h1' && (
        <h1 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateText(block.id, e.currentTarget.innerText)}
          onKeyDown={(e) => onKeyDown(block.id, e)}
          className="text-4xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-tight mb-8 md:mb-16 outline-none"
        >
          {block.text}
        </h1>
      )}
      {block.type === 'p' && (
        <p 
          id={`block-text-${block.id}`}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdateText(block.id, e.currentTarget.innerHTML)}
          onKeyDown={(e) => onKeyDown(block.id, e)}
          className={`relative font-serif text-[18px] md:text-[21px] p-2 -mx-2 rounded-lg transition-colors focus:bg-zinc-100/50 outline-none leading-snug min-h-[1.5em] ${block.isGenerating ? 'animate-glow' : ''}`}
          dangerouslySetInnerHTML={{ __html: block.text }}
        />
      )}
    </div>
  );
});

export function EditorView({ initialPrompt, onOpenSidebar, sidebarOpen, completionScope, username, onLogout, onRequireLogin, loreSettings }: EditorViewProps) {
const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [fileBlocks, setFileBlocks] = useState<Record<string, Block[]>>({
    'file-3': generatePRDContent(),
    'file-4': generateMockContent(initialPrompt)
  });
  const [activeFileId, setActiveFileId] = useState<string>('file-3');
  const blocks = fileBlocks[activeFileId] || [];
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPersonalSettings, setShowPersonalSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [history, setHistory] = useState<Record<string, { undo: Block[][], redo: Block[][] }>>({});

  const setBlocks = useCallback((newBlocks: Block[] | ((prev: Block[]) => Block[]), skipHistory = false) => {
    setFileBlocks(prev => {
      const currentBlocks = prev[activeFileId] || [];
      const nextBlocks = typeof newBlocks === 'function' ? newBlocks(currentBlocks) : newBlocks;
      
      if (!skipHistory) {
         setHistory(h => {
            const fileHistory = h[activeFileId] || { undo: [], redo: [] };
            return {
               ...h,
               [activeFileId]: {
                  undo: [...fileHistory.undo, currentBlocks].slice(-50), // keep last 50 states
                  redo: []
               }
            };
         });
      }
      return {
        ...prev,
        [activeFileId]: nextBlocks
      };
    });
  }, [activeFileId]);

  const handleUndo = useCallback(() => {
    setHistory(h => {
       const fileHistory = h[activeFileId];
       if (!fileHistory || fileHistory.undo.length === 0) return h;
       
       const previousBlocks = fileHistory.undo[fileHistory.undo.length - 1];
       const newUndo = fileHistory.undo.slice(0, -1);
       
       setFileBlocks(prev => {
         const currentBlocks = prev[activeFileId] || [];
         fileHistory.redo.push(currentBlocks);
         return {
           ...prev,
           [activeFileId]: previousBlocks
         };
       });
       
       return {
         ...h,
         [activeFileId]: {
           undo: newUndo,
           redo: fileHistory.redo
         }
       };
    });
  }, [activeFileId]);

  const handleRedo = useCallback(() => {
    setHistory(h => {
       const fileHistory = h[activeFileId];
       if (!fileHistory || fileHistory.redo.length === 0) return h;
       
       const nextBlocks = fileHistory.redo[fileHistory.redo.length - 1];
       const newRedo = fileHistory.redo.slice(0, -1);
       
       setFileBlocks(prev => {
         const currentBlocks = prev[activeFileId] || [];
         fileHistory.undo.push(currentBlocks);
         return {
           ...prev,
           [activeFileId]: nextBlocks
         };
       });
       
       return {
         ...h,
         [activeFileId]: {
           undo: fileHistory.undo,
           redo: newRedo
         }
       };
    });
  }, [activeFileId]);

  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeElement = document.activeElement;
        // Don't intercept if actively typing inside contenteditable, let native undo handle intra-block edits
        if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
           return; 
        }
        
        if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
        } else {
            e.preventDefault();
            handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.getAttribute('contenteditable') === 'true') {
           return; 
        }
        e.preventDefault();
        handleRedo();
      }
    };
    document.addEventListener('keydown', onGlobalKeyDown);
    return () => document.removeEventListener('keydown', onGlobalKeyDown);
  }, [handleUndo, handleRedo]);
  const [generating, setGenerating] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, blockId: string } | null>(null);
  
  const [focusOptions, setFocusOptions] = useState<AIFocusOption[]>(defaultAIFocusOptions);
  const [activeFocusId, setActiveFocusId] = useState<string>('narrative');
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [promptChatMsgs, setPromptChatMsgs] = useState<{role:'user'|'ai', text:string}[]>([
    { role: 'ai', text: '你好！我们可以探讨一下你想增加什么样的定制化提示词（例如：想写短篇小说，或者是针对设定的一种新风格？）。' }
  ]);
  const [promptChatInput, setPromptChatInput] = useState('');
  const [isSimulatingChat, setIsSimulatingChat] = useState(false);

  
  const [showManageModal, setShowManageModal] = useState(false);

  const [fileSystem, setFileSystem] = useState<FileNode[]>(mockFileTree);
  
  const [fileMenuPos, setFileMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [fileMenuNode, setFileMenuNode] = useState<FileNode | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  
  const [genericModal, setGenericModal] = useState<{
    isOpen: boolean;
    title: string;
    label: string;
    initialValue: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  const handleFileContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setFileMenuPos({ x: e.clientX, y: e.clientY });
    setFileMenuNode(node);
  };

  const deleteNode = (id: string, nodes: FileNode[]): FileNode[] => {
    return nodes.filter(n => n.id !== id).map(n => n.children ? { ...n, children: deleteNode(id, n.children) } : n);
  };

  const renameNode = (id: string, name: string, nodes: FileNode[]): FileNode[] => {
    return nodes.map(n => n.id === id ? { ...n, name } : n.children ? { ...n, children: renameNode(id, name, n.children) } : n);
  };
  
  const cloneNode = (node: FileNode, isRootFolder: boolean = false): FileNode => {
    return {
      ...node,
      id: genId(),
      name: isRootFolder ? `${node.name} (副本)` : node.name,
      children: node.children ? node.children.map(c => cloneNode(c, false)) : undefined
    };
  };

  const copyNode = (id: string, nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    for (const n of nodes) {
      if (n.id === id) {
        result.push(n);
        result.push(cloneNode(n, true));
      } else {
        result.push(n.children ? { ...n, children: copyNode(id, n.children) } : n);
      }
    }
    return result;
  };

  const addChildNode = (parentId: string, name: string, type: 'file' | 'folder', nodes: FileNode[]): FileNode[] => {
    return nodes.map(n => {
      if (n.id === parentId) {
        const newNode: FileNode = { id: genId(), name, type, children: type === 'folder' ? [] : undefined };
        return { ...n, isOpen: true, children: [...(n.children || []), newNode] };
      }
      return n.children ? { ...n, children: addChildNode(parentId, name, type, n.children) } : n;
    });
  };

  const closeFileMenu = () => {
    setFileMenuPos(null);
    setFileMenuNode(null);
  };

  const handleDropNode = (sourceId: string, targetId: string) => {
    setFileSystem(current => {
      let removedNode: FileNode | null = null;
      
      const removeNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(n => {
          if (n.id === sourceId) {
            removedNode = n;
            return false;
          }
          return true;
        }).map(n => n.children ? { ...n, children: removeNode(n.children) } : n);
      };

      const treeWithoutSource = removeNode(current);
      if (!removedNode) return current;

      const insertNode = (nodes: FileNode[]): FileNode[] => {
        const result: FileNode[] = [];
        for (const n of nodes) {
           if (n.id === targetId) {
             if (n.type === 'folder' || n.type === 'project') {
               result.push({ ...n, isOpen: true, children: [...(n.children || []), removedNode!] });
             } else {
               result.push(n);
               result.push(removedNode!);
             }
           } else {
             result.push(n.children ? { ...n, children: insertNode(n.children) } : n);
           }
        }
        return result;
      };
      
      return insertNode(treeWithoutSource);
    });
  };

  const toggleNode = (id: string, nodes: FileNode[]): FileNode[] => {
    return nodes.map(n => {
      if (n.id === id) return { ...n, isOpen: !n.isOpen };
      if (n.children) return { ...n, children: toggleNode(id, n.children) };
      return n;
    });
  };

  const renderFileTree = (nodes: FileNode[], paddingLeft: number = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          onClick={() => {
            if (node.type === 'file') {
               setActiveFileId(node.id);
               if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                 setLeftSidebarOpen(false);
               }
               if (!fileBlocks[node.id]) {
                 setFileBlocks(prev => ({
                   ...prev,
                   [node.id]: [{ id: genId(), type: 'p', text: '' }]
                 }));
               }
            } else {
               setFileSystem(current => toggleNode(node.id, current));
            }
          }}
          onContextMenu={(e) => handleFileContextMenu(e, node)}
          draggable={node.type !== 'project'}
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedNodeId(node.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverId(node.id);
          }}
          onDragLeave={() => setDragOverId(null)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedNodeId && draggedNodeId !== node.id) {
               handleDropNode(draggedNodeId, node.id);
            }
            setDraggedNodeId(null);
            setDragOverId(null);
          }}
          style={{ paddingLeft: `${paddingLeft}px` }}
          className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-md border text-[11px] font-medium transition-colors select-none ${
            activeFileId === node.id && node.type === 'file'
              ? 'bg-violet-100 text-violet-700 border-transparent' 
              : dragOverId === node.id 
                ? 'bg-zinc-200 border-dashed border-violet-400' 
                : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 border-transparent cursor-pointer'
          }`}
        >
          {node.type === 'project' && (
            <div className="w-4 h-4 flex items-center justify-center shrink-0 text-violet-500">
               <span className="font-serif">P</span>
            </div>
          )}
          {node.type === 'folder' && (
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
               {node.isOpen ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronRight className="w-3 h-3 opacity-50" />}
            </div>
          )}
          {node.type === 'file' && (
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
               <File className="w-3 h-3 opacity-40 ml-0.5" />
            </div>
          )}
          <span className="truncate flex-1 tracking-wide">{node.name}</span>
          {node.type !== 'file' && (
            <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-200 rounded shrink-0">
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        {node.children && node.isOpen && (
          <div className="mt-0.5">
            {renderFileTree(node.children, paddingLeft + 12)}
          </div>
        )}
      </div>
    ));
  };
  
  const handlePromptChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptChatInput.trim() || isSimulatingChat) return;

    const userText = promptChatInput.trim();
    setPromptChatInput('');
    setPromptChatMsgs(prev => [...prev, { role: 'user', text: userText }]);
    setIsSimulatingChat(true);

    setTimeout(() => {
      setPromptChatMsgs(prev => [
        ...prev, 
        { role: 'ai', text: `了解。这样的话我们会更偏向于: "${userText}" 相关的设定对吧？如果有其他补充可以说，或者点击右下角的「应用」按钮生成最终的配置。` }
      ]);
      setIsSimulatingChat(false);
    }, 1500);
  };

  const handleApplyFocusConfiguration = () => {
    setIsSimulatingChat(true);
    setTimeout(() => {
      const newOption: AIFocusOption = {
        id: `custom-${genId()}`,
        label: '已生成的侧重',
        prompt: `总结出的最新提示词规则`
      };
      setFocusOptions(prev => [...prev, newOption]);
      setActiveFocusId(newOption.id);
      setIsSimulatingChat(false);
      setShowPromptModal(false);
    }, 1000);
  };

  useEffect(() => {
    setGenerating(false);
  }, []);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Basic click outside handling
      if (contextMenu && !target.closest('.context-menu-container')) {
        setContextMenu(null);
      }
      if (fileMenuPos && !target.closest('.file-menu-container')) {
        closeFileMenu();
      }
      
      if (!target.closest('.focus-menu-container')) {
        setShowFocusMenu(false);
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [contextMenu, fileMenuPos]);

  const handleContextMenu = useCallback((blockId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedBlockId(blockId);
      setSelectedText(text);
    } else {
      setSelectedText('');
    }
    setContextMenu({ x: e.clientX, y: e.clientY, blockId });
  }, []);

  const handleConfirmText = () => {
    setContextMenu(null);
  };

  const handleNewParagraph = (blockId: string) => {
    setContextMenu(null);
    setBlocks(current => {
      const index = current.findIndex(b => b.id === blockId);
      if (index === -1) return current;
      const newBlock: Block = { id: genId(), type: 'p', text: '' };
      const newBlocks = [...current];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
  };

  const getContextString = useCallback(() => {
    let context = "【背景设定】\n";
    if (loreSettings['世界观设定']) {
      context += "世界观: " + loreSettings['世界观设定'].map(i => `${i.name}: ${i.desc}`).join("; ") + "\n";
    }
    if (loreSettings['人物形象']) {
      context += "角色: " + loreSettings['人物形象'].map(i => `${i.name}: ${i.desc}`).join("; ") + "\n";
    }
    if (loreSettings['故事情节']) {
      context += "剧情大纲: " + loreSettings['故事情节'].map(i => `${i.name}: ${i.desc}`).join("; ") + "\n";
    }
    
    const activeFocus = focusOptions.find(f => f.id === activeFocusId);
    if (activeFocus) {
      context += `【AI 创作侧重】: ${activeFocus.prompt}\n`;
    }
    
    context += `【补充范围】: ${completionScope === 'sentence' ? '句子级' : completionScope === 'paragraph' ? '段落级' : '延续下文'}\n`;
    
    return context;
  }, [loreSettings, focusOptions, activeFocusId, completionScope]);

  const handleMagicAutocomplete = useCallback((blockId: string, customText?: string) => {
    // Determine the range of text we want to act on
    const selection = window.getSelection();
    let textToExpand = customText || '';
    if (!textToExpand && selection && selection.toString().trim().length > 0) {
      textToExpand = selection.toString();
    }
    
    const aiContext = getContextString();
    console.log("AI Workflow Execution Context:\n", aiContext);

    setBlocks(current => current.map(b => 
      b.id === blockId ? { ...b, isGenerating: true } : b
    ), true);

    setTimeout(() => {
      let createdBlockId = '';
      setBlocks(current => {
        const index = current.findIndex(b => b.id === blockId);
        if (index === -1) return current;

        const b = current[index];
        const newBlocks = [...current];
        newBlocks[index] = { ...b, isGenerating: false };

        let generatedText = '';
        // Mocking sophisticated AI generation based on context
        if (completionScope === 'sentence') {
            generatedText = `在这片冰冷的遗迹中，每一缕空气都似乎承载着某些被遗弃的记忆。`;
        } else if (completionScope === 'paragraph') {
            generatedText = `这种震动绝不仅仅是地质活动。它带着一种怪异的生物节奏，仿佛某种庞大的、处于冬眠状态的古老意志正在卡伦-9号那厚重如山的冰盖下缓慢苏醒。阿里斯甚至能感觉到那种脉动通过地板传导进她的脚心，让她不自觉地屏住了呼吸。`;
        } else if (completionScope === 'continue') {
            generatedText = `“无论那是什幺，”阿里斯转过身，对还在发抖的克拉克说道，“它现在已经成了我们的优先观察对象。记录下频率，立刻。”`;
        } else {
            generatedText = `沉默笼罩了整个实验室。`;
        }

        const addedBlock: Block = {
            id: genId(),
            type: 'p',
            text: generatedText,
            isGenerating: true
        };
        createdBlockId = addedBlock.id;
        newBlocks.splice(index + 1, 0, addedBlock);
        return newBlocks;
      });

      if (createdBlockId) {
          setTimeout(() => {
             setBlocks(current => current.map(b => b.id === createdBlockId ? { ...b, isGenerating: false } : b), true);
          }, 500);
      }
    }, 1500);
  }, [setBlocks, focusOptions, activeFocusId, completionScope, getContextString]);

  const handleKeyDown = useCallback((blockId: string, e: React.KeyboardEvent<HTMLElement>) => {
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === 'Backspace' && e.currentTarget.innerText === '') {
      e.preventDefault();
      setBlocks(current => {
        const index = current.findIndex(b => b.id === blockId);
        if (index > 0) {
          const prevBlock = current[index - 1];
          setTimeout(() => {
            const prevEl = document.getElementById(`block-text-${prevBlock.id}`);
            if (prevEl) {
              prevEl.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevEl);
              range.collapse(false); // Move caret to end
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 0);
        }
        return index === -1 || current.length === 1 ? current : current.filter(b => b.id !== blockId);
      });
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const selection = window.getSelection();
      let textBefore = e.currentTarget.innerHTML;
      let textAfter = '';

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startContainer === e.currentTarget || e.currentTarget.contains(range.startContainer)) {
           const preCaretRange = range.cloneRange();
           preCaretRange.selectNodeContents(e.currentTarget);
           preCaretRange.setEnd(range.startContainer, range.startOffset);
           textBefore = preCaretRange.toString();
           
           const postCaretRange = range.cloneRange();
           postCaretRange.selectNodeContents(e.currentTarget);
           postCaretRange.setStart(range.endContainer, range.endOffset);
           textAfter = postCaretRange.toString();
        }
      }

      setBlocks(current => {
        const index = current.findIndex(b => b.id === blockId);
        if (index === -1) return current;
        
        const newBlocks = [...current];
        newBlocks[index] = { ...newBlocks[index], text: textBefore };
        
        const newBlock: Block = { id: genId(), type: 'p', text: textAfter };
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      });

      setTimeout(() => {
        // Focus the newly created block (which comes immediately after the current one visually)
        const currentId = `block-${blockId}`;
        const currentEl = document.getElementById(currentId);
        if (currentEl) {
          const nextContentEditable = currentEl.nextElementSibling?.querySelector('[contenteditable]');
          if (nextContentEditable instanceof HTMLElement) {
             nextContentEditable.focus();
          }
        }
      }, 50);

    } else if (e.key === 'Backspace') {
      const text = e.currentTarget.innerText || '';
      if (text.trim() === '' || text === '\n') {
        e.preventDefault();
        setBlocks(current => {
          const index = current.findIndex(b => b.id === blockId);
          if (index <= 0) return current;
          const prevBlockId = current[index - 1].id;
          const newBlocks = [...current];
          newBlocks.splice(index, 1);
          
          setTimeout(() => {
            const prevEl = document.getElementById(`block-${prevBlockId}`)?.querySelector('[contenteditable]') as HTMLElement;
            if (prevEl) {
              prevEl.focus();
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(prevEl);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 50);

          return newBlocks;
        });
      }
    } else if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        e.preventDefault();
        handleMagicAutocomplete(blockId, selection.toString());
      }
    }
  }, [setBlocks, handleMagicAutocomplete]);

  const handleUpdateBlockText = useCallback((blockId: string, newText: string) => {
    setBlocks(current => {
      const block = current.find(b => b.id === blockId);
      if (block && block.text === newText) return current;
      return current.map(b => b.id === blockId ? { ...b, text: newText } : b);
    });
  }, [setBlocks]);

  const handleTextSelection = useCallback((blockId: string, e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedBlockId(blockId);
      setSelectedText(text);
    } else {
      setSelectedBlockId(null);
      setSelectedText('');
    }
  }, []);

  const submitMagicEdit = (targetId?: string, promptText?: string) => {
    const finalBlockId = targetId || selectedBlockId;
    const finalPrompt = promptText || editPrompt;
    if (!finalBlockId || !finalPrompt || !selectedText) return;
    
    setBlocks(current => current.map(b => 
      b.id === finalBlockId ? { ...b, isGenerating: true } : b
    ), true);
    setContextMenu(null);
    const targetBlockId = finalBlockId;
    const targetSelectedText = selectedText;
    const targetPrompt = finalPrompt;
    setEditPrompt('');
    window.getSelection()?.removeAllRanges();

    setTimeout(() => {
      let createdBlockId = '';
      setBlocks(current => {
        const index = current.findIndex(b => b.id === targetBlockId);
        if (index === -1) return current;

        const b = current[index];
        const newBlocks = [...current];
        newBlocks[index] = { ...b, isGenerating: false, proactiveSuggestion: undefined };

        let newGeneratedText = '';
        if (targetPrompt.includes('动作') || targetPrompt.includes('描写')) {
            newGeneratedText = `他深吸了一口气，冰冷的空气刺痛了肺腑，但他的眼神却变得异常坚定。这种坚定并非盲目的乐观，而是源自对未知深渊的某种本能抵抗。`;
        } else if (targetPrompt.includes('神态') || targetPrompt.includes('表情')) {
            newGeneratedText = `他的眼角微微抽搐，在幽蓝的屏幕光下显得有些扭曲，额头上渗出了细密的冷汗。那些冷汗在零下三十度的环境里迅速结成冰霜，像是一层苍白的倒刺。`;
        } else if (targetPrompt.includes('扩写') || targetPrompt.includes('继续') || targetPrompt.includes('展开')) {
             newGeneratedText = `就在这个时候，警报灯的光芒突然拉长了，控制台的振动频率达到了令人牙酸的程度。原本还能勉强维持镇定的两人，瞬间被包裹在无法言喻的压迫感之中，仿佛整个冰层都在随之战栗。`;
        } else {
             newGeneratedText = `那种难以言喻的压迫感如同实质般降临在他们周围，似乎有什么古老的存在正透过冰冷的黑暗凝视着这一切。`;
        }

        const addedBlock: Block = {
            id: crypto.randomUUID(),
            type: 'p',
            text: newGeneratedText,
            isGenerating: true
        };
        createdBlockId = addedBlock.id;
        newBlocks.splice(index + 1, 0, addedBlock);
        return newBlocks;
      });
      
      if (createdBlockId) {
          setTimeout(() => {
             setBlocks(current => current.map(b => b.id === createdBlockId ? { ...b, isGenerating: false } : b), true);
          }, 500);
      }
      setSelectedBlockId(null);
      setSelectedText('');
    }, 2000);
  };

  const findNodeName = (id: string, nodes: FileNode[]): string => {
    for (const node of nodes) {
      if (node.id === id) return node.name;
      if (node.children) {
        const found = findNodeName(id, node.children);
        if (found !== '未命名') return found;
      }
    }
    return '未命名';
  };

  return (
    <div className="w-full h-full flex flex-col relative text-zinc-900 bg-zinc-50">
      {/* Top Nav */}
      <nav className="h-16 px-8 flex items-center justify-between border-b border-zinc-100 bg-white/40 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-400 flex items-center justify-center shrink-0">
            <span className="text-white font-serif text-lg leading-none">M</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-zinc-500 truncate max-w-[120px] sm:max-w-none">
            {findNodeName(activeFileId, fileSystem) || '第4章'}
          </span>
        </div>
        <div className="flex items-center gap-6 relative">
          {generating && (
            <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full border border-violet-100">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-violet-600 uppercase tracking-widest">魔法同步中</span>
            </div>
          )}
          {!sidebarOpen && !generating && (
            <button onClick={onOpenSidebar} className="flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full border border-violet-100 text-[11px] font-bold text-violet-600 uppercase tracking-widest hover:border-violet-300 transition-colors">
              辅助
            </button>
          )}
          
          <div className="relative">
            <button 
              onClick={() => { setShowExportMenu(!showExportMenu); setShowUserMenu(false); }}
              className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              导出 <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 shadow-xl rounded-xl py-2 z-50 flex flex-col"
                >
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 py-1">导出格式</span>
                  <button onClick={() => setShowExportMenu(false)} className="text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><File className="w-3.5 h-3.5" /> 纯文本 (.txt)</button>
                  <button onClick={() => setShowExportMenu(false)} className="text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><File className="w-3.5 h-3.5" /> Markdown (.md)</button>
                  <button onClick={() => setShowExportMenu(false)} className="text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><Share className="w-3.5 h-3.5" /> 分享链接</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowUserMenu(!showUserMenu); setShowExportMenu(false); }}
              className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-xl shadow-zinc-200 overflow-hidden transform hover:scale-105 active:scale-95 transition-all"
            >
              <span className="font-bold text-lg">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 shadow-xl rounded-xl py-2 z-50 flex flex-col"
                >
                  {username ? (
                    <>
                      <div className="px-4 py-2 border-b border-zinc-100 flex flex-col mb-1">
                        <span className="text-sm font-bold text-zinc-800 truncate">{username}</span>
                        <span className="text-[10px] uppercase font-bold text-violet-500 tracking-wider">Pro Edition</span>
                      </div>
                      <button onClick={() => { setShowUserMenu(false); setShowPersonalSettings(true); }} className="text-left px-4 py-2.5 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><User className="w-3.5 h-3.5" /> 个人设置</button>
                      <button onClick={() => setShowUserMenu(false)} className="text-left px-4 py-2.5 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> 写作偏好</button>
                      <button onClick={() => setShowUserMenu(false)} className="text-left px-4 py-2.5 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><Settings2 className="w-3.5 h-3.5" /> 界面主题</button>
                      <div className="h-px bg-zinc-100 my-1"></div>
                      <button onClick={() => { setShowUserMenu(false); onLogout(); }} className="text-left px-4 py-2.5 hover:bg-red-50 text-xs font-medium text-red-600 transition flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> 退出登录</button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-zinc-100 flex flex-col mb-1">
                        <span className="text-sm font-bold text-zinc-800 truncate">未登录</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">游客</span>
                      </div>
                      <button onClick={() => { setShowUserMenu(false); onRequireLogin(); }} className="text-left px-4 py-2.5 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition flex items-center gap-2"><User className="w-3.5 h-3.5" /> 去登录</button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLeftSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[40]"
            />
          )}
        </AnimatePresence>

        {/* Sidebar - File Explorer */}
        <AnimatePresence>
          {(leftSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside 
              initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 z-[45] w-64 bg-white border-r border-zinc-100 lg:relative lg:z-0 lg:flex lg:translate-x-0 pt-8 flex flex-col shrink-0 overflow-y-auto bg-zinc-50/50 shadow-2xl lg:shadow-none ${!leftSidebarOpen ? 'hidden lg:flex' : 'flex'}`}
            >
              <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">大纲目录</span>
                <button 
                  onClick={() => setLeftSidebarOpen(false)}
                  className="lg:hidden text-zinc-400 hover:text-zinc-800 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                <button className="hidden lg:block text-zinc-400 hover:text-zinc-800 transition-colors p-1 bg-white border border-zinc-200 rounded shadow-sm">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="px-2 pb-8 flex-1 select-none">
                {renderFileTree(fileSystem)}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 max-w-2xl mx-auto pt-20 px-4 relative overflow-y-auto">
          {generating ? (
            <div className="space-y-4 max-w-2xl mx-auto opacity-50">
              <motion.div initial={{ width: "20%" }} animate={{ width: "60%" }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="h-8 bg-zinc-200 rounded-md" />
              <motion.div initial={{ width: "40%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.2 }} className="h-4 bg-zinc-200 rounded-md mt-8" />
              <motion.div initial={{ width: "60%" }} animate={{ width: "90%" }} transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", delay: 0.4 }} className="h-4 bg-zinc-200 rounded-md" />
              <motion.div initial={{ width: "30%" }} animate={{ width: "80%" }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse", delay: 0.1 }} className="h-4 bg-zinc-200 rounded-md mt-6" />
            </div>
          ) : (
            <article 
              className="font-serif text-[21px] leading-[1.8] text-zinc-800 pb-32 min-h-screen cursor-text"
              onClick={(e) => {
                if (e.target === e.currentTarget && blocks.length > 0) {
                  // Clicked on empty space below blocks, focus the last block
                  const lastBlock = blocks[blocks.length - 1];
                  const el = document.getElementById(`block-text-${lastBlock.id}`);
                  if (el) {
                    el.focus();
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }
                }
              }}
            >
              {blocks.map((block) => (
                <BlockNode 
                  key={block.id}
                  block={block}
                  onMouseUp={handleTextSelection}
                  onContextMenu={handleContextMenu}
                  onUpdateText={handleUpdateBlockText}
                  onKeyDown={handleKeyDown}
                />
              ))}
            </article>
          )}

          {/* Context Menu */}
          <AnimatePresence>
            {contextMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
                className="context-menu-container z-50 bg-white border border-zinc-200 shadow-xl rounded-xl py-1 min-w-[200px] text-xs font-medium text-zinc-700 overflow-hidden"
              >
                {selectedText && (
                  <div className="bg-zinc-50 border-b border-zinc-100 flex flex-col mb-1">
                    <div className="px-4 py-2 border-b border-zinc-100 bg-white">
                      <div className="text-[10px] text-zinc-500 mb-1 flex items-center justify-between">
                        <span>AI 智能编辑</span>
                        <Wand2 className="w-3 h-3 text-violet-500" />
                      </div>
                      <div className="text-[10px] text-zinc-800 font-bold max-w-[170px] truncate mb-2">已选中: {selectedText}</div>
                      <input
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitMagicEdit(contextMenu.blockId, editPrompt)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="输入提示词如 '生动描写'..."
                        className="w-full text-xs outline-none bg-zinc-50 hover:bg-zinc-100 focus:bg-white focus:ring-2 focus:ring-violet-100 py-1.5 px-2 rounded-lg border border-zinc-200 focus:border-violet-300 transition-all placeholder:text-zinc-400"
                      />
                    </div>
                    <button onClick={() => submitMagicEdit(contextMenu.blockId, 'AI缩短这段内容')} className="w-full text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 transition flex items-center group">
                       <span className="flex-1">AI 缩短</span>
                       <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-violet-500 transition-opacity" />
                    </button>
                    <button onClick={() => submitMagicEdit(contextMenu.blockId, 'AI扩写这段内容')} className="w-full text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 transition flex items-center group">
                       <span className="flex-1">AI 扩写</span>
                       <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-violet-500 transition-opacity" />
                    </button>
                    <button onClick={() => submitMagicEdit(contextMenu.blockId, '使用更生动的词汇')} className="w-full text-left px-4 py-2 hover:bg-violet-50 hover:text-violet-700 transition flex items-center group">
                       <span className="flex-1">生动润色</span>
                       <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-violet-500 transition-opacity" />
                    </button>
                    <div className="h-px bg-zinc-200/50 my-1 mx-2"></div>
                  </div>
                )}
                <button onClick={() => handleConfirmText()} className="w-full text-left px-4 py-2.5 hover:bg-zinc-100 transition">确认文本</button>
                <div className="h-px bg-zinc-100 my-1"></div>
                <button onClick={() => handleNewParagraph(contextMenu.blockId)} className="w-full text-left px-4 py-2.5 hover:bg-zinc-100 transition">新建段落</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Context Menu */}
          <AnimatePresence>
            {fileMenuPos && fileMenuNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'fixed', left: fileMenuPos.x, top: fileMenuPos.y }}
                className="z-[100] bg-white border border-zinc-200 shadow-xl rounded-xl py-1 min-w-[140px] text-xs font-medium text-zinc-700"
              >
                 {fileMenuNode.type !== 'file' && (
                   <>
                     <button onClick={() => { 
                       closeFileMenu(); 
                       setGenericModal({
                         isOpen: true,
                         title: '新建文档',
                         label: '文档名称',
                         initialValue: '新文档',
                         onConfirm: (val) => {
                           setFileSystem(prev => addChildNode(fileMenuNode.id, val, 'file', prev));
                           setGenericModal(null);
                         }
                       });
                     }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition">新建文档</button>
                     <button onClick={() => { 
                       closeFileMenu(); 
                       setGenericModal({
                         isOpen: true,
                         title: '新建文件夹',
                         label: '文件夹名称',
                         initialValue: '新文件夹',
                         onConfirm: (val) => {
                           setFileSystem(prev => addChildNode(fileMenuNode.id, val, 'folder', prev));
                           setGenericModal(null);
                         }
                       });
                     }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition">新建文件夹</button>
                   </>
                 )}
                 <button onClick={() => { 
                   closeFileMenu();
                   setGenericModal({
                     isOpen: true,
                     title: '重命名',
                     label: '新名称',
                     initialValue: fileMenuNode.name,
                     onConfirm: (val) => {
                       setFileSystem(prev => renameNode(fileMenuNode.id, val, prev));
                       setGenericModal(null);
                     }
                   });
                 }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition">重命名</button>
                 <button onClick={() => { 
                   closeFileMenu();
                   setFileSystem(prev => copyNode(fileMenuNode.id, prev));
                 }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 transition">复制</button>
                 <div className="h-px bg-zinc-100 my-1"></div>
                 <button onClick={() => { 
                   closeFileMenu();
                   setFileSystem(prev => deleteNode(fileMenuNode.id, prev));
                 }} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 transition">删除</button>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 px-8 flex items-center justify-between border-t border-zinc-100 bg-white z-20 text-[10px] text-zinc-400 shrink-0">
        <div className="flex items-center gap-4 uppercase font-bold tracking-widest">
          <span>字数: 428</span>
          <span>字符: 2,841</span>
        </div>
        <div className="flex items-center gap-2 relative focus-menu-container">
          <button 
            onClick={() => setShowFocusMenu(!showFocusMenu)}
            className="uppercase font-bold tracking-widest hover:text-zinc-600 transition-colors flex items-center gap-1.5"
          >
            AI 侧重: {focusOptions.find(o => o.id === activeFocusId)?.label}
          </button>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>

          <AnimatePresence>
            {showFocusMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 bottom-full mb-3 w-48 bg-white border border-zinc-200 shadow-xl rounded-xl py-1 z-50 flex flex-col"
              >
                {focusOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setActiveFocusId(option.id);
                      setShowFocusMenu(false);
                    }}
                    className={`text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      activeFocusId === option.id 
                        ? 'text-violet-600 bg-violet-50' 
                        : 'text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <div className="h-px bg-zinc-100 my-1"></div>
                <button 
                  onClick={() => {
                    setShowFocusMenu(false);
                    setShowManageModal(true);
                  }}
                  className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  管理...
                </button>
                <div className="h-px bg-zinc-100 my-1"></div>
                <button 
                  onClick={() => {
                    setShowFocusMenu(false);
                    setShowPromptModal(true);
                  }}
                  className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                >
                  更多探讨...
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>

      {/* Generic Modal */}
      <AnimatePresence>
        {genericModal?.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h3 className="font-bold text-zinc-800 tracking-tight">{genericModal.title}</h3>
                <button onClick={() => setGenericModal(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form 
                className="p-6 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem('inputValue') as HTMLInputElement).value;
                  genericModal.onConfirm(val);
                }}
              >
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{genericModal.label}</label>
                <input 
                  type="text" 
                  name="inputValue"
                  defaultValue={genericModal.initialValue}
                  autoFocus
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50 transition-all"
                />
                <button type="submit" className="w-full mt-2 bg-violet-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-sm hover:bg-violet-700 transition-colors">
                  确认
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Modal */}
      <AnimatePresence>
        {showManageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 focus-menu-container"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2 text-violet-600">
                  <Settings2 className="w-5 h-5" />
                  <h3 className="font-bold tracking-tight">管理侧重配置</h3>
                </div>
                <button onClick={() => setShowManageModal(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 min-h-[300px] max-h-[500px] overflow-y-auto bg-zinc-50 flex flex-col gap-4">
                {focusOptions.map((option, idx) => (
                  <div key={option.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
                    <div className="flex-1 flex flex-col gap-3">
                      <input 
                        value={option.label}
                        onChange={(e) => setFocusOptions(prev => prev.map((o, i) => i === idx ? {...o, label: e.target.value} : o))}
                        className="text-sm font-bold text-zinc-800 outline-none border-b border-transparent focus:border-violet-300 w-1/3"
                      />
                      <textarea 
                        value={option.prompt}
                        onChange={(e) => setFocusOptions(prev => prev.map((o, i) => i === idx ? {...o, prompt: e.target.value} : o))}
                        className="text-xs text-zinc-600 w-full h-20 outline-none resize-none border border-zinc-100 rounded-lg p-2 focus:border-violet-300"
                      />
                    </div>
                    {focusOptions.length > 1 && (
                      <button 
                        onClick={() => {
                          setFocusOptions(prev => prev.filter(o => o.id !== option.id));
                          if (activeFocusId === option.id) {
                             setActiveFocusId(focusOptions.find(o => o.id !== option.id)?.id || '');
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 focus-menu-container" // Reusing class to avoid closing it via general click handler if needed, though modal overlay is fine
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2 text-violet-600">
                  <Wand2 className="w-5 h-5" />
                  <h3 className="font-bold tracking-tight">AI 侧重探讨</h3>
                </div>
                <button onClick={() => setShowPromptModal(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex-1 min-h-[300px] max-h-[500px] overflow-y-auto bg-white flex flex-col gap-4 select-text">
                {promptChatMsgs.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'ai' 
                        ? 'bg-zinc-50 border border-zinc-100 text-zinc-700' 
                        : 'bg-violet-600 text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isSimulatingChat && (
                  <div className="flex justify-start">
                     <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-zinc-50 border border-zinc-100 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                       <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4">
                <form onSubmit={handlePromptChatSubmit} className="flex-1">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={promptChatInput}
                      onChange={e => setPromptChatInput(e.target.value)}
                      placeholder="例如：我想写一篇关于赛博朋克的短篇小说..."
                      className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50 transition-all text-zinc-800"
                    />
                    <button 
                      type="submit"
                      disabled={!promptChatInput.trim() || isSimulatingChat}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
                <div className="shrink-0 flex pr-1">
                  <button 
                    onClick={handleApplyFocusConfiguration}
                    disabled={isSimulatingChat}
                    className="h-[46px] px-6 text-sm font-bold uppercase tracking-widest rounded-xl bg-zinc-900 border border-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm disabled:bg-zinc-300 disabled:border-zinc-300 flex items-center justify-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>生成&应用配置</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPersonalSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-zinc-200 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="font-serif font-bold text-lg text-zinc-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-500" />
                  个人设置
                </h3>
                <button onClick={() => setShowPersonalSettings(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-700 transition-colors rounded-full hover:bg-zinc-100/80">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                    <span className="font-bold text-3xl">{username ? username.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-zinc-800">{username || '游客'}</div>
                    <div className="text-sm font-medium text-violet-600 uppercase tracking-widest mt-1">{username ? 'Pro Edition' : ''}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">基础信息</h4>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-600">显示名称</label>
                    <input type="text" readOnly value={username || '未登录'} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none text-sm text-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-zinc-600">邮箱</label>
                    <input type="text" readOnly value={username ? `${username}@example.com` : '未绑定'} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none text-sm text-zinc-800" />
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">偏好设置</h4>
                  <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl cursor-pointer hover:border-violet-300 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-800">云端同步</span>
                      <span className="text-xs text-zinc-500">将大纲与内容自动同步至云端</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-violet-500 w-4 h-4 cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl cursor-pointer hover:border-violet-300 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-800">自动补全</span>
                      <span className="text-xs text-zinc-500">在输入时提供 AI 预测的智能补全</span>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-violet-500 w-4 h-4 cursor-pointer" />
                  </label>
                </div>
              </div>
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                <button onClick={() => setShowPersonalSettings(false)} className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-md hover:bg-zinc-800 transition-colors">
                  完成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Announcement */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* decorative background effect */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-violet-100/50 to-transparent pointer-events-none" />
              
              <div className="relative p-8 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-violet-100/50">
                   <Sparkles className="w-6 h-6 text-violet-500" />
                 </div>
                 
                 <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2 tracking-wide">灵源创作</h2>
                 
                 <div className="w-8 h-1 bg-violet-200 rounded-full my-5" />
                 
                 <div className="space-y-3 mb-8">
                   <p className="text-[15px] font-medium text-zinc-600 leading-relaxed tracking-wide">
                     你所看到的这些都不是我们最终追求的形态
                   </p>
                   <p className="text-[15px] font-medium text-zinc-600 leading-relaxed tracking-wide">
                     我们会与你一同追寻更远的方向
                   </p>
                 </div>
                 
                 <button 
                   onClick={() => setShowAnnouncement(false)}
                   className="w-full bg-zinc-900 text-white rounded-xl py-3.5 font-bold text-sm tracking-widest shadow-md hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-4 focus:ring-zinc-200"
                 >
                   开始
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
