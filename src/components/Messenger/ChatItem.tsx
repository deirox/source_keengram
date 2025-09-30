import React from 'react';
import { Chat } from '@/shared/types/messenger';
import { formatTime } from '@/shared/utils/dateUtils';
import './ChatItem.css';

interface ChatItemProps {
  chat: Chat;
  currentUserId: string;
  onSelect: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, currentUserId, onSelect }) => {
  // Получаем других участников чата (кроме текущего пользователя)
  const otherParticipants = chat.participants.filter(
    participant => {
      if (!participant || typeof participant === 'string') return false;
      return participant !== null ? participant.uid !== currentUserId : false
    }
  );

  // Для демонстрации используем ID как имя пользователя
  const participant = otherParticipants[0] ? otherParticipants[0] : null
  if (!participant || typeof participant === 'string') return false;
  const participantName = participant ? `${participant?.name} ${participant?.surname}` : 'Неизвестный пользователь'
  const lastMessageTime = chat.lastMessage?.created_at
    ? formatTime(chat.lastMessage?.created_at.seconds)
    : '';

  return (
    <div className="chat-item" onClick={onSelect}>
      <div className="chat-item-avatar">
        <img className="avatar-placeholder" src={participant?.avatar.url} alt={participant?.nickname} />
        {/* {participantName.charAt(0).toUpperCase()} */}
        {/* {chat.unreadCount > 0 && (
          <div className="unread-badge">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </div>
        )} */}
      </div>

      <div className="chat-item-content">
        <div className="chat-item-header">
          <h3 className="chat-item-name">{participantName}</h3>
          {lastMessageTime && (
            <span className="chat-item-time">{lastMessageTime}</span>
          )}
        </div>

        <div className="chat-item-message">
          <p className="message-preview">
            {chat.lastMessage?.author && typeof chat.lastMessage?.author !== 'string' && chat.lastMessage?.author.uid === currentUserId && (
              <span className="message-indicator">Вы: </span>
            )}
            {"NET"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatItem; 