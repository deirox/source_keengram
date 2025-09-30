import React, { useEffect, useRef, useState } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import { Chat } from '@/shared/types/messenger';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';
import { IAuthor } from '@/shared/types/api.types';

interface ChatWindowProps {
  currentChat: Chat | null;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentChat, onBack }) => {
  const { messages, loadMessages, markMessageAsRead } = useMessengerStore();
  const { authorizedUserData } = useUserStore();
  const isTyping = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
    }
  }, [currentChat, loadMessages]);

  useEffect(() => {
    // Прокручиваем к последнему сообщению
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[currentChat?.id || '']]);

  useEffect(() => {
    // Отмечаем сообщения как прочитанные
    if (currentChat && messages[currentChat.id]) {
      const unreadMessages = messages[currentChat.id].filter(
        message => !message.isRead && message.senderId !== authorizedUserData?.uid
      );

      unreadMessages.forEach(message => {
        markMessageAsRead(message.uid);
      });
    }
  }, [currentChat, messages, authorizedUserData, markMessageAsRead]);

  if (!currentChat) {
    return (
      <div className="chat-window-empty">
        <p>Выберите чат для начала общения</p>
      </div>
    );
  }
  // Получаем других участников чата
  const otherParticipants = currentChat.participants.filter(participant => {
    if (participant === null || typeof participant === 'string') {
      return false
    }
    return participant.uid !== authorizedUserData?.uid
  }) as IAuthor[];
  if (otherParticipants.length === 0) return

  const participant = otherParticipants[0] || null;
  const participantName = participant ? `${participant.name} ${participant.surname}` : 'Неизвестный пользователь';
  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <div className="chat-header-info">
          <img className="chat-avatar" src={participant?.avatar.url} alt={participant?.nickname} />
          <div className="chat-details">
            <h3>{participantName}</h3>
            <span className="chat-status">
              {isTyping ? 'печатает...' : 'онлайн'}
            </span>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="action-button">⋮</button>
        </div>
      </div>

      <div className="chat-window-messages">
        <MessageList chatId={currentChat.id} />
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-window-input">
        <MessageInput
          chatId={currentChat.id}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 