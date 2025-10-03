import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  getConversationParticipants,
  formatMessageTime 
} from '../firebase/messagingService.js';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import '../styles/Chat.css';

const Chat = ({ conversationId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    // Get conversation participants
    const loadParticipants = async () => {
      const result = await getConversationParticipants(conversationId);
      if (result.success) {
        setParticipants(result.data);
      }
    };

    // Subscribe to real-time messages
    const unsubscribe = subscribeToMessages(conversationId, (messages) => {
      setMessages(messages);
      setLoading(false);
      
      // Auto-scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    unsubscribeRef.current = unsubscribe;
    loadParticipants();

    // Mark messages as read when conversation is opened
    markMessagesAsRead(conversationId, user.uid);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, user.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log('handleSendMessage called:', {
      newMessage: newMessage.trim(),
      conversationId,
      user: user?.uid,
      loading
    });
    
    if (!newMessage.trim()) {
      console.log('No message to send');
      return;
    }
    
    if (!conversationId) {
      console.log('No conversation ID');
      return;
    }

    console.log('Chat: Attempting to send message:', {
      conversationId,
      userId: user.uid,
      userRole: user.role,
      message: newMessage.trim()
    });

    const result = await sendMessage(conversationId, user.uid, newMessage.trim());
    console.log('Chat: Send message result:', result);
    
    if (result.success) {
      setNewMessage('');
      scrollToBottom();
    } else {
      console.error('Failed to send message:', result.error);
      alert('Failed to send message: ' + result.error);
    }
  };

  const getOtherParticipant = () => {
    return participants.find(p => p.id !== user.uid);
  };

  if (!conversationId) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <div className="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="user-avatar">
            {otherParticipant?.firstName ? otherParticipant.firstName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <h3>{otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Loading...'}</h3>
            <span className="user-status">Online</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" title="Voice Call">
            <Phone size={20} />
          </button>
          <button className="action-btn" title="Video Call">
            <Video size={20} />
          </button>
          <button className="action-btn" title="More Options">
            <MoreVertical size={20} />
          </button>
          {onClose && (
            <button className="action-btn close-btn" onClick={onClose} title="Close Chat">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {loading ? (
          <div className="loading-messages">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isOwn={message.senderId === user.uid}
                  formatTime={formatMessageTime}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <button type="button" className="input-action-btn" title="Attach File">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter key pressed, submitting form');
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="message-input"
            disabled={loading}
          />
          <button type="button" className="input-action-btn" title="Emoji">
            <Smile size={20} />
          </button>
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim() || loading}
            onClick={(e) => {
              console.log('Send button clicked:', {
                newMessage: newMessage.trim(),
                conversationId,
                user: user?.uid,
                loading,
                disabled: !newMessage.trim() || loading
              });
              if (!newMessage.trim()) {
                alert('Please type a message first!');
                return;
              }
              if (!conversationId) {
                alert('No conversation selected!');
                return;
              }
            }}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, isOwn, formatTime }) => {
  const getMessageStatus = () => {
    if (message.status === 'read') return '✓✓';
    if (message.status === 'delivered') return '✓✓';
    return '✓';
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        <p className="message-text">{message.messageText}</p>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isOwn && (
            <span className="message-status">{getMessageStatus()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
