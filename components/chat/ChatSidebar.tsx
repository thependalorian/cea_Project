/**
 * Chat Sidebar Component
 * Session management sidebar with modern 2025 design
 * Location: components/chat/ChatSidebar.tsx
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Search,
  Clock,
  Pin,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IOSContainer } from '@/components/layout/IOSLayout';

interface AssistantSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  sessions: AssistantSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onPinSession?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
}

export const ChatSidebar = ({
  isOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onPinSession,
  onArchiveSession
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions based on search
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by pinned/recent
  const pinnedSessions = filteredSessions.filter(s => s.isPinned && !s.isArchived);
  const recentSessions = filteredSessions.filter(s => !s.isPinned && !s.isArchived);
  const archivedSessions = filteredSessions.filter(s => s.isArchived);

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle session menu actions
  const handleSessionAction = (sessionId: string, action: 'delete' | 'pin' | 'archive') => {
    switch (action) {
      case 'delete':
        onDeleteSession?.(sessionId);
        break;
      case 'pin':
        onPinSession?.(sessionId);
        break;
      case 'archive':
        onArchiveSession?.(sessionId);
        break;
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const sessionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isOpen ? "open" : "closed"}
      className="fixed left-0 top-0 z-40 h-full w-80 bg-white/95 backdrop-blur-ios border-r border-midnight-forest/10 shadow-ios-elevated"
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-midnight-forest/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-ios-title-3 text-midnight-forest font-semibold">
              Conversations
            </h2>
            <button
              onClick={onNewSession}
              className="p-2 bg-spring-green text-white rounded-ios-lg hover:bg-spring-green/90 transition-colors shadow-ios-subtle"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-midnight-forest/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-midnight-forest/10 rounded-ios-lg text-ios-body text-midnight-forest placeholder-midnight-forest/50 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned Sessions */}
          {pinnedSessions.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Pin className="h-3 w-3 text-midnight-forest/60" />
                <span className="text-ios-caption-1 font-medium text-midnight-forest/60 uppercase tracking-wide">
                  Pinned
                </span>
              </div>
              <div className="space-y-2">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onClick={() => onSelectSession(session.id)}
                    onMenuAction={(action) => handleSessionAction(session.id, action)}
                    formatRelativeTime={formatRelativeTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          {recentSessions.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3 w-3 text-midnight-forest/60" />
                <span className="text-ios-caption-1 font-medium text-midnight-forest/60 uppercase tracking-wide">
                  Recent
                </span>
              </div>
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onClick={() => onSelectSession(session.id)}
                    onMenuAction={(action) => handleSessionAction(session.id, action)}
                    formatRelativeTime={formatRelativeTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archived Sessions */}
          {archivedSessions.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="h-3 w-3 text-midnight-forest/60" />
                <span className="text-ios-caption-1 font-medium text-midnight-forest/60 uppercase tracking-wide">
                  Archived
                </span>
              </div>
              <div className="space-y-2">
                {archivedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onClick={() => onSelectSession(session.id)}
                    onMenuAction={(action) => handleSessionAction(session.id, action)}
                    formatRelativeTime={formatRelativeTime}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <MessageSquare className="h-8 w-8 text-midnight-forest/30 mb-3" />
              <p className="text-ios-body text-midnight-forest/60">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-ios-caption-1 text-midnight-forest/40 mt-1">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Session Item Component
interface SessionItemProps {
  session: AssistantSession;
  isActive: boolean;
  onClick: () => void;
  onMenuAction: (action: 'delete' | 'pin' | 'archive') => void;
  formatRelativeTime: (date: Date) => string;
}

const SessionItem = ({ 
  session, 
  isActive, 
  onClick, 
  onMenuAction, 
  formatRelativeTime 
}: SessionItemProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      initial="hidden"
      animate="visible"
      className="relative group"
    >
      <div
        className={cn(
          "cursor-pointer transition-all duration-200 hover:bg-white/60 border rounded-ios-lg",
          isActive 
            ? "bg-spring-green/10 border-spring-green/20" 
            : "border-transparent hover:border-midnight-forest/10"
        )}
        onClick={onClick}
      >
        <IOSContainer
          variant={isActive ? "glass" : "default"}
          padding="md"
          className="border-none"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {session.isPinned && (
                  <Pin className="h-3 w-3 text-spring-green flex-shrink-0" />
                )}
                <h3 className="text-ios-footnote font-medium text-midnight-forest truncate">
                  {session.title}
                </h3>
              </div>
              <p className="text-ios-caption-2 text-midnight-forest/60 line-clamp-2 leading-snug">
                {session.preview}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-ios-caption-2 text-midnight-forest/40">
                  {formatRelativeTime(session.timestamp)}
                </span>
                <span className="text-ios-caption-2 text-midnight-forest/40">
                  {session.messageCount} messages
                </span>
              </div>
            </div>

            {/* Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-midnight-forest/50 hover:text-midnight-forest transition-all duration-200 ml-2"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </IOSContainer>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-2 top-full mt-1 z-50 bg-white rounded-ios-lg shadow-ios-elevated border border-midnight-forest/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onMenuAction('pin')}
              className="w-full px-3 py-2 text-left text-ios-caption-1 text-midnight-forest hover:bg-midnight-forest/5 transition-colors flex items-center gap-2"
            >
              <Pin className="h-3 w-3" />
              {session.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => onMenuAction('archive')}
              className="w-full px-3 py-2 text-left text-ios-caption-1 text-midnight-forest hover:bg-midnight-forest/5 transition-colors flex items-center gap-2"
            >
              <Archive className="h-3 w-3" />
              Archive
            </button>
            <button
              onClick={() => onMenuAction('delete')}
              className="w-full px-3 py-2 text-left text-ios-caption-1 text-ios-red hover:bg-ios-red/5 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
}; 