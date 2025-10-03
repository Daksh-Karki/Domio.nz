import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrCreateConversation, sendMessage } from '../firebase/messagingService.js';
import { MessageCircle, X } from 'lucide-react';
import '../styles/StartConversation.css';

const StartConversation = ({ property, landlordId, onClose, onConversationStarted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('StartConversation: Creating conversation between:', user.uid, 'and', landlordId, 'for property:', property?.id);
      
      // Get or create conversation
      const conversationResult = await getOrCreateConversation(user.uid, landlordId, property?.id);
      console.log('StartConversation: Conversation result:', conversationResult);
      
      if (conversationResult.success) {
        console.log('StartConversation: Sending initial message to conversation:', conversationResult.conversationId);
        
        // Send initial message
        const messageResult = await sendMessage(conversationResult.conversationId, user.uid, message.trim());
        console.log('StartConversation: Message result:', messageResult);
        
        if (messageResult.success) {
          console.log('StartConversation: Message sent successfully');
          if (onConversationStarted) {
            onConversationStarted(conversationResult.conversationId);
          }
          if (onClose) {
            onClose();
          }
        } else {
          console.error('StartConversation: Failed to send message:', messageResult.error);
          setError('Failed to send message. Please try again.');
        }
      } else {
        console.error('StartConversation: Failed to create conversation:', conversationResult.error);
        setError('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="start-conversation-overlay">
      <div className="start-conversation-modal">
        <div className="modal-header">
          <h3>Start a Conversation</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {property && (
            <div className="property-info">
              <h4>{property.title}</h4>
              <p>📍 {property.address}, {property.city}</p>
              <p>💰 {property.rent}/week</p>
            </div>
          )}

          <form onSubmit={handleStartConversation} className="conversation-form">
            <div className="form-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm interested in this property. Could you tell me more about it?"
                className="message-textarea"
                rows={4}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="send-btn"
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StartConversation;
