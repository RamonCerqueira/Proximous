import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getSocket, initSocket } from '../lib/socket';

const Messages = () => {
  const { user } = useAuth();
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

  // Handle room joining and real-time listeners on active conversation change
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);
    const socket = getSocket();
    const matchId = selectedConversation.match_id || selectedConversation.id;

    if (socket && matchId) {
      // Join real-time match room
      socket.emit('join_match_room', { match_id: matchId, user_id: user?.id });

      // Handle real-time incoming messages
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

      // Handle typing status updates
      const handleUserTyping = (data) => {
        if (data.user_id === selectedConversation.id || data.match_id === matchId) {
          setIsOtherUserTyping(data.is_typing);
        }
      };

      socket.on('new_message_received', handleNewMessage);
      socket.on('user_typing', handleUserTyping);

      return () => {
        socket.emit('leave_match_room', { match_id: matchId });
        socket.off('new_message_received', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        setIsOtherUserTyping(false);
      };
    }
  }, [selectedConversation, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherUserTyping]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversation/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    const socket = getSocket();
    const matchId = selectedConversation?.match_id || selectedConversation?.id;

    if (socket && matchId) {
      socket.emit('typing_indicator', {
        match_id: matchId,
        user_id: user?.id,
        is_typing: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_indicator', {
          match_id: matchId,
          user_id: user?.id,
          is_typing: false
        });
      }, 2000);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const contentToSend = newMessage.trim();
    setNewMessage('');

    try {
      const response = await api.post('/messages/send', {
        receiver_id: selectedConversation.id,
        match_id: selectedConversation.match_id,
        content: contentToSend
      });

      const sentMsg = response.data.message_data || response.data.message || {
        id: Date.now(),
        sender_id: user?.id,
        receiver_id: selectedConversation.id,
        content: contentToSend,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, sentMsg]);

      // Broadcast via WebSocket
      const socket = getSocket();
      const matchId = selectedConversation.match_id || selectedConversation.id;
      if (socket && matchId) {
        socket.emit('send_live_message', {
          ...sentMsg,
          match_id: matchId
        });
      }

      fetchConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] sm:h-[calc(100vh-5rem)] bg-background max-w-7xl mx-auto border-x border-border/60">
      {/* Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-card border-r border-border/60 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/60 bg-card/60 backdrop-blur-md flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-foreground">Mensagens</h2>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Tempo Real
          </span>
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
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                        {conversation.last_message?.content || conversation.last_message || 'Iniciar conversa...'}
                      </p>
                    </div>
                    
                    {conversation.unread_count > 0 && (
                      <div className="bg-purple-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md flex-shrink-0">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Chat Room */}
      <div className={`flex-1 flex-col bg-background ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Room Header */}
            <div className="bg-card border-b border-border/60 p-3 sm:p-4 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedConversation(null)} 
                  className="md:hidden text-muted-foreground hover:text-foreground font-bold text-xs mr-1 bg-accent/60 px-2.5 py-1.5 rounded-xl border border-border"
                >
                  ← Voltar
                </button>
                <div className="relative">
                  <img
                    src={selectedConversation.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={selectedConversation.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-purple-500/30"
                  />
                  {selectedConversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-sm sm:text-base">{selectedConversation.name}</h3>
                  <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    {isOtherUserTyping ? (
                      <span className="text-purple-400 font-bold animate-pulse">Digitando... 💬</span>
                    ) : selectedConversation.online ? (
                      '• Online'
                    ) : (
                      'Visto por último recentemente'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar bg-background">
              {messages.map((message) => {
                const isMe = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id || Math.random()}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs md:max-w-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white rounded-br-xs shadow-purple-500/10'
                          : 'bg-card text-foreground border border-border/80 rounded-bl-xs'

                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed font-normal">{message.content}</p>
                      <p className={`text-[10px] mt-1 text-right font-medium ${
                        isMe ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {message.created_at ? formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        }) : 'Agora'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator bubble */}
              {isOtherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/80 px-4 py-2 rounded-2xl shadow-sm text-xs text-purple-400 font-semibold flex items-center gap-1 animate-pulse">
                    <span>{selectedConversation.name} está digitando...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Toolbar */}
            <div className="bg-card border-t border-border/60 p-3 sm:p-4 pb-20 md:pb-4">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-background border border-border/80 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-foreground placeholder:text-muted-foreground transition-all"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="proximous-button-primary rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 font-extrabold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {sending ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Enviar 🚀</span>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center p-8 max-w-sm space-y-4">
              <div className="w-20 h-20 bg-purple-500/15 text-purple-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Selecione uma conversa</h3>
                <p className="text-xs text-muted-foreground mt-1">Escolha uma conexão da lista ao lado para conversar em tempo real com toda a privacidade.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

