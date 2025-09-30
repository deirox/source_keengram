import React, { useEffect, useRef } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import MessageItem from './MessageItem';
import './MessageList.css';

interface MessageListProps {
  chatId: string;
}

const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const { messages, loadMessages, areMessagesLoaded } = useMessengerStore();
  const { authorizedUserData } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages[chatId] || [];
  const isMessagesLoading = areMessagesLoaded(chatId);
  console.log('isMessagesLoading', isMessagesLoading);
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (isMessagesLoading) {
    return (
      <div className="message-list-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка сообщений...</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {chatMessages.length === 0 ? (
        <div className="no-messages">
          <p>Сообщений пока нет</p>
          <p>Начните разговор!</p>
        </div>
      ) : (
        chatMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === authorizedUserData?.uid}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 