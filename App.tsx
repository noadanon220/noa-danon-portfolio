import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PROJECTS, SOCIAL_LINKS, SKILLS, COURSES } from './constants';
import * as LucideIcons from 'lucide-react';
import {
  Rocket,
  Settings,
  Search,
  Command,
  ChevronRight,
  Info,
  Activity,
  BoxSelect,
  Monitor,
  FileCode,
  Fingerprint,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  X,
  FileJson,
  Layers,
  Code2,
  ChevronRight as ChevronRightIcon,
  Sun,
  Moon,
  Monitor as MonitorIcon,
  Check,
  Sparkles,
  Zap,
  Layout,
  Terminal,
  MousePointer2,
  Eye,
  Type,
  Key,
  Save,
  Terminal as TerminalIcon,
  Cpu,
  Trash2,
  Power,
  Coffee,
  Heart,
  GitBranch,
  History as HistoryIcon,
  HelpCircle,
  Keyboard,
  MousePointerClick,
  Pen,
  Square,
  Hand,
  Pipette,
  Mail,
  Linkedin,
  Github,
  Phone,
} from 'lucide-react';

// --- Type Definitions ---

type FileType = 'markdown' | 'typescript' | 'tsx' | 'json' | 'settings' | 'shell' | 'log';
type ThemeMode = 'light' | 'dark' | 'studio' | 'contrast';
type ToolType = 'selection' | 'direct-selection' | 'pen' | 'text' | 'shapes' | 'hand' | 'pipette';
type PanelId = 'tools' | 'explorer' | 'canvas' | 'inspector';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon?: string;
  children?: FileNode[];
  projectId?: string;
  specialId?: string;
  fileType?: FileType;
}

interface Tab {
  id: string;
  name: string;
  fileType: FileType;
  projectId?: string;
  specialId?: string;
  fileKey?: 'overview' | 'stack' | 'links';
}

// --- Constants & Data ---

const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 520;
const DEFAULT_INSPECTOR_WIDTH = 340;
const MIN_INSPECTOR_WIDTH = 260;
const MAX_INSPECTOR_WIDTH = 560;
const MIN_CANVAS_WIDTH = 520;
const DEFAULT_TERMINAL_HEIGHT = 240;
const MIN_TERMINAL_HEIGHT = 100;
const MAX_TERMINAL_HEIGHT = 600;

const FILE_TREE: FileNode[] = [
  {
    id: 'root-node',
    name: 'NOA_DANON',
    type: 'folder',
    children: [
      { id: 'readme', name: 'README.md', type: 'file', icon: 'FileText', fileType: 'markdown', specialId: 'readme' },
      { id: 'history', name: 'HISTORY.log', type: 'file', icon: 'History', fileType: 'log', specialId: 'history' },
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        children: [
          { id: 'index-ts', name: 'index.ts', type: 'file', icon: 'Code2', fileType: 'typescript', specialId: 'index' },
          {
            id: 'projects-dir',
            name: 'projects',
            type: 'folder',
            children: PROJECTS.map(p => ({
              id: `folder-${p.id}`,
              name: p.repoName ?? p.id,
              type: 'folder' as const,
              children: [
                { id: `${p.id}-overview`, name: 'README.md', type: 'file', fileType: 'markdown', projectId: p.id, specialId: 'project-overview' },
              ]
            }))
          },
          {
            id: 'playground-dir',
            name: 'playground',
            type: 'folder',
            children: [
              { id: 'hello-world', name: 'helloWorld.tsx', type: 'file', icon: 'FileCode', fileType: 'tsx', specialId: 'hello-world' }
            ]
          }
        ]
      }
    ]
  }
];

// --- Helper Functions ---

const findPath = (tree: FileNode[], targetId: string, currentPath: string[] = []): string[] | null => {
  for (const node of tree) {
    if (node.id === targetId) return [...currentPath, node.name];
    if (node.children) {
      const result = findPath(node.children, targetId, [...currentPath, node.name]);
      if (result) return result;
    }
  }
  return null;
};

// --- Syntax Highlighting Utility ---

