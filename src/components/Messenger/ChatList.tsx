import React, { useState } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import ChatItem from './ChatItem';
import NewChatModal from './NewChatModal';
import './ChatList.css';

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect }) => {
  const { chats, isLoading } = useMessengerStore();
  const { authorizedUserData } = useUserStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;

    // Фильтруем по участникам чата (кроме текущего пользователя)
    const otherParticipants = chat.participants.filter(
      participant => {
        if (!participant || typeof participant === 'string') return false;
        return participant && participant.uid !== authorizedUserData?.uid
      }
    );

    return otherParticipants.some(participant => {
      if (!participant || typeof participant === 'string') return false;
      const name = `${participant.name} ${participant.surname}`.toLowerCase();
      const nickname = participant.nickname?.toLowerCase() || '';
      const searchLower = searchQuery.toLowerCase();
      return name.includes(searchLower) || nickname.includes(searchLower);
    });
  });

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleCloseNewChatModal = () => {
    setShowNewChatModal(false);
  };

  if (isLoading) {
    return (
      <div className="chat-list-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Сообщения</h2>
        <button
          className="new-chat-button"
          onClick={handleNewChat}
        >
          <span>+</span>
        </button>
      </div>

      <div className="chat-list-search">
        <input
          type="text"
          placeholder="Поиск чатов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list-content">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>У вас пока нет чатов</p>
            <button onClick={handleNewChat}>
              Начать новый чат
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              currentUserId={authorizedUserData?.uid || ''}
              onSelect={() => onChatSelect(chat.id)}
            />
          ))
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={handleCloseNewChatModal}
          onChatCreated={(chatId) => {
            handleCloseNewChatModal();
            onChatSelect(chatId);
          }}
        />
      )}
    </div>
  );
};

export default ChatList; 