import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  getUserConversations, 
  subscribeToConversations,
  getConversationParticipants,
  formatMessageTime 
} from '../firebase/messagingService.js';
import { Search, MessageCircle, MoreVertical } from 'lucide-react';
import '../styles/ChatList.css';

const ChatList = ({ onConversationSelect, selectedConversationId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    
    console.log('ChatList: Subscribing to conversations for user:', user.uid);
    
    // Subscribe to real-time conversations
    const unsubscribe = subscribeToConversations(user.uid, (conversationsData) => {
      console.log('ChatList: Received conversations data:', conversationsData);
      setConversations(conversationsData);
      setLoading(false);
    });

    return () => {
      console.log('ChatList: Unsubscribing from conversations');
      unsubscribe();
    };
  }, [user.uid]);

  const getOtherParticipant = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    return otherParticipantId;
  };

  const getConversationDisplayName = (conversation) => {
    const otherParticipantId = getOtherParticipant(conversation);
    // For now, we'll use the participant ID. In a real app, you'd fetch user details
    return `User ${otherParticipantId.substring(0, 8)}`;
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount?.[user.uid] || 0;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const displayName = getConversationDisplayName(conversation);
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="loading-conversations">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <button className="new-message-btn" title="New Message">
          <MessageCircle size={20} />
        </button>
      </div>

      <div className="chat-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <div className="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start a conversation by messaging a landlord or tenant</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const unreadCount = getUnreadCount(conversation);
            const isSelected = selectedConversationId === conversation.id;
            
            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="conversation-avatar">
                  {getConversationDisplayName(conversation).charAt(0)}
                </div>
                
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h4 className="conversation-name">
                      {getConversationDisplayName(conversation)}
                    </h4>
                    {conversation.lastMessageTime && (
                      <span className="conversation-time">
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  
                  <div className="conversation-preview">
                    <p className="last-message">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>

                <button className="conversation-menu-btn">
                  <MoreVertical size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
