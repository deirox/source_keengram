import React, { useEffect, useState } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import './Messenger.css';

const Messenger: React.FC = () => {
  const { authorizedUserData } = useUserStore();
  const {
    initializeMessenger,
    isConnected,
    isLoading,
    currentChat,
    selectChat
  } = useMessengerStore();
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    if (authorizedUserData?.uid && !isConnected) {
      initializeMessenger(authorizedUserData.uid);
    }
  }, [authorizedUserData?.uid, isConnected, initializeMessenger]);

  const handleChatSelect = async (chatId: string) => {
    selectChat(chatId);
    setShowChatList(false);
  };

  const handleBackToChatList = () => {
    setShowChatList(true);
  };

  const handleRetry = () => {
    if (authorizedUserData?.uid) {
      initializeMessenger(authorizedUserData.uid);
    }
  };

  if (!isConnected) {
    return (
      <div className="messenger-error">
        <p>Ошибка подключения к мессенджеру</p>
        <button onClick={handleRetry}>Повторить попытку</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="messenger-loading">
        <div className="loading-spinner"></div>
        <p>Инициализация мессенджера...</p>
      </div>
    );
  }

  return (
    <div className="messenger-container">
      {showChatList ? (
        <ChatList onChatSelect={handleChatSelect} />
      ) : (
        <ChatWindow
          currentChat={currentChat}
          onBack={handleBackToChatList}
        />
      )}
    </div>
  );
};

export default Messenger; 
