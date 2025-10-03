import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import ChatList from './ChatList.jsx';
import Chat from './Chat.jsx';
import '../styles/Messaging.css';

const Messaging = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle conversation selection
  const handleConversationSelect = (conversationId) => {
    setSelectedConversationId(conversationId);
    if (isMobileView) {
      // On mobile, hide the conversation list when a chat is selected
      setIsMobileView(false);
    }
  };

  // Handle back to conversation list (mobile)
  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  // Show conversation list (always on desktop, only when no chat selected on mobile)
  const showConversationList = isMobileView ? !selectedConversationId : true;

  // Show chat window (when a conversation is selected)
  const showChat = !!selectedConversationId;

  return (
    <div className="messaging-container">
      <div className="messaging-header">
        <h1>Messages</h1>
        <p>Communicate with landlords and tenants</p>
      </div>

      <div className="messaging-content">
        {showConversationList && (
          <div className="messaging-sidebar">
            <ChatList 
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversationId}
            />
          </div>
        )}

        <div className="messaging-main">
          {showChat ? (
            <Chat 
              conversationId={selectedConversationId}
              onClose={isMobileView ? handleBackToList : undefined}
            />
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">💬</div>
                <h3>Welcome to Messages</h3>
                <p>Select a conversation from the list to start messaging, or start a new conversation with a landlord or tenant.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
