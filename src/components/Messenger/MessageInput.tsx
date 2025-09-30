import React, { useState, useRef } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import { MessageContent, MessageType } from '@/shared/types/messenger';
import './MessageInput.css';

interface MessageInputProps {
  chatId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ chatId }) => {
  const [message, setMessage] = useState('');
  const { sendTextMessage, sendMediaMessage } = useMessengerStore();
  const { authorizedUserData } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const handleSendMessage = async () => {
    if (!message.trim() || !authorizedUserData?.uid) return;

    try {
      await sendTextMessage(chatId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authorizedUserData?.uid) return;

    try {
      // Здесь должна быть логика загрузки файла на сервер
      // Пока что используем URL.createObjectURL для демонстрации
      const fileUrl = URL.createObjectURL(file);

      let messageType: MessageType = 'file';
      let content: MessageContent = {
        media: {
          type: 'file',
          url: fileUrl,
          filename: file.name,
          size: file.size,
          mimeType: file.type
        }
      };
      console.log('messageType', messageType)
      // Определяем тип файла
      if (file.type.startsWith('image/')) {
        messageType = 'image';
        content.media!.type = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
        content.media!.type = 'video';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio';
        content.media!.type = 'audio';
      }

      await sendMediaMessage(chatId, content.media);
    } catch (error) {
      console.error('Ошибка отправки файла:', error);
    }
  };

  // const handleAudioRecord = async () => {
  //   // Здесь должна быть логика записи аудио
  //   // Пока что создаем заглушку
  //   try {
  //     const content: MessageContent = {
  //       media: {
  //         type: 'audio',
  //         url: 'audio-placeholder.mp3',
  //         duration: 30,
  //         mimeType: 'audio/mp3'
  //       }
  //     };

  //     await sendMediaMessage(chatId, content.media);
  //   } catch (error) {
  //     console.error('Ошибка записи аудио:', error);
  //   }
  // };

  return (
    <div className="message-input-container">
      <div className="message-input-actions">
        <button
          className="action-button"
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить файл"
        >
          📎
        </button>
        <button
          className="action-button"
          onClick={() => audioInputRef.current?.click()}
          title="Записать аудио"
        >
          🎤
        </button>
      </div>

      <div className="message-input-main">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          className="message-textarea"
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="send-button"
        >
          ➤
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      <input
        ref={audioInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="audio/*"
      />
    </div>
  );
};

export default MessageInput; 