const highlightCode = (code: string) => {
  const patterns = [
    // Comments
    { regex: /(\/\/.*)/g, class: 'syn-comment' },
    { regex: /(\/\*[\s\S]*?\*\/)/g, class: 'syn-comment' },
    // Strings
    { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, class: 'syn-string' },
    { regex: /(`[\s\S]*?`)/g, class: 'syn-string' },
    // Keywords
    { regex: /\b(const|let|var|function|return|import|export|from|if|else|while|for|class|interface|type|default|new|await|async|try|catch|throw|void|any|string|number|boolean|null|undefined)\b/g, class: 'syn-keyword' },
    // Numbers
    { regex: /\b(\d+)\b/g, class: 'syn-number' },
    // JSX Tags
    { regex: /(<\/?[a-zA-Z][^>]*>)/g, class: 'syn-tag' },
    // Functions
    { regex: /\b(\w+)(?=\()/g, class: 'syn-function' },
  ];

  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const placeholders: string[] = [];

  patterns.forEach((p, i) => {
    highlighted = highlighted.replace(p.regex, (match) => {
      const placeholder = `___PH${i}_${placeholders.length}___`;
      placeholders.push(`<span class="${p.class}">${match}</span>`);
      return placeholder;
    });
  });

  placeholders.forEach((h, i) => {
    highlighted = highlighted.replace(/___PH\d+_\d+___/, h);
  });

  return highlighted;
};

// --- Sub-components ---

const SelectionOutline: React.FC<{ label?: string; inset?: string }> = ({ label, inset = "-8px" }) => (
  <div className="selection-outline pointer-events-none" style={{ inset }}>
    <div className="handle-tl" />
    <div className="handle-tr" />
    <div className="handle-bl" />
    <div className="handle-br" />
    {label && (
      <div className="absolute -top-7 left-0 bg-puffyIndigo text-white text-[9px] px-2 py-0.5 font-mono uppercase tracking-widest flex items-center gap-1.5 shadow-sm rounded-sm whitespace-nowrap z-[110]">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        {label}
      </div>
    )}
  </div>
);

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  activeId: string;
  onSelect: (node: FileNode) => void;
}> = ({ node, level, activeId, onSelect }) => {
  const isProjectsDir = node.id === 'projects-dir';
  const [isOpen, setIsOpen] = useState(level === 0 || node.id === 'src');
  const Icon = (LucideIcons as any)[node.icon || (node.type === 'folder' ? (isOpen ? 'FolderOpen' : 'Folder') : 'FileText')];

  if (node.type === 'folder') {
    return (
      <div className="flex flex-col">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 rounded-lg cursor-pointer text-mutedText hover:bg-mainText/5 transition-colors relative ${isProjectsDir ? 'py-1.5' : 'py-1'}`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {isOpen ? <ChevronDown size={isProjectsDir ? 15 : 14} className="opacity-50 shrink-0" /> : <ChevronRightIcon size={isProjectsDir ? 15 : 14} className="opacity-50 shrink-0" />}
          <Icon size={isProjectsDir ? 15 : 14} className="text-puffyIndigo opacity-70 shrink-0" />
          <span className={`font-mono font-bold truncate ${isProjectsDir ? 'text-[13px] text-mainText' : 'text-[11px]'}`}>{node.name}</span>
        </div>
        {isOpen && node.children?.map(child => (
          <FileTreeItem key={child.id} node={child} level={level + 1} activeId={activeId} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(node)}
      className={`flex items-center gap-2 px-3 py-1 rounded-lg cursor-pointer transition-colors group relative ${activeId === node.id ? 'bg-puffyIndigo/10 text-puffyIndigo' : 'text-mutedText hover:bg-mainText/5'}`}
      style={{ paddingLeft: `${level * 12 + 28}px` }}
    >
      <Icon size={14} className={activeId === node.id ? 'text-puffyIndigo' : 'text-mutedText opacity-60'} />
      <span className="text-[11px] font-mono font-bold truncate">{node.name}</span>
    </div>
  );
};

// --- Settings Components ---

const SettingsRow: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex items-start justify-between py-6 border-b border-borderCol">
    <div className="flex flex-col gap-1 max-w-md">
      <span className="text-sm font-bold text-mainText">{title}</span>
      <span className="text-[11px] text-mutedText leading-relaxed">{description}</span>
    </div>
    <div className="shrink-0 flex items-center justify-end min-w-[120px]">
      {children}
    </div>
  </div>
);

// --- Code Editor Component ---

const CodeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  language?: 'typescript' | 'tsx' | 'markdown';
  readOnly?: boolean;
}> = ({ value, onChange, language = 'typescript', readOnly = false }) => {
  const lineCount = useMemo(() => value.split('\n').length, [value]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (e.currentTarget) {
          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const highlighted = useMemo(() => highlightCode(value), [value]);

  return (
    <div className="flex h-full w-full bg-mainText/[0.02] dark:bg-black/20 font-mono text-sm leading-relaxed overflow-hidden">
      <div className="w-12 pt-2 border-r border-borderCol flex flex-col items-center text-mutedText/40 select-none bg-sidebar/5 shrink-0 overflow-hidden">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="h-[1.6rem]">{i + 1}</div>
        ))}
      </div>

      <div className="flex-1 relative h-full overflow-hidden">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 p-2 whitespace-pre overflow-hidden pointer-events-none no-scrollbar"
          style={{
            tabSize: 2,
            color: 'var(--text-main)',
            fontFamily: 'inherit',
            lineHeight: 'inherit'
          }}
          dangerouslySetInnerHTML={{ __html: highlighted + (value.endsWith('\n') ? '\n' : '') }}
        />

        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={`absolute inset-0 w-full h-full bg-transparent resize-none focus:outline-none p-2 whitespace-pre overflow-auto no-scrollbar caret-current text-transparent ${readOnly ? 'cursor-default' : 'cursor-text'
            }`}
          style={{
            tabSize: 2,
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            caretColor: 'var(--text-main)'
          }}
        />
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    { id: 'readme', name: 'README.md', fileType: 'markdown', specialId: 'readme' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('readme');
  const history = useRef<string[]>(['readme']);
  const [prefSearch, setPrefSearch] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('Appearance');

  // Layout State
  const [layoutOrder, setLayoutOrder] = useState<PanelId[]>(['tools', 'explorer', 'canvas', 'inspector']);
  const [draggedPanelIndex, setDraggedPanelIndex] = useState<number | null>(null);

  // Tools Sidebar State
  const [activeTool, setActiveTool] = useState<ToolType>('selection');

  // History State
  const [actionLog, setActionLog] = useState<Array<{ id: string, message: string, timestamp: string }>>([
    { id: 'init', message: 'Workspace initialized', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
  ]);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Terminal Panel State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(DEFAULT_TERMINAL_HEIGHT);
  const [activeTerminalTab, setActiveTerminalTab] = useState('TERMINAL');

  // Terminal Logic State
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string, type: 'input' | 'output' | 'error' }>>([
    { text: 'Welcome to Noa-OS v8.4 (Stable Workspace)', type: 'output' },
    { text: 'Type "help" for a list of available secrets.', type: 'output' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Shortcut State
  const [showHelp, setShowHelp] = useState(false);

  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'hello-world': `import React from 'react';\n\nconst HelloWorld = () => {\n  return (\n    <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 text-left w-full max-w-xl font-mono text-sm">\n      <p className="text-pink-400">export default () => (</p>\n      <p className="pl-6 text-indigo-300"><div></p>\n      <p className="pl-12 text-emerald-400">Hello! I'm Noa, a developer from Israel.</p>\n      <p className="pl-6 text-indigo-300"></div></p>\n      <p className="text-pink-400">);</p>\n    </div>\n  );\n};\n\nexport default HelloWorld;`,
    'index': `import { projects } from './projects';\nimport { noa } from './identity';\n\n// Noa Danon — CS Graduate · AppSec Enthusiast\n// Afeka College of Engineering · B.Sc Computer Science · 2026\n// noadanon220@gmail.com · linkedin.com/in/noadanon\n\nconst renderPortfolio = () => {\n  // ${PROJECTS.length} projects — built with Java, Kotlin, C++, React, TypeScript\n  projects.map(p => display(p));\n};\n\nrenderPortfolio();`
  });

  const logAction = useCallback((message: string) => {
    setActionLog(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);
  }, []);

  const handleFileChange = (id: string, newContent: string) => {
    setFileContents(prev => ({ ...prev, [id]: newContent }));
  };

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ide-theme') as ThemeMode;
    if (saved && ['light', 'dark', 'studio', 'contrast'].includes(saved)) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark', 'studio', 'contrast');
    document.documentElement.classList.add(theme);
    localStorage.setItem('ide-theme', theme);
  }, [theme]);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('ide-sidebar-width');
    return saved ? parseInt(saved, 10) : DEFAULT_SIDEBAR_WIDTH;
  });
  const [inspectorWidth, setInspectorWidth] = useState(() => {
    const saved = localStorage.getItem('ide-inspector-width');
    return saved ? parseInt(saved, 10) : DEFAULT_INSPECTOR_WIDTH;
  });

  const isResizingSidebar = useRef(false);
  const isResizingInspector = useRef(false);
  const isResizingTerminal = useRef(false);

  useEffect(() => {
    localStorage.setItem('ide-sidebar-width', sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    localStorage.setItem('ide-inspector-width', inspectorWidth.toString());
  }, [inspectorWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingSidebar.current) {
      const maxPossibleSidebar = window.innerWidth - MIN_CANVAS_WIDTH - inspectorWidth - 64 - 36;
      // Smarter sidebar resize based on absolute X
      const explorerIdx = layoutOrder.indexOf('explorer');
      let offset = 0;
      for (let i = 0; i < explorerIdx; i++) {
        const id = layoutOrder[i];
        if (id === 'tools') offset += 64;
        else if (id === 'explorer') offset += sidebarWidth;
        else if (id === 'canvas') offset += 400; // placeholder min width
        else if (id === 'inspector') offset += inspectorWidth;
        offset += 4; // splitters
      }
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, e.clientX - offset - 12));
      setSidebarWidth(newWidth);
    } else if (isResizingInspector.current) {
      const inspectorIdx = layoutOrder.indexOf('inspector');
      let offset = 0;
      for (let i = 0; i < inspectorIdx; i++) {
        const id = layoutOrder[i];
        if (id === 'tools') offset += 64;
        else if (id === 'explorer') offset += sidebarWidth;
        else if (id === 'canvas') offset += 400; // placeholder min width
        else if (id === 'inspector') offset += inspectorWidth;
        offset += 4; // splitters
      }
      const newWidth = Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, e.clientX - offset - 12));
      // Inspector resize usually works from right, but grid allows flexible logic.
      // Re-using simplified width calculation:
      setInspectorWidth(Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, e.clientX - offset - 12)));
    } else if (isResizingTerminal.current) {
      const footerHeight = 42;
      const newHeight = Math.max(MIN_TERMINAL_HEIGHT, Math.min(MAX_TERMINAL_HEIGHT, window.innerHeight - e.clientY - footerHeight - 12));
      setTerminalHeight(newHeight);
    }
  }, [sidebarWidth, inspectorWidth, layoutOrder]);

  const handleMouseUp = useCallback(() => {
    isResizingSidebar.current = false;
    isResizingInspector.current = false;
    isResizingTerminal.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const activeTab = useMemo(() => openTabs.find(t => t.id === activeTabId), [openTabs, activeTabId]);

  const breadcrumbPath = useMemo(() => {
    if (activeTabId === 'preferences') return ['NOA_DANON', 'Preferences'];
    if (activeTabId === 'terminal') return ['NOA_DANON', 'terminal.sh'];
    if (activeTabId === 'history') return ['NOA_DANON', 'HISTORY.log'];
    const path = findPath(FILE_TREE, activeTabId);
    return path || ['NOA_DANON'];
  }, [activeTabId]);

  const activeProject = useMemo(() => {
    if (activeTab?.projectId) {
      return PROJECTS.find(p => p.id === activeTab.projectId);
    }
    return null;
  }, [activeTab]);

  const [readmeCache, setReadmeCache] = useState<Record<string, string>>({});
  const [readmeLoading, setReadmeLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProject?.repoName) return;
    const { id, repoName } = activeProject;
    if (readmeCache[id] !== undefined) return;
    setReadmeLoading(id);
    fetch(`https://api.github.com/repos/noadanon220/${repoName}/readme`, {
      headers: { Accept: 'application/vnd.github.html+json' }
    })
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => setReadmeCache(prev => ({ ...prev, [id]: html })))
      .catch(() => setReadmeCache(prev => ({ ...prev, [id]: '<p style="color:#888">README not found.</p>' })))
      .finally(() => setReadmeLoading(null));
  }, [activeProject?.id]);

  // Dynamic GitHub file tree
  type GhFile = { name: string; path: string; type: 'file' | 'dir'; download_url: string | null };
  const [ghFiles, setGhFiles] = useState<Record<string, GhFile[]>>({});
  const [ghFileContent, setGhFileContent] = useState<Record<string, string>>({});
  const [ghFileLoading, setGhFileLoading] = useState<string | null>(null);

  const fetchGhDir = useCallback((repoName: string, dirPath: string = '') => {
    const key = `${repoName}:${dirPath}`;
    if (ghFiles[key]) return;
    const url = `https://api.github.com/repos/noadanon220/${repoName}/contents${dirPath ? '/' + dirPath : ''}`;
    fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => r.ok ? r.json() : [])
      .then((data: GhFile[]) => setGhFiles(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] })))
      .catch(() => setGhFiles(prev => ({ ...prev, [key]: [] })));
  }, [ghFiles]);

  const fetchGhFile = useCallback((tabId: string, url: string) => {
    if (ghFileContent[tabId] !== undefined || ghFileLoading === tabId) return;
    setGhFileLoading(tabId);
    fetch(url)
      .then(r => r.ok ? r.text() : '// Could not load file')
      .then(text => setGhFileContent(prev => ({ ...prev, [tabId]: text })))
      .catch(() => setGhFileContent(prev => ({ ...prev, [tabId]: '// Could not load file' })))
      .finally(() => setGhFileLoading(null));
  }, [ghFileContent, ghFileLoading]);

  const openFile = useCallback((node: FileNode) => {
    if (node.type === 'folder') return;

    if (!openTabs.find(t => t.id === node.id)) {
      setOpenTabs(prev => [...prev, {
        id: node.id,
        name: node.name,
        fileType: node.fileType || 'typescript',
        projectId: node.projectId,
        specialId: node.specialId
      }]);
    }
    setActiveTabId(node.id);
    history.current = [node.id, ...history.current.filter(id => id !== node.id)];
    logAction(`Opened file: ${node.name}`);
  }, [openTabs, logAction]);

  const openPreferences = useCallback(() => {
    const prefId = 'preferences';
    if (!openTabs.find(t => t.id === prefId)) {
      setOpenTabs(prev => [...prev, {
        id: prefId,
        name: 'Settings',
        fileType: 'settings',
        specialId: 'preferences'
      }]);
    }
    setActiveTabId(prefId);
    history.current = [prefId, ...history.current.filter(id => id !== prefId)];
    logAction('Opened settings workspace');
  }, [openTabs, logAction]);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(prev => !prev);
    logAction(isTerminalOpen ? 'Closed bottom terminal' : 'Opened bottom terminal');
    if (!isTerminalOpen) {
      setTimeout(() => terminalInputRef.current?.focus(), 100);
    }
  }, [isTerminalOpen, logAction]);

  const selectTool = useCallback((tool: ToolType, label: string) => {
    setActiveTool(tool);
    logAction(`Selected ${label} Tool`);

    if (tool === 'pen') {
      openFile({ id: 'index-ts', name: 'index.ts', type: 'file', icon: 'Code2', fileType: 'typescript', specialId: 'index' });
    } else if (tool === 'text') {
      openFile({ id: 'readme', name: 'README.md', type: 'file', icon: 'FileText', fileType: 'markdown', specialId: 'readme' });
    }
  }, [openFile, logAction]);

  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }

      const key = e.key.toLowerCase();

      if (key === '?') {
        setShowHelp(prev => !prev);
      } else if (key === 't') {
        toggleTerminal();
        logAction('Used shortcut [T] to toggle terminal');
      } else if (key === 's') {
        openPreferences();
        logAction('Used shortcut [S] to open settings');
      } else if (key === 'd') {
        setTheme('dark');
        logAction('Used shortcut [D] to switch theme to Dark');
      } else if (key === 'l') {
        setTheme('light');
        logAction('Used shortcut [L] to switch theme to Light');
      } else if (key === 'h') {
        openFile({ id: 'history', name: 'HISTORY.log', type: 'file', specialId: 'history', fileType: 'log', icon: 'History' });
        logAction('Used shortcut [H] to open history log');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTerminal, openPreferences, openFile, logAction, theme]);

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    setTerminalHistory(prev => [...prev, { text: `> ${terminalInput}`, type: 'input' }]);
    setTerminalInput('');
    logAction(`Terminal command executed: ${cmd}`);

    const [main, ...args] = cmd.split(' ');

    switch (main) {
      case 'help':
        setTerminalHistory(prev => [...prev, {
          text: 'Available commands:\n- whoami: About Noa\n- coffee: Brew energy\n- sudo hug: Virtual hug\n- skills: List skills\n- theme [light/dark/studio]: Switch theme\n- neofetch: System stats\n- clear: Clear history',
          type: 'output'
        }]);
        break;
      case 'whoami':
        setTerminalHistory(prev => [...prev, { text: 'Noa Danon - Creative Engineer. Israeli developer building high-fidelity tactile digital experiences with a love for code, design, and polished user journeys.', type: 'output' }]);
        break;
      case 'coffee':
        setTerminalHistory(prev => [...prev, {
          text: '   (  )\n    ( )\n  .---.\n  |   |\n  \'---\'\nBrewing creative energy... Done! ☕',
          type: 'output'
        }]);
        break;
      case 'sudo':
        if (args[0] === 'hug') {
          setTerminalHistory(prev => [...prev, { text: 'Permission granted! Sending a virtual hug... 🤗', type: 'output' }]);
        } else {
          setTerminalHistory(prev => [...prev, { text: 'Usage: sudo hug', type: 'error' }]);
        }
        break;
      case 'skills':
        const skillsList = SKILLS.map(s => `• ${s.name} (${s.category})`).join('\n');
        setTerminalHistory(prev => [...prev, { text: `Technical Skills Manifest:\n${skillsList}`, type: 'output' }]);
        break;
      case 'theme':
        if (['light', 'dark', 'studio'].includes(args[0])) {
          setTheme(args[0] as ThemeMode);
          setTerminalHistory(prev => [...prev, { text: `Theme switched to: ${args[0]}`, type: 'output' }]);
        } else {
          setTerminalHistory(prev => [...prev, { text: 'Usage: theme [light|dark|studio]', type: 'error' }]);
        }
        break;
      case 'neofetch':
        setTerminalHistory(prev => [...prev, {
          text: `   _  _\n  | \\| |\n  | .  |\n  |_|\\_|\n  \n  OS: Noa-OS v8.4\n  Host: Workspace-MacBook-Pro\n  Kernel: Puffy-5.15.0\n  Shell: Puffy-Zsh\n  Theme: ${theme.toUpperCase()}\n  CPU: Creative-M3 Max\n  Memory: 64GiB / Unlimited`,
          type: 'output'
        }]);
        break;
      case 'clear':
        setTerminalHistory([]);
        break;
      default:
        setTerminalHistory(prev => [...prev, { text: 'Command not found. Type "help" for a list of secrets.', type: 'error' }]);
    }
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [actionLog]);

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t.id !== id);

    if (newTabs.length === 0) {
      const readmeTab: Tab = { id: 'readme', name: 'README.md', fileType: 'markdown', specialId: 'readme' };
      setOpenTabs([readmeTab]);
      setActiveTabId('readme');
      history.current = ['readme'];
      return;
    }

    setOpenTabs(newTabs);
    if (activeTabId === id) {
      const nextId = history.current.find(hId => hId !== id && newTabs.some(t => t.id === hId));
      if (nextId) {
        setActiveTabId(nextId);
      } else {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    }
    history.current = history.current.filter(hId => hId !== id);
    logAction(`Closed tab: ${id}`);
  };

  const tools = [
    { id: 'selection', icon: <MousePointer2 size={18} />, label: 'Selection' },
    { id: 'direct-selection', icon: <MousePointerClick size={18} />, label: 'Direct Selection' },
    { id: 'pen', icon: <Pen size={18} />, label: 'Pen' },
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
    { id: 'shapes', icon: <Square size={18} />, label: 'Shapes' },
    { id: 'hand', icon: <Hand size={18} />, label: 'Hand' },
    { id: 'pipette', icon: <Pipette size={18} />, label: 'Eyedropper' },
  ];

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (activeTool !== 'hand') return;
    setDraggedPanelIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (activeTool !== 'hand') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (activeTool !== 'hand' || draggedPanelIndex === null) return;
    e.preventDefault();

    const newOrder = [...layoutOrder];
    const movedPanel = newOrder[draggedPanelIndex];
    const targetPanel = newOrder[dropIndex];

    newOrder[draggedPanelIndex] = targetPanel;
    newOrder[dropIndex] = movedPanel;

    setLayoutOrder(newOrder);
    setDraggedPanelIndex(null);
    logAction(`Workspace Layout updated: [${movedPanel.charAt(0).toUpperCase() + movedPanel.slice(1)}] moved to position ${dropIndex}`);
  };

  const gridTemplateColumns = useMemo(() => {
    return layoutOrder.map((id, index) => {
      let width = '';
      if (id === 'tools') width = '64px';
      else if (id === 'explorer') width = `${sidebarWidth}px`;
      else if (id === 'canvas') width = '1fr';
      else if (id === 'inspector') width = `${inspectorWidth}px`;

      const isLast = index === layoutOrder.length - 1;
      return isLast ? width : `${width} 4px`;
    }).join(' ');
  }, [layoutOrder, sidebarWidth, inspectorWidth]);

  return (
    <ErrorBoundary>
      <div
        className={`workspace-frame h-screen w-screen p-3 gap-3 bg-workspace grid overflow-hidden transition-all duration-300 ${activeTool === 'hand' ? (draggedPanelIndex !== null ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        style={{
          gridTemplateColumns,
          gridTemplateRows: '72px 1fr 42px',
          userSelect: (isResizingSidebar.current || isResizingInspector.current || isResizingTerminal.current || draggedPanelIndex !== null) ? 'none' : 'auto'
        }}
      >
        <header className="col-span-7 soft-panel flex items-center justify-between px-8 min-w-0">
          <div className="flex items-center gap-6 overflow-hidden flex-1 mr-4 min-w-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 shrink-0">
              <Command size={20} />
            </div>

            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              {breadcrumbPath.map((segment, i) => (
                <React.Fragment key={i}>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest truncate whitespace-nowrap transition-colors duration-200 ${i === breadcrumbPath.length - 1 ? 'text-puffyIndigo' : 'text-mutedText'}`}>
                    {segment}
                  </span>
                  {i < breadcrumbPath.length - 1 && <ChevronRight size={12} className="text-mutedText opacity-30 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-mainText/5 px-4 py-2 rounded-xl border border-borderCol shadow-inner">
              <Search size={14} className="text-mutedText" />
              <span className="text-[10px] text-mutedText font-mono uppercase tracking-widest whitespace-nowrap">Find_in_Files</span>
            </div>
            <div className="w-px h-6 bg-borderCol mx-2" />
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHelp(true)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-mainText/5 text-mutedText transition-colors">
                <Keyboard size={18} />
              </button>
              <button onClick={toggleTerminal} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isTerminalOpen ? 'text-puffyIndigo bg-sidebar shadow-sm' : 'text-mutedText hover:bg-mainText/5'}`}>
                <TerminalIcon size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-mainText/5 text-mutedText transition-colors"><Monitor size={18} /></button>
              <button onClick={openPreferences} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTabId === 'preferences' ? 'text-puffyIndigo bg-sidebar shadow-sm' : 'text-mutedText hover:bg-mainText/5'}`}>
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        {layoutOrder.map((panelId, index) => (
          <React.Fragment key={panelId}>
            {/* Panel Rendering Wrapper */}
            <div
              draggable={activeTool === 'hand'}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`h-full overflow-hidden flex flex-col transition-opacity duration-200 ${draggedPanelIndex === index ? 'opacity-40 border-2 border-dashed border-puffyIndigo rounded-3xl' : ''}`}
            >
              {panelId === 'tools' && (
                <aside className="soft-panel flex flex-col items-center py-6 gap-4 overflow-y-auto no-scrollbar border-r border-borderCol h-full w-full">
                  {tools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => selectTool(tool.id as ToolType, tool.label)}
                      title={tool.label}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm relative group ${activeTool === tool.id ? 'bg-puffyIndigo text-white shadow-lg shadow-puffyIndigo/30 scale-105' : 'text-mutedText hover:bg-mainText/5'}`}
                    >
                      {tool.icon}
                      <div className="absolute left-14 px-2 py-1 bg-mainText text-canvas text-[9px] font-mono font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest">
                        {tool.label}
                      </div>
                    </button>
                  ))}
                </aside>
              )}

              {panelId === 'explorer' && (
                <aside className="soft-panel flex flex-col overflow-hidden relative min-w-0 h-full w-full">
                  <div className="px-4 py-8 flex flex-col gap-6 overflow-y-auto flex-1 no-scrollbar">
                    <h2 className="px-2 text-[10px] font-mono font-bold text-puffyIndigo uppercase tracking-[0.3em] flex items-center gap-2 mb-2 truncate">
                      EXPLORER
                    </h2>
                    <div className="flex flex-col gap-0.5 select-none min-w-0">
                      {FILE_TREE.map(node => (
                        <FileTreeItem key={node.id} node={node} level={0} activeId={activeTabId} onSelect={openFile} />
                      ))}
                    </div>
                  </div>
                  <div className="p-6 border-t border-borderCol shrink-0">
                    <div className="flex flex-col gap-6">
                      <button onClick={() => openFile({ id: 'history', name: 'HISTORY.log', type: 'file', icon: 'History', fileType: 'log', specialId: 'history' })} className={`flex items-center gap-3 transition-colors ${activeTabId === 'history' ? 'text-puffyIndigo' : 'text-mutedText hover:text-puffyIndigo'}`}>
                        <HistoryIcon size={18} className="shrink-0" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest truncate">Activity</span>
                      </button>
                      <button onClick={toggleTerminal} className={`flex items-center gap-3 transition-colors ${isTerminalOpen ? 'text-puffyIndigo' : 'text-mutedText hover:text-puffyIndigo'}`}>
                        <TerminalIcon size={18} className="shrink-0" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest truncate">Terminal</span>
                      </button>
                      <button onClick={openPreferences} className={`flex items-center gap-3 transition-colors ${activeTabId === 'preferences' ? 'text-puffyIndigo' : 'text-mutedText hover:text-puffyIndigo'}`}>
                        <Settings size={18} className="shrink-0" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest truncate">Preferences</span>
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-50 border-2 border-sidebar flex items-center justify-center text-pink-400 shadow-sm shrink-0"><Activity size={14} /></div>
                        <span className="text-[10px] font-mono font-bold uppercase text-mutedText tracking-widest truncate">Status_OK</span>
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              {panelId === 'canvas' && (
                <div className="flex flex-col min-w-0 h-full gap-3 overflow-hidden">
                  <main className={`canvas-viewport bg-dot-grid flex flex-col min-w-0 flex-1 h-full ${activeTool === 'pipette' ? 'cursor-crosshair' : ''}`}>
                    <div className="flex items-center h-11 bg-sidebar/40 border-b border-borderCol px-2 gap-px overflow-x-auto no-scrollbar shrink-0">
                      {openTabs.map(tab => {
                        const Icon = (LucideIcons as any)[tab.fileType === 'log' ? 'History' : (tab.fileType === 'markdown' ? 'FileText' : (tab.fileType === 'json' ? 'FileJson' : (tab.fileType === 'settings' ? 'Settings' : (tab.fileType === 'shell' ? 'TerminalIcon' : 'FileCode'))))];
                        const ResolvedIcon = Icon || FileText;
                        return (
                          <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`flex items-center gap-2 px-4 h-full min-w-[140px] text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-t-2 relative cursor-pointer group select-none shrink-0 ${activeTabId === tab.id ? 'bg-canvas text-puffyIndigo border-puffyIndigo shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-mutedText border-transparent hover:bg-mainText/5'}`}>
                            <ResolvedIcon size={12} className={activeTabId === tab.id ? 'text-puffyIndigo' : 'text-mutedText'} />
                            <span className="truncate">{tab.name}</span>
                            <button onClick={(e) => closeTab(e, tab.id)} className="ml-auto p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-mainText/10 transition-all shrink-0">
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex-1 relative p-6 md:p-10 overflow-y-auto overflow-x-hidden flex flex-col items-center no-scrollbar">
                      <div className="w-full max-w-5xl h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab?.specialId === 'history' && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label="Git_Graph_v8.4" inset="-8px" />
                            <div className="puffy-card flex-1 flex flex-col shadow-2xl overflow-hidden pointer-events-auto h-full p-10 md:p-16">
                              <div className="flex items-center gap-4 mb-10 border-b border-borderCol pb-8">
                                <GitBranch className="text-puffyIndigo" size={24} />
                                <div className="flex flex-col">
                                  <h2 className="text-3xl font-fredoka font-bold text-mainText">Workspace History</h2>
                                  <p className="text-xs font-mono text-mutedText uppercase tracking-widest">Tracking local mutations and session state</p>
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
                                <div className="relative pl-8">
                                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-puffyIndigo/10" />
                                  <div className="flex flex-col gap-8">
                                    {actionLog.map((log, i) => (
                                      <div key={log.id} className="relative group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                        <div className="absolute -left-[28px] top-1 w-4 h-4 rounded-full bg-canvas border-2 border-puffyIndigo shadow-[0_2px_8px_rgba(99,102,241,0.2)] group-hover:scale-125 transition-transform z-10" />
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono font-bold text-puffyIndigo uppercase tracking-widest">Commit: {log.id}</span>
                                            <span className="text-[9px] font-mono text-mutedText">{log.timestamp}</span>
                                          </div>
                                          <p className="text-lg font-fredoka text-mainText/80 leading-snug">{log.message}</p>
                                        </div>
                                      </div>
                                    ))}
                                    <div ref={historyEndRef} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab?.specialId === 'readme' && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label="Markdown_Viewer" inset="-8px" />
                            <div className="puffy-card flex-1 flex flex-col shadow-2xl overflow-hidden pointer-events-auto h-full">
                              <div className="flex-1 overflow-y-auto p-12 md:p-16 flex flex-col gap-10 no-scrollbar">

                                {/* Hero */}
                                <div className="flex flex-col gap-4 border-b border-borderCol pb-10">
                                  <div className="flex items-center gap-3 opacity-40">
                                    <Fingerprint size={14} className="text-mainText" />
                                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-mainText">identity.verified</span>
                                  </div>
                                  <h1 className="text-6xl md:text-8xl font-fredoka font-bold text-mainText leading-none tracking-tighter">NOA DANON</h1>
                                  <p className="text-xl md:text-2xl font-fredoka text-mutedText italic">CS Graduate · Android & Full-Stack Developer · AppSec Enthusiast</p>
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {['Java', 'Kotlin', 'C++', 'React', 'TypeScript', 'Firebase', 'OWASP'].map(t => (
                                      <span key={t} className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-puffyIndigo/10 text-puffyIndigo border border-puffyIndigo/20">{t}</span>
                                    ))}
                                  </div>
                                </div>

                                {/* About */}
                                <div className="flex flex-col gap-4">
                                  <h3 className="text-[11px] font-mono font-bold text-puffyIndigo uppercase tracking-[0.4em]"># about.md</h3>
                                  <p className="text-xl font-fredoka text-mainText/80 leading-relaxed">
                                    I love building things that actually help people — whether it's a dog-care app that makes a pet owner's life easier, or a security-conscious system that stays safe under pressure. I think analytically, pick up new tools fast, and bring a designer's eye to everything I build.
                                  </p>
                                  <p className="text-xl font-fredoka text-mainText/80 leading-relaxed">
                                    Before CS, I spent 3 years as a <span className="text-puffyIndigo font-bold">freelance graphic designer</span> — which means I understand both how systems are built <em>and</em> how they look to the people using them.
                                  </p>
                                </div>

                                {/* Education */}
                                <div className="flex flex-col gap-4">
                                  <h3 className="text-[11px] font-mono font-bold text-puffyIndigo uppercase tracking-[0.4em]"># education.md</h3>
                                  <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-mainText/[0.03] border border-borderCol">
                                      <div className="w-2 h-2 rounded-full bg-puffyIndigo mt-2 shrink-0" />
                                      <div>
                                        <p className="font-bold text-mainText font-fredoka text-lg">B.Sc. Computer Science</p>
                                        <p className="text-mutedText text-sm font-mono">Afeka College of Engineering, Tel Aviv · 2023 – 2026</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-mainText/[0.03] border border-borderCol">
                                      <div className="w-2 h-2 rounded-full bg-mutedText/40 mt-2 shrink-0" />
                                      <div>
                                        <p className="font-bold text-mainText font-fredoka text-lg">Diploma in Animation & Design</p>
                                        <p className="text-mutedText text-sm font-mono">Israeli Animation and Design College, Tel Aviv · 2018 – 2019</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Grades */}
                                <div className="flex flex-col gap-4">
                                  <h3 className="text-[11px] font-mono font-bold text-puffyIndigo uppercase tracking-[0.4em]"># grades.json</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {COURSES.map(c => (
                                      <div key={c.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-mainText/[0.03] border border-borderCol">
                                        <span className="text-sm font-fredoka text-mainText/80">{c.name}</span>
                                        <span className={`text-sm font-mono font-bold ${c.grade === 100 ? 'text-emerald-500' : c.grade >= 95 ? 'text-puffyIndigo' : c.grade >= 90 ? 'text-blue-500' : 'text-mutedText'}`}>{c.grade}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Contact */}
                                <div className="flex flex-col gap-4 border-t border-borderCol pt-10">
                                  <h3 className="text-[11px] font-mono font-bold text-puffyIndigo uppercase tracking-[0.4em]"># contact.md</h3>
                                  <div className="flex flex-wrap gap-3">
                                    <a href="mailto:noadanon220@gmail.com" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-puffyIndigo text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg">
                                      <Mail size={14} /> noadanon220@gmail.com
                                    </a>
                                    <a href="https://www.linkedin.com/in/noadanon/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-canvas border border-borderCol text-mainText font-bold text-sm hover:bg-mainText/5 transition-all shadow-sm">
                                      <Linkedin size={14} /> LinkedIn
                                    </a>
                                    <a href="https://github.com/noadanon220" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-canvas border border-borderCol text-mainText font-bold text-sm hover:bg-mainText/5 transition-all shadow-sm">
                                      <Github size={14} /> GitHub
                                    </a>
                                    <a href="tel:+972542392442" className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-canvas border border-borderCol text-mainText font-bold text-sm hover:bg-mainText/5 transition-all shadow-sm">
                                      <Phone size={14} /> +972-54-239-2442
                                    </a>

                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab?.specialId === 'hello-world' && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label="Primary_Editor_Surface" inset="-8px" />
                            <div className="puffy-card flex-1 overflow-hidden shadow-2xl flex flex-col pointer-events-auto h-full">
                              <CodeEditor value={fileContents['hello-world']} onChange={(val) => handleFileChange('hello-world', val)} language="tsx" />
                            </div>
                          </div>
                        )}
                        {activeTab?.specialId === 'index' && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label="Primary_Editor_Surface" inset="-8px" />
                            <div className="puffy-card flex-1 overflow-hidden shadow-2xl flex flex-col pointer-events-auto h-full">
                              <CodeEditor value={fileContents['index']} onChange={(val) => handleFileChange('index', val)} language="typescript" />
                            </div>
                          </div>
                        )}
                        {activeTab?.specialId === 'preferences' && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label="IDE_Configuration" inset="-8px" />
                            <div className="puffy-card flex w-full h-full overflow-hidden shadow-2xl pointer-events-auto">
                              <div className="w-full flex h-full">
                                <div className="w-44 border-r border-borderCol flex flex-col p-6 gap-2 shrink-0 bg-sidebar/30 overflow-y-auto no-scrollbar">
                                  <span className="text-[10px] font-bold text-mutedText uppercase tracking-widest mb-4">Settings</span>
                                  {['Appearance', 'Environment', 'Editor', 'Terminal', 'Extensions'].map(s => (
                                    <div key={s} onClick={() => setActiveSettingsTab(s)} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${activeSettingsTab === s ? 'bg-puffyIndigo/10 text-puffyIndigo' : 'text-mutedText hover:bg-mainText/5'}`}>{s}</div>
                                  ))}
                                </div>
                                <div className="flex-1 p-10 bg-canvas overflow-y-auto">
                                  <h3 className="text-2xl font-fredoka font-bold mb-8">{activeSettingsTab}</h3>
                                  <SettingsRow title="Workbench: Theme" description="Visual flavor of the IDE workspace.">
                                    <div className="flex gap-2 flex-wrap">
                                      {(['light', 'contrast', 'dark', 'studio'] as ThemeMode[]).map(t => (
                                        <button key={t} onClick={() => setTheme(t)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${theme === t ? 'bg-puffyIndigo text-white' : 'bg-mainText/5'}`}>{t}</button>
                                      ))}
                                    </div>
                                  </SettingsRow>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {activeTab?.projectId && activeProject && (
                          <div className="selection-container relative w-full h-full flex flex-col pointer-events-auto">
                            <SelectionOutline label={`Project_${activeProject.id}`} inset="-8px" />
                            <div className="puffy-card flex-1 flex flex-col shadow-2xl overflow-hidden pointer-events-auto h-full">

                              {/* GitHub-like top bar */}
                              <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-borderCol bg-sidebar/40 gap-3 flex-wrap" style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
                                <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                                  <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" className="text-mainText opacity-60 shrink-0"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                                  <span className="text-mutedText text-xs">noadanon220</span>
                                  <span className="text-mutedText text-xs">/</span>
                                  <span className="text-puffyIndigo font-bold text-xs truncate">{activeProject.repoName ?? activeProject.id}</span>
                                  {activeProject.featured && <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-600 border border-amber-400/30 shrink-0">★ Featured</span>}
                                </div>
                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                  {activeProject.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-puffyIndigo/10 text-puffyIndigo border border-puffyIndigo/20">{tag}</span>
                                  ))}
                                  {activeProject.githubUrl && (
                                    <a href={activeProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-borderCol bg-canvas hover:bg-mainText/5 transition-colors text-mainText ml-2">
                                      <Code2 size={11} /> View on GitHub
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 overflow-y-auto no-scrollbar bg-canvas" style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif' }}>
                                <style>{`
                                  .gh-readme { color: var(--text-main); font-size: 16px; line-height: 1.6; padding: 32px 40px; max-width: 860px; margin: 0 auto; }
                                  .gh-readme h1, .gh-readme h2 { border-bottom: 1px solid var(--border-color); padding-bottom: .3em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; color: var(--text-main); }
                                  .gh-readme h1 { font-size: 2em; }
                                  .gh-readme h2 { font-size: 1.5em; }
                                  .gh-readme h3 { font-size: 1.25em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; color: var(--text-main); }
                                  .gh-readme p { margin-top: 0; margin-bottom: 16px; }
                                  .gh-readme strong { color: var(--text-main); }
                                  .gh-readme a { color: var(--puffy-indigo); text-decoration: none; } .gh-readme a:hover { text-decoration: underline; }
                                  .gh-readme code { background: var(--border-color); padding: .2em .4em; border-radius: 6px; font-size: 85%; font-family: ui-monospace,SFMono-Regular,monospace; color: var(--text-main); }
                                  .gh-readme pre { background: var(--workspace-bg); border: 1px solid var(--border-color); padding: 16px; border-radius: 6px; overflow: auto; margin-bottom: 16px; }
                                  .gh-readme pre code { background: none; padding: 0; font-size: 100%; border: none; }
                                  .gh-readme ul, .gh-readme ol { padding-left: 2em; margin-bottom: 16px; }
                                  .gh-readme li { margin-top: 4px; }
                                  .gh-readme img { max-width: 100%; border-radius: 6px; }
                                  .gh-readme blockquote { color: var(--text-muted); border-left: .25em solid var(--border-color); padding: 0 1em; margin: 0 0 16px; }
                                  .gh-readme table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
                                  .gh-readme th, .gh-readme td { border: 1px solid var(--border-color); padding: 6px 13px; color: var(--text-main); }
                                  .gh-readme th { background: var(--workspace-bg); }
                                  .gh-readme tr:nth-child(even) { background: var(--workspace-bg); }
                                  .gh-readme hr { border: 0; border-top: 1px solid var(--border-color); margin: 24px 0; }
                                `}</style>

                                {!activeProject.repoName ? (
                                  <div className="gh-readme">
                                    <h1>{activeProject.title}</h1>
                                    <blockquote><em>Private / Academic Repository</em></blockquote>
                                    <p>{activeProject.description}</p>
                                    <h2>Tech Stack</h2>
                                    <ul>{activeProject.tags.map(t => <li key={t}><code>{t}</code></li>)}</ul>
                                    <h2>Key Highlights</h2>
                                    <ul>
                                      <li>Four AI unit types (Commander, Warrior, Medic, Supplier) with distinct FSM-based behavior logic</li>
                                      <li>Pathfinding via <strong>A*</strong> and <strong>BFS</strong> across a dynamic, procedurally updated map</li>
                                      <li>Concurrent multi-agent state management with real-time <strong>OpenGL</strong> rendering</li>
                                      <li>Managing edge cases and state corruption sharpened a security-oriented mindset — understanding how systems break</li>
                                    </ul>
                                    <h2>What I Learned</h2>
                                    <p>This project pushed me to think like a systems engineer — reasoning about race conditions, state integrity, and unexpected agent interactions under real-time constraints. A mindset directly applicable to code review and vulnerability identification.</p>
                                  </div>
                                ) : readmeLoading === activeProject.id ? (
                                  <div className="gh-readme text-mutedText">Loading README...</div>
                                ) : (
                                  <div className="gh-readme" dangerouslySetInnerHTML={{ __html: readmeCache[activeProject.id] ?? '' }} />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </main>

                  {isTerminalOpen && (
                    <React.Fragment>
                      <div className="splitter-h group shrink-0" onMouseDown={() => isResizingTerminal.current = true} onDoubleClick={() => setTerminalHeight(DEFAULT_TERMINAL_HEIGHT)}>
                        <div className="splitter-handle-h" />
                      </div>
                      <div className="soft-panel overflow-hidden flex flex-col min-w-0" style={{ height: terminalHeight }}>
                        <div className="flex items-center justify-between px-6 py-2 border-b border-borderCol bg-sidebar/40 shrink-0">
                          <div className="flex items-center gap-6">
                            {['TERMINAL', 'OUTPUT', 'DEBUG CONSOLE', 'PORTS'].map(t => (
                              <button key={t} onClick={() => setActiveTerminalTab(t)} className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${activeTerminalTab === t ? 'text-puffyIndigo underline decoration-2 underline-offset-4' : 'text-mutedText hover:text-mainText'}`}>{t}</button>
                            ))}
                          </div>
                          <button onClick={toggleTerminal} className="p-1 hover:bg-mainText/5 rounded-md text-mutedText transition-all"><X size={14} /></button>
                        </div>
                        <div className="flex-1 puffy-card m-3 mt-1 overflow-hidden bg-mainText text-canvas p-6 font-mono text-xs pointer-events-auto selection:bg-puffyIndigo selection:text-white flex flex-col">
                          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5">
                            {terminalHistory.map((line, i) => (
                              <div key={i} className={`whitespace-pre-wrap leading-relaxed ${line.type === 'input' ? 'text-emerald-400 font-bold' : (line.type === 'error' ? 'text-rose-400' : 'text-canvas/90')}`}>{line.text}</div>
                            ))}
                            <div ref={terminalEndRef} />
                          </div>
                          <form onSubmit={handleTerminalCommand} className="mt-3 flex items-center gap-3 shrink-0">
                            <span className="text-puffyIndigo font-bold">➜</span>
                            <span className="text-emerald-400 font-bold">~</span>
                            <input ref={terminalInputRef} type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} spellCheck={false} autoComplete="off" className="flex-1 bg-transparent border-none outline-none text-canvas caret-puffyIndigo placeholder:text-canvas/20" placeholder="Type command..." />
                          </form>
                        </div>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              )}

              {panelId === 'inspector' && (
                <aside className="soft-panel flex flex-col gap-8 p-8 overflow-y-auto min-w-0 no-scrollbar h-full w-full">
                  <div className="flex items-center justify-between border-b border-borderCol pb-4 shrink-0">
                    <h2 className="text-[10px] font-mono font-bold text-mutedText uppercase tracking-[0.3em] flex items-center gap-2 truncate">
                      <span className="shrink-0"><Info size={14} /></span>
                      <span className="truncate">Inspector</span>
                    </h2>
                    <div className="flex gap-1.5 opacity-20 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  {activeTab ? (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300 min-w-0">
                      <div className="flex flex-col gap-1 min-w-0">
                        <label className="text-[9px] font-mono font-bold text-puffyIndigo uppercase tracking-widest">Active_Node</label>
                        <div className="p-3 bg-canvas rounded-xl border border-puffyIndigo/20 text-xs font-mono font-bold text-puffyIndigo truncate flex items-center gap-2 shadow-sm min-w-0">
                          {activeTab.fileType === 'log' ? <HistoryIcon size={12} className="opacity-40 shrink-0" /> : <FileText size={12} className="opacity-40 shrink-0" />}
                          <span className="truncate">{activeTab.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                      <BoxSelect size={32} strokeWidth={1} className="mb-4 text-mainText" />
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-mainText">No_Buffer_Selected</p>
                    </div>
                  )}
                </aside>
              )}
            </div>

            {/* Splitter Logic between panels */}
            {index < layoutOrder.length - 1 && (
              <div
                className="splitter-v group shrink-0"
                onMouseDown={() => {
                  const currentPanel = layoutOrder[index];
                  const nextPanel = layoutOrder[index + 1];
                  if (currentPanel === 'explorer' || nextPanel === 'explorer') isResizingSidebar.current = true;
                  else if (currentPanel === 'inspector' || nextPanel === 'inspector') isResizingInspector.current = true;
                }}
                onDoubleClick={() => {
                  const currentPanel = layoutOrder[index];
                  const nextPanel = layoutOrder[index + 1];
                  if (currentPanel === 'explorer' || nextPanel === 'explorer') setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
                  else if (currentPanel === 'inspector' || nextPanel === 'inspector') setInspectorWidth(DEFAULT_INSPECTOR_WIDTH);
                }}
              >
                <div className="splitter-handle" />
              </div>
            )}
          </React.Fragment>
        ))}

        <footer className="col-span-7 soft-panel bg-statusbar px-10 flex items-center justify-between text-statusbarFg shadow-xl shadow-puffyShadow transition-colors duration-400 shrink-0 overflow-hidden">
          <div className="flex items-center gap-8 text-[9px] font-mono font-bold uppercase tracking-widest h-full min-w-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              <span className="translate-y-[0.5px]">Environment: Production</span>
            </div>
            <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <Layers size={10} strokeWidth={3} className="opacity-80 shrink-0" />
              <span className="translate-y-[0.5px]">Branch: master</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-mono font-bold uppercase tracking-widest h-full shrink-0">
            <div className="flex items-center gap-3 mr-2">
              {SOCIAL_LINKS.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-full bg-mainText/5 hover:bg-mainText/10 flex items-center justify-center transition-all active:scale-90 shrink-0">
                  {React.cloneElement(link.icon as React.ReactElement<any>, { size: 10, strokeWidth: 2.5, className: 'text-current' })}
                </a>
              ))}
            </div>
            <div className="w-px h-4 bg-statusbarFgMuted" />
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-statusbarFgMuted">UTF-8</span>
            </div>
          </div>
        </footer>

        {showHelp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setShowHelp(false)}>
            <div className="absolute inset-0 bg-mainText/20 backdrop-blur-md" />
            <div className="puffy-card w-full max-w-lg p-10 relative animate-in zoom-in-95 duration-300 pointer-events-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8 border-b border-borderCol pb-6">
                <div className="flex items-center gap-4">
                  <Keyboard className="text-puffyIndigo" size={28} />
                  <h2 className="text-3xl font-fredoka font-bold text-mainText">Workspace Shortcuts</h2>
                </div>
                <button onClick={() => setShowHelp(false)} className="w-10 h-10 rounded-full hover:bg-mainText/5 flex items-center justify-center text-mutedText transition-all"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { key: '?', label: 'Toggle Help Modal' },
                  { key: 'T', label: 'Toggle Bottom Terminal' },
                  { key: 'S', label: 'Open Settings' },
                  { key: 'D', label: 'Switch to Dark Mode' },
                  { key: 'L', label: 'Switch to Light Mode' },
                  { key: 'H', label: 'Open History Log' },
                ].map(shortcut => (
                  <div key={shortcut.key} className="flex items-center justify-between group">
                    <span className="text-sm font-fredoka text-mutedText group-hover:text-mainText transition-colors">{shortcut.label}</span>
                    <div className="flex items-center justify-center min-w-[32px] h-8 bg-canvas border border-borderCol rounded-lg shadow-sm text-xs font-mono font-bold text-puffyIndigo uppercase">{shortcut.key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
