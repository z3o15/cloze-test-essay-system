import { useState, useEffect, useRef } from 'react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Search, Plus, Trash2, Calendar, BookOpen, Clock, ArrowLeft, Languages, Volume2 } from 'lucide-react';
import { Essay } from './types/essay';
import { saveEssay, getEssays, deleteEssay, getEssayById } from './utils/storage';
import { getWordInfo, translateSentence, WordInfo } from './utils/mockData';
import { toast } from 'sonner@2.0.3';

type Page = 'list' | 'input' | 'view';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [viewingEssayId, setViewingEssayId] = useState<string | null>(null);

  const navigateToList = () => {
    setCurrentPage('list');
    setViewingEssayId(null);
  };

  const navigateToInput = () => {
    setCurrentPage('input');
  };

  const navigateToView = (essayId: string) => {
    setViewingEssayId(essayId);
    setCurrentPage('view');
  };

  return (
    <div className="size-full">
      {currentPage === 'list' && (
        <EssayListPage
          onNavigateToInput={navigateToInput}
          onNavigateToView={navigateToView}
        />
      )}
      
      {currentPage === 'input' && (
        <EssayInputPage onSubmit={navigateToList} />
      )}
      
      {currentPage === 'view' && viewingEssayId && (
        <EssayViewPage
          essayId={viewingEssayId}
          onBack={navigateToList}
        />
      )}
      
      <Toaster position="top-center" />
    </div>
  );
}

// ==================== 作文录入页面 ====================
interface EssayInputPageProps {
  onSubmit: () => void;
}

function EssayInputPage({ onSubmit }: EssayInputPageProps) {
  const [year, setYear] = useState<string>('2024');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<'英语一' | '英语二'>('英语一');
  const [content, setContent] = useState<string>('');
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // 生成年份选项（2000-2024）
  const years = Array.from({ length: 25 }, (_, i) => 2024 - i);

  // 处理内容输入，自动过滤多余空格和无效换行
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let text = e.target.value;
    // 过滤多余空格（保留单个空格）
    text = text.replace(/  +/g, ' ');
    // 保留段落结构，移除多余换行（超过2个连续换行）
    text = text.replace(/\n{3,}/g, '\n\n');
    setContent(text);
  };

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // 清理粘贴的文本
    let cleanText = pastedText;
    cleanText = cleanText.replace(/  +/g, ' '); // 移除多余空格
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n'); // 保留段落，移除多余换行
    cleanText = cleanText.trim();
    
    setContent(cleanText);
    
    // 粘贴后自动聚焦确认按钮
    setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 100);
  };

  // 确认录入
  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('请输入作文标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入作文内容');
      return;
    }

    const essay: Essay = {
      id: Date.now().toString(),
      year: parseInt(year),
      title: title.trim(),
      type,
      content: content.trim(),
      createdAt: Date.now()
    };

    saveEssay(essay);
    toast.success('作文录入成功！');
    
    // 跳转到列表页
    setTimeout(() => {
      onSubmit();
    }, 500);
  };

  // 清空重输
  const handleReset = () => {
    setYear('2024');
    setTitle('');
    setType('英语一');
    setContent('');
    toast.info('已清空输入内容');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-center text-blue-600 mb-2">考研英语作文录入</h1>
          <p className="text-center text-muted-foreground">录入历年真题作文，开启高效学习</p>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="space-y-6">
            {/* 年份选择 */}
            <div className="space-y-2">
              <Label>年份</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="选择年份" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 题型选择 */}
            <div className="space-y-2">
              <Label>题目类型</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={type === '英语一' ? 'default' : 'outline'}
                  onClick={() => setType('英语一')}
                  className="flex-1"
                >
                  英语一
                </Button>
                <Button
                  type="button"
                  variant={type === '英语二' ? 'default' : 'outline'}
                  onClick={() => setType('英语二')}
                  className="flex-1"
                >
                  英语二
                </Button>
              </div>
            </div>

            {/* 标题输入 */}
            <div className="space-y-2">
              <Label>作文标题</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入作文标题，例如：环境保护主题"
                className="bg-input-background"
              />
            </div>

            {/* 作文内容 */}
            <div className="space-y-2">
              <Label>作文内容</Label>
              <Textarea
                value={content}
                onChange={handleContentChange}
                onPaste={handlePaste}
                placeholder="请输入或粘贴作文内容...&#10;&#10;支持自动清理多余空格和换行符，保留段落结构"
                className="min-h-[300px] max-h-[500px] bg-input-background resize-none"
              />
              <p className="text-sm text-muted-foreground">
                已输入 {content.length} 字符
              </p>
            </div>
          </div>
        </Card>

        {/* 底部操作按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              清空重输
            </Button>
            <Button
              ref={confirmButtonRef}
              onClick={handleSubmit}
              className="flex-1"
            >
              确认录入
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 作文管理页面 ====================
interface EssayListPageProps {
  onNavigateToInput: () => void;
  onNavigateToView: (essayId: string) => void;
}

function EssayListPage({ onNavigateToInput, onNavigateToView }: EssayListPageProps) {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [filteredEssays, setFilteredEssays] = useState<Essay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [essayToDelete, setEssayToDelete] = useState<Essay | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // 加载作文列表
  useEffect(() => {
    loadEssays();
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEssays(essays);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = essays.filter(essay => 
        essay.year.toString().includes(query) ||
        essay.title.toLowerCase().includes(query) ||
        essay.type.includes(query)
      );
      setFilteredEssays(filtered);
    }
  }, [searchQuery, essays]);

  const loadEssays = () => {
    const loadedEssays = getEssays();
    // 按录入时间倒序排列
    const sorted = loadedEssays.sort((a, b) => b.createdAt - a.createdAt);
    setEssays(sorted);
    setFilteredEssays(sorted);
  };

  const handleDeleteClick = (essay: Essay) => {
    setEssayToDelete(essay);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (essayToDelete) {
      deleteEssay(essayToDelete.id);
      toast.success('作文已删除');
      loadEssays();
      setSwipedId(null);
    }
    setDeleteDialogOpen(false);
    setEssayToDelete(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理左滑
  const handleSwipe = (essayId: string) => {
    setSwipedId(swipedId === essayId ? null : essayId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
        <div className="p-4">
          <h1 className="text-center text-blue-600 mb-4">作文管理</h1>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索年份、标题或题型..."
              className="pl-10 bg-input-background"
            />
          </div>
        </div>
      </div>

      {/* 作文列表 */}
      <div className="p-4 pb-20">
        {filteredEssays.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto mb-4 text-muted-foreground" size={64} />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? '未找到匹配的作文' : '还没有录入任何作文'}
            </p>
            {!searchQuery && (
              <Button onClick={onNavigateToInput}>
                <Plus className="mr-2" size={16} />
                录入第一篇作文
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEssays.map((essay) => (
              <div key={essay.id} className="relative overflow-hidden">
                {/* 删除按钮背景 */}
                <div className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center">
                  <Trash2 className="text-destructive-foreground" size={20} />
                </div>

                {/* 作文卡片 */}
                <Card
                  className={`relative transition-transform duration-300 cursor-pointer hover:shadow-md ${
                    swipedId === essay.id ? '-translate-x-20' : ''
                  }`}
                  onClick={() => {
                    if (swipedId === essay.id) {
                      setSwipedId(null);
                    } else {
                      onNavigateToView(essay.id);
                    }
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const startX = touch.clientX;
                    
                    const handleTouchMove = (e: TouchEvent) => {
                      const touch = e.touches[0];
                      const deltaX = startX - touch.clientX;
                      if (deltaX > 50) {
                        handleSwipe(essay.id);
                        document.removeEventListener('touchmove', handleTouchMove);
                      }
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                    }, { once: true });
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="flex-1">{essay.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(essay);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{essay.year}年</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{essay.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDate(essay.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 浮动添加按钮 */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
          onClick={onNavigateToInput}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除作文《{essayToDelete?.title}》吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==================== 作文展示页面 ====================
interface EssayViewPageProps {
  essayId: string;
  onBack: () => void;
}

function EssayViewPage({ essayId, onBack }: EssayViewPageProps) {
  const [essay, setEssay] = useState<Essay | null>(null);
  const [wordDialogOpen, setWordDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTranslateButton, setShowTranslateButton] = useState(false);
  const [translation, setTranslation] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [scale, setScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadedEssay = getEssayById(essayId);
    if (loadedEssay) {
      setEssay(loadedEssay);
    }
  }, [essayId]);

  // 处理单词点击
  const handleWordClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const text = target.textContent || '';
    
    // 匹配英文单词
    const wordMatch = text.match(/[a-zA-Z]+/);
    if (wordMatch) {
      const word = wordMatch[0];
      const wordInfo = getWordInfo(word);
      setSelectedWord(wordInfo);
      setWordDialogOpen(true);
    }
  };

  // 处理文本选择（用于句子翻译）
  const handleTextSelection = () => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      if (text.length > 0) {
        // 检查是否是完整句子（包含句号、问号或感叹号）
        if (text.match(/[.!?]$/)) {
          setSelectedText(text);
          setShowTranslateButton(true);
          toast.success('选中成功');
        } else {
          toast.info('请选择完整的句子（需包含句号）');
        }
      } else {
        setShowTranslateButton(false);
        setShowTranslation(false);
      }
    }, 300);
  };

  // 处理翻译
  const handleTranslate = () => {
    if (selectedText) {
      const translated = translateSentence(selectedText);
      setTranslation(translated);
      setShowTranslation(true);
    }
  };

  // 收起翻译
  const handleHideTranslation = () => {
    setShowTranslation(false);
    setShowTranslateButton(false);
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  };

  // 处理双指缩放（触摸设备）
  useEffect(() => {
    let initialDistance = 0;
    let initialScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const newScale = initialScale * (currentDistance / initialDistance);
        setScale(Math.min(Math.max(0.5, newScale), 2));
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [scale]);

  if (!essay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">作文不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h2>{essay.title}</h2>
            <p className="text-sm text-muted-foreground">
              {essay.year}年 · {essay.type}
            </p>
          </div>
          {showTranslateButton && (
            <Button size="sm" onClick={handleTranslate}>
              <Languages className="mr-2" size={16} />
              翻译
            </Button>
          )}
        </div>
      </div>

      {/* 作文内容 */}
      <div className="p-4">
        <Card className="p-6">
          <div
            ref={contentRef}
            className="select-text whitespace-pre-wrap"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease'
            }}
            onClick={handleWordClick}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            {essay.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 翻译结果 */}
          {showTranslation && (
            <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">原文：</p>
                  <p className="mb-3 text-sm">{selectedText}</p>
                  <p className="text-sm text-muted-foreground mb-2">翻译：</p>
                  <p className="text-blue-700">{translation}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHideTranslation}
                >
                  收起
                </Button>
              </div>
            </Card>
          )}
        </Card>

        {/* 提示信息 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 点击单词查询释义 · 长按选择完整句子进行翻译 · 双指缩放调整大小
          </p>
        </div>
      </div>

      {/* 单词查询弹窗 */}
      <Dialog open={wordDialogOpen} onOpenChange={setWordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>单词详情</span>
              <Volume2 className="text-muted-foreground" size={20} />
            </DialogTitle>
          </DialogHeader>
          {selectedWord && (
            <div className="space-y-4">
              <div>
                <h3 className="text-primary mb-1">{selectedWord.word}</h3>
                <p className="text-muted-foreground">{selectedWord.phonetic}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">考研核心释义</p>
                <p>{selectedWord.meaning}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">例句</p>
                <p className="text-sm italic">{selectedWord.example}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setWordDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
