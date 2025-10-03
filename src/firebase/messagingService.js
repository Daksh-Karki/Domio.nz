import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config.js';

// Create a new conversation between two users
export const createConversation = async (participants, propertyId = null) => {
  try {
    const conversationData = {
      participants: participants, // Array of user IDs
      propertyId: propertyId, // Optional: link to property
      lastMessage: null,
      lastMessageTime: null,
      unreadCount: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Initialize unread count for each participant
    participants.forEach(participantId => {
      conversationData.unreadCount[participantId] = 0;
    });

    const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
    return { success: true, conversationId: conversationRef.id };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { success: false, error: error.message };
  }
};

// Get or create conversation between two users
export const getOrCreateConversation = async (user1Id, user2Id, propertyId = null) => {
  try {
    // First, try to find existing conversation
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', user1Id)
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.participants.includes(user2Id)) {
        return { success: true, conversationId: doc.id, isNew: false };
      }
    }

    // If no existing conversation, create a new one
    const result = await createConversation([user1Id, user2Id], propertyId);
    return { ...result, isNew: true };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    return { success: false, error: error.message };
  }
};

// Send a message
export const sendMessage = async (conversationId, senderId, messageText, messageType = 'text') => {
  try {
    console.log('sendMessage: Starting to send message:', {
      conversationId,
      senderId,
      messageText,
      messageType
    });

    // Validate inputs
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    if (!senderId) {
      throw new Error('Sender ID is required');
    }
    if (!messageText || !messageText.trim()) {
      throw new Error('Message text is required');
    }

    const messageData = {
      conversationId: conversationId,
      senderId: senderId,
      messageText: messageText.trim(),
      messageType: messageType, // 'text', 'image', 'file'
      timestamp: serverTimestamp(),
      status: 'sent', // 'sent', 'delivered', 'read'
      readBy: {}
    };

    console.log('sendMessage: Message data:', messageData);

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('sendMessage: Message added with ID:', messageRef.id);

    // Update conversation with last message info
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: messageText.trim(),
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('sendMessage: Conversation updated successfully');

    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('sendMessage: Error sending message:', error);
    return { success: false, error: error.message };
  }
};

// Get messages for a conversation (with pagination)
export const getMessages = async (conversationId, lastMessage = null, limitCount = 50) => {
  try {
    const messagesRef = collection(db, 'messages');
    
    // Query only by conversationId to avoid composite index requirement
    let q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = [];

    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by timestamp in JavaScript to avoid index requirement
    messages.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return bTime - aTime; // newest first for pagination
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { success: false, error: error.message };
  }
};

// Get conversations for a user
export const getUserConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by updatedAt in JavaScript to avoid index requirement
    conversations.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
      const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
      return bTime - aTime; // newest first
    });

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to real-time messages for a conversation
export const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(db, 'messages');
  
  // Query only by conversationId to avoid composite index requirement
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by timestamp in JavaScript to avoid index requirement
    messages.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
      const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
      return aTime - bTime; // oldest first for chat
    });
    
    callback(messages);
  });
};

// Subscribe to real-time conversations for a user
export const subscribeToConversations = (userId, callback) => {
  console.log('subscribeToConversations: Starting subscription for user:', userId);
  
  const conversationsRef = collection(db, 'conversations');
  
  // Query only by participants to avoid composite index requirement
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, 
    (querySnapshot) => {
      console.log('subscribeToConversations: Query snapshot received, size:', querySnapshot.size);
      const conversations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('subscribeToConversations: Found conversation:', doc.id, data);
        conversations.push({
          id: doc.id,
          ...data
        });
      });
      
      // Sort by updatedAt in JavaScript to avoid index requirement
      conversations.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
        return bTime - aTime; // newest first
      });
      
      console.log('subscribeToConversations: Sending conversations to callback:', conversations);
      callback(conversations);
    },
    (error) => {
      console.error('subscribeToConversations: Error in subscription:', error);
    }
  );
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const messagesRef = collection(db, 'messages');
    
    // Query only by conversationId to avoid composite index requirement
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId)
    );

    const querySnapshot = await getDocs(q);
    const batch = [];

    querySnapshot.forEach((doc) => {
      const messageData = doc.data();
      // Filter out own messages in JavaScript to avoid composite index
      if (messageData.senderId !== userId && (!messageData.readBy || !messageData.readBy[userId])) {
        batch.push(
          updateDoc(doc.ref, {
            [`readBy.${userId}`]: serverTimestamp(),
            status: 'read'
          })
        );
      }
    });

    await Promise.all(batch);

    // Update unread count in conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, error: error.message };
  }
};

// Get user info for a conversation
export const getConversationParticipants = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (!conversationDoc.exists()) {
      return { success: false, error: 'Conversation not found' };
    }

    const conversationData = conversationDoc.data();
    const participants = [];

    // Get user details for each participant
    for (const participantId of conversationData.participants) {
      const userRef = doc(db, 'users', participantId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        participants.push({
          id: participantId,
          ...userDoc.data()
        });
      }
    }

    return { success: true, data: participants };
  } catch (error) {
    console.error('Error getting conversation participants:', error);
    return { success: false, error: error.message };
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: error.message };
  }
};

// Format timestamp for display
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-NZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { // Less than a week
    return date.toLocaleDateString('en-NZ', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('en-NZ', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};
