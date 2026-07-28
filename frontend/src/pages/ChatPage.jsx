import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Image, Info, ArrowLeft, Plus, Users } from 'lucide-react';
import { api, getCurrentUser } from '../services/api';
import websocketService from '../services/websocket';
import NewConversationModal from '../components/NewConversationModal';
import GroupInfoPanel from '../components/GroupInfoPanel';
import { getUserDisplayName } from '../utils/userDisplay';

export default function ChatPage() {
  const currentUser = getCurrentUser();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [searchConv, setSearchConv] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevConvIdRef = useRef(null);

  // ── Load conversations ──────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    api.getConversations(currentUser.id)
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvs(false));
  }, []);

  // ── WebSocket connection ────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    // For WebSocket auth, we need the access token. We'll grab it from session.
    const token = sessionStorage.getItem('localfoodRefreshToken');
    // WebSocket uses the same access token mechanism
    websocketService.connect(token);
    return () => websocketService.disconnect();
  }, []);

  // ── Subscribe to active conversation ────────────────────
  useEffect(() => {
    if (!activeConv) return;
    const convId = activeConv.id;

    // Unsubscribe from previous
    if (prevConvIdRef.current && prevConvIdRef.current !== convId) {
      websocketService.unsubscribe(prevConvIdRef.current);
    }
    prevConvIdRef.current = convId;

    // Subscribe to messages
    websocketService.subscribe(convId, (newMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt } : c
      ));
      // Auto-scroll
      setTimeout(() => scrollToBottom(), 50);
    });

    // Subscribe to typing
    websocketService.subscribeTyping(convId, (event) => {
      if (event.userId === currentUser?.id) return;
      setTypingUsers(prev => ({
        ...prev,
        [event.userId]: event.typing ? event.userName : null,
      }));
      // Clear typing after 3 seconds
      if (event.typing) {
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [event.userId]: null }));
        }, 3000);
      }
    });

    return () => {
      websocketService.unsubscribe(convId);
    };
  }, [activeConv?.id]);

  // ── Load messages when switching conversation ───────────
  useEffect(() => {
    if (!activeConv || !currentUser) return;
    setLoadingMsgs(true);
    setMessages([]);
    setPage(0);
    setHasMore(true);
    api.getMessages(activeConv.id, currentUser.id, 0)
      .then(msgs => {
        setMessages(msgs);
        setHasMore(msgs.length >= 20);
        setTimeout(() => scrollToBottom(), 100);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));

    // Mark as read
    api.markAsRead(activeConv.id, currentUser.id).catch(() => {});
    setConversations(prev => prev.map(c =>
      c.id === activeConv.id ? { ...c, unreadCount: 0 } : c
    ));
  }, [activeConv?.id]);

  // ── Load more messages ──────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!activeConv || !currentUser || loadingMsgs || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMsgs(true);
    try {
      const msgs = await api.getMessages(activeConv.id, currentUser.id, nextPage);
      setMessages(prev => [...msgs, ...prev]);
      setPage(nextPage);
      setHasMore(msgs.length >= 20);
    } catch { /* ignore */ }
    setLoadingMsgs(false);
  }, [activeConv, currentUser, page, loadingMsgs, hasMore]);

  // ── Send message ────────────────────────────────────────
  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !activeConv || !currentUser || sending) return;
    setSending(true);
    setMessageText('');
    try {
      const msg = await api.sendMessage(activeConv.id, {
        userId: currentUser.id,
        content: text,
      });
      // WebSocket will deliver the message, but in case it doesn't arrive
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, lastMessage: msg, updatedAt: msg.createdAt } : c
      ));
      setTimeout(() => scrollToBottom(), 50);
    } catch (e) {
      setMessageText(text); // Restore on error
    }
    setSending(false);
    inputRef.current?.focus();
  };

  // ── Typing indicator ────────────────────────────────────
  const handleTyping = () => {
    if (!activeConv || !currentUser) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    websocketService.sendTyping(activeConv.id, currentUser.id, getUserDisplayName(currentUser), true);
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(activeConv.id, currentUser.id, getUserDisplayName(currentUser), false);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Conversation created ────────────────────────────────
  const handleConversationCreated = (conv) => {
    setConversations(prev => {
      if (prev.some(c => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    setActiveConv(conv);
    setShowNewModal(false);
    setMobileShowChat(true);
  };

  // ── Select conversation ─────────────────────────────────
  const selectConversation = (conv) => {
    setActiveConv(conv);
    setShowGroupInfo(false);
    setMobileShowChat(true);
  };

  const goBackToList = () => {
    setMobileShowChat(false);
    setShowGroupInfo(false);
  };

  // ── Helpers ─────────────────────────────────────────────
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' phút';
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString('vi-VN', { weekday: 'short' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessagePreview = (conv) => {
    if (!conv.lastMessage) return 'Chưa có tin nhắn';
    const msg = conv.lastMessage;
    if (msg.type === 'SYSTEM') return msg.content;
    if (msg.type === 'IMAGE') return '📷 Hình ảnh';
    const prefix = msg.sender?.id === currentUser?.id ? 'Bạn: ' : '';
    const text = msg.content || '';
    return prefix + (text.length > 40 ? text.substring(0, 40) + '...' : text);
  };

  // Filter conversations
  const filteredConvs = searchConv.trim()
    ? conversations.filter(c =>
        (c.name || '').toLowerCase().includes(searchConv.trim().toLowerCase())
      )
    : conversations;

  // Sort by updatedAt
  const sortedConvs = [...filteredConvs].sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // Active typing users
  const activeTypers = Object.values(typingUsers).filter(Boolean);

  const handleGroupUpdated = (updatedConv) => {
    setActiveConv(updatedConv);
    setConversations(prev => prev.map(c =>
      c.id === updatedConv.id ? updatedConv : c
    ));
  };

  const handleGroupLeft = () => {
    setConversations(prev => prev.filter(c => c.id !== activeConv?.id));
    setActiveConv(null);
    setShowGroupInfo(false);
    setMobileShowChat(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-page ${mobileShowChat ? 'chat-active' : ''}`}>
      {/* ─── Sidebar ───────────────────────────────────────── */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Tin nhắn</h2>
          <button className="chat-new-btn" onClick={() => setShowNewModal(true)} title="Tin nhắn mới">
            <Plus size={18} />
          </button>
        </div>

        <div className="chat-search-wrap">
          <input
            className="chat-search-input"
            placeholder="Tìm cuộc trò chuyện..."
            value={searchConv}
            onChange={e => setSearchConv(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {loadingConvs ? (
            <div className="chat-empty-state" style={{ minHeight: 200 }}>
              <div className="feed-loader" />
            </div>
          ) : sortedConvs.length === 0 ? (
            <div className="chat-empty-state" style={{ minHeight: 200, padding: 24 }}>
              <p style={{ fontSize: '.85rem' }}>
                {searchConv ? 'Không tìm thấy cuộc trò chuyện.' : 'Chưa có tin nhắn nào.'}
              </p>
            </div>
          ) : (
            sortedConvs.map(conv => (
              <button
                key={conv.id}
                className={`chat-list-item ${activeConv?.id === conv.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <div className={`chat-list-avatar ${conv.type === 'GROUP' ? 'group' : ''}`}>
                  {conv.avatarUrl
                    ? <img src={conv.avatarUrl} alt="" />
                    : conv.type === 'GROUP'
                      ? <Users size={20} />
                      : getInitial(conv.name)
                  }
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-name">{conv.name || 'Cuộc trò chuyện'}</div>
                  <div className="chat-list-preview">{getLastMessagePreview(conv)}</div>
                </div>
                <div className="chat-list-meta">
                  <span className="chat-list-time">
                    {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="chat-unread-badge">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Chat Area ─────────────────────────────────────── */}
      <div className="chat-area" style={{ position: 'relative' }}>
        {!activeConv ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <MessageCircle size={36} />
            </div>
            <h3>Tin nhắn của bạn</h3>
            <p>Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới với bạn bè.</p>
            <button className="chat-empty-start-btn" onClick={() => setShowNewModal(true)}>
              Gửi tin nhắn
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-area-header">
              <button className="chat-back-btn" onClick={goBackToList}>
                <ArrowLeft size={20} />
              </button>
              <div className={`chat-area-avatar ${activeConv.type === 'GROUP' ? 'group' : ''}`}>
                {activeConv.avatarUrl
                  ? <img src={activeConv.avatarUrl} alt="" />
                  : activeConv.type === 'GROUP'
                    ? <Users size={18} />
                    : getInitial(activeConv.name)
                }
              </div>
              <div className="chat-area-info">
                <div className="chat-area-name">{activeConv.name || 'Cuộc trò chuyện'}</div>
                <div className="chat-area-status">
                  {activeTypers.length > 0
                    ? `${activeTypers.join(', ')} đang nhập...`
                    : activeConv.type === 'GROUP'
                      ? `${activeConv.members?.length || 0} thành viên`
                      : ''
                  }
                </div>
              </div>
              <div className="chat-area-actions">
                <button className="chat-info-btn" onClick={() => setShowGroupInfo(!showGroupInfo)}>
                  <Info size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages" ref={messagesContainerRef}>
              {hasMore && messages.length > 0 && (
                <div className="chat-load-more">
                  <button onClick={loadMore} disabled={loadingMsgs}>
                    {loadingMsgs ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                  </button>
                </div>
              )}

              {loadingMsgs && messages.length === 0 && (
                <div className="chat-empty-state" style={{ minHeight: 200 }}>
                  <div className="feed-loader" />
                </div>
              )}

              {messages.map((msg, idx) => {
                if (msg.type === 'SYSTEM') {
                  return (
                    <div key={msg.id} className="chat-system-msg">
                      {msg.content}
                    </div>
                  );
                }

                const isSent = msg.sender?.id === currentUser?.id;
                const showSenderName = !isSent && activeConv.type === 'GROUP'
                  && (idx === 0 || messages[idx - 1]?.sender?.id !== msg.sender?.id);

                return (
                  <div key={msg.id}>
                    {showSenderName && (
                      <div className="chat-msg-sender-name">{getUserDisplayName(msg.sender)}</div>
                    )}
                    <div className={`chat-msg-row ${isSent ? 'sent' : 'received'}`}>
                      {!isSent && (
                        <div className="chat-msg-sender-avatar">
                          {msg.sender?.avatar
                            ? <img src={msg.sender.avatar} alt="" />
                            : null
                          }
                        </div>
                      )}
                      <div>
                        {msg.imageUrl && (
                          <div className="chat-msg-image">
                            <img src={msg.imageUrl} alt="Ảnh" />
                          </div>
                        )}
                        {msg.content && (
                          <div className="chat-msg-bubble">{msg.content}</div>
                        )}
                        <div className="chat-msg-time">{formatMsgTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeTypers.length > 0 && (
                <div className="chat-typing">
                  <div className="chat-typing-dots">
                    <span /><span /><span />
                  </div>
                  {activeTypers.join(', ')} đang nhập...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <div className="chat-input-wrap">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder="Nhập tin nhắn..."
                  value={messageText}
                  onChange={e => {
                    setMessageText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
              </div>
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                title="Gửi"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Group Info Panel */}
            {showGroupInfo && (
              <GroupInfoPanel
                conversation={activeConv}
                onClose={() => setShowGroupInfo(false)}
                onUpdated={handleGroupUpdated}
                onLeft={handleGroupLeft}
              />
            )}
          </>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}
