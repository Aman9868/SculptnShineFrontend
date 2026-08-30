import React, { useEffect, useState } from 'react';

interface HistoryItem {
  sessionId: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  currentSessionId: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  onSelectSession,
  onNewChat,
  currentSessionId
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8086/api/v1';
      const res = await fetch(`${baseUrl}/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch chat history", e);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/60 z-40 rounded-3xl" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`absolute top-0 left-0 h-full bg-neutral-900 border-r border-neutral-800 z-50 transition-all duration-300 flex flex-col rounded-l-3xl ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden border-r-0'}`}>
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center whitespace-nowrap min-w-[256px]">
          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex-1 bg-gold-500 hover:bg-gold-400 text-black font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform transform active:scale-95 mr-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 min-w-[256px] history-scrollbar">
          {loading ? (
            <div className="text-neutral-500 text-center mt-10 text-sm">Loading history...</div>
          ) : error ? (
            <div className="text-red-500 text-center mt-10 text-sm">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-neutral-500 text-center mt-10 text-sm">No previous conversations</div>
          ) : (
            history.map(item => (
              <button
                key={item.sessionId}
                onClick={() => {
                  onSelectSession(item.sessionId);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors text-sm truncate block ${currentSessionId === item.sessionId ? 'bg-neutral-800 text-gold-500 font-medium' : 'text-neutral-300 hover:bg-neutral-800/50'}`}
              >
                {item.title}
              </button>
            ))
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .history-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .history-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .history-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 10px;
        }
      `}} />
    </>
  );
};
