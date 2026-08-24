import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { messagesAPI } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSocket, initSocket } from '../lib/socket';
import SponsoredAdSlot from '../components/SponsoredAdSlot';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO connection on component mount
  useEffect(() => {
    initSocket();
    fetchConversations();
  }, []);

  // Auto-select conversation when navigated from another page (e.g., ModoAgora chat button or Matches)
  useEffect(() => {
    const targetUserId = location.state?.targetUserId || location.state?.selectedUserId;
    if (!targetUserId) return;

    if (conversations.length > 0) {
      const match = conversations.find(
        (c) => String(c.id) === String(targetUserId) || String(c.user_id) === String(targetUserId)
      );
      if (match) {
        setSelectedConversation(match);
        return;
      }
    }

    if (location.state?.targetUser) {
      const u = location.state.targetUser;
      setSelectedConversation({
        id: u.id,
        user_id: u.id,
        name: u.name,
        profile_photo_url: u.profile_photo_url,
        is_online: u.is_online ?? true,
        last_seen: u.last_seen || new Date().toISOString()
      });
    } else if (targetUserId) {
      setSelectedConversation({
        id: targetUserId,
        user_id: targetUserId,
        name: 'Conversa',
        is_online: true
      });
    }
  }, [conversations, location.state]);

  // Handle room joining and real-time listeners on active conversation change
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);
    const socket = getSocket();
    const matchId = selectedConversation.match_id || selectedConversation.id;

    if (socket && matchId) {
      // Join real-time match room
      socket.emit('join_match_room', { match_id: matchId, user_id: user?.id });

      // Handle real-time incoming messages (corrected event name)
      const handleNewMessage = (msgData) => {
        if (
          msgData.sender_id === selectedConversation.id ||
          msgData.match_id === matchId ||
          msgData.receiver_id === user?.id
        ) {
          setMessages(prev => {
            if (prev.some(m => m.id === msgData.id)) return prev;
            return [...prev, msgData];
          });
          fetchConversations();
        }
      };

      // Handle typing status updates (corrected event name)
      const handleUserTyping = (data) => {
        if (data.user_id === selectedConversation.id || data.match_id === matchId) {
          setIsOtherUserTyping(data.is_typing);
          // Auto-clear typing indicator after 3s
          if (data.is_typing) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsOtherUserTyping(false), 3000);
          }
        }
      };

      socket.on('new_message_received', handleNewMessage);
      socket.on('user_typing', handleUserTyping);

      return () => {
        socket.off('new_message_received', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
      };
    }
  }, [selectedConversation, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await messagesAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.warn('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await messagesAPI.getConversation(userId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  };

  // Emit typing indicator with debounce
  const emitTyping = (isTyping) => {
    const socket = getSocket();
    if (!socket || !selectedConversation) return;
    const matchId = selectedConversation.match_id || selectedConversation.id;
    socket.emit('typing_indicator', {
      match_id: matchId,
      user_id: user?.id,
      is_typing: isTyping
    });
  };

  const handleTypingChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    emitTyping(false);
    clearTimeout(typingTimeoutRef.current);

    try {
      const res = await messagesAPI.sendMessage({
        receiver_id: selectedConversation.id,
        content,
        match_id: selectedConversation.match_id || null
      });

      const sentMsg = res.data.message_data || {
        id: 'msg_' + Date.now(),
        sender_id: user?.id,
        receiver_id: selectedConversation.id,
        content,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, sentMsg]);

      // Emit via socket for instant delivery
      const socket = getSocket();
      if (socket) {
        socket.emit('send_live_message', {
          ...sentMsg,
          match_id: selectedConversation.match_id || selectedConversation.id
        });
      }
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Conversations Drawer Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 bg-card border-r border-border/60 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-foreground">Mensagens</h2>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Tempo Real
          </span>
        </div>
        
        {/* SPONSORED AD BANNER IN MESSAGES DRAWER */}
        <div className="p-3 border-b border-border/40">
          <SponsoredAdSlot slotId="messages_top" type="compact" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40 pb-20 md:pb-0">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-extrabold text-foreground text-sm">Nenhuma conversa ainda</p>
              <p className="text-xs text-muted-foreground">Comece descobrindo pessoas e criando conexões!</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id || selectedConversation?.id === conversation.other_user?.id;
              return (
                <div
                  key={conversation.id || conversation.other_user?.id}
                  onClick={() => setSelectedConversation(conversation.other_user ? {
                    id: conversation.other_user.id,
                    name: conversation.other_user.name,
                    avatar: conversation.other_user.profile_photo_url,
                    online: conversation.other_user.is_online,
                    match_id: conversation.match_id
                  } : conversation)}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-purple-500/10 border-l-4 border-l-purple-500' : 'hover:bg-accent/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={conversation.other_user?.profile_photo_url || conversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                        alt={conversation.other_user?.name || conversation.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/20"
                      />
                      {(conversation.other_user?.is_online || conversation.online) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-extrabold text-foreground truncate">
                          {conversation.other_user?.name || conversation.name}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
                          {(conversation.last_message?.created_at || conversation.last_message_time) && 
                            formatDistanceToNow(new Date(conversation.last_message?.created_at || conversation.last_message_time), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                        {conversation.last_message?.content || conversation.last_message_text || 'Inicie a conversa...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Chat Window */}
      <div className={`flex-1 flex flex-col bg-card/40 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Active User Header */}
            <div className="p-4 border-b border-border/60 bg-card/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-muted-foreground hover:text-foreground p-1"
                >
                  ←
                </button>
                <img
                  src={selectedConversation.avatar || selectedConversation.other_user?.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <h3 className="font-extrabold text-foreground text-sm">{selectedConversation.name}</h3>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online Agora
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Body Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3.5 rounded-3xl text-sm leading-relaxed ${
                        isMine
                          ? 'proximous-gradient text-white rounded-br-none shadow-lg'
                          : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`text-[10px] block text-right mt-1 font-medium ${isMine ? 'text-purple-200' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isOtherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border text-muted-foreground px-4 py-2 rounded-2xl text-xs font-bold animate-pulse">
                    Digitando mensagem...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border/60 bg-card/80 backdrop-blur-md flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTypingChange}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-foreground"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="proximous-button-primary font-bold px-5 py-3 rounded-2xl text-xs disabled:opacity-50 flex items-center gap-1 shadow-lg"
              >
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-3xl shadow-xl">
              💬
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Selecione uma conversa</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Escolha uma pessoa ao lado para conversar em tempo real.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
