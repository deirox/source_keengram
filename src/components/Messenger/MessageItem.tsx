import React from 'react';
import { useUserStore } from '@/shared/store/useUserStore';
import { Message } from '@/shared/types/messenger';
import dayjs from 'dayjs';
import './MessageItem.css';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const { authorizedUserData } = useUserStore();

  const formatTime = (timestamp: number) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <div className="message-text">
            {typeof message.content.text === 'string' ? message.content.text : 'Текстовое сообщение'}
          </div>
        );

      case 'image':
        return (
          <div className="message-media">
            {message.content.media?.url ? (
              <img
                src={message.content.media.url}
                alt="Изображение"
                className="message-image"
                loading="lazy"
              />
            ) : (
              <div className="message-text">Изображение недоступно</div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="message-media">
            {message.content.media?.url ? (
              <video
                src={message.content.media.url}
                controls
                className="message-video"
                poster={message.content.media?.thumbnail || undefined}
              >
                Ваш браузер не поддерживает видео.
              </video>
            ) : (
              <div className="message-text">Видео недоступно</div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="message-media">
            {message.content.media?.url ? (
              <>
                <audio
                  src={message.content.media.url}
                  controls
                  className="message-audio"
                >
                  Ваш браузер не поддерживает аудио.
                </audio>
                {message.content.media.duration && (
                  <span className="audio-duration">
                    {Math.floor(message.content.media.duration / 60)}:
                    {(message.content.media.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </>
            ) : (
              <div className="message-text">Аудио недоступно</div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="message-file">
            <div className="file-icon">📄</div>
            <div className="file-info">
              <div className="file-name">{message.content.media?.filename || 'Файл'}</div>
              <div className="file-size">
                {message.content.media?.size ?
                  `${(message.content.media.size / 1024 / 1024).toFixed(1)} MB` :
                  'Неизвестный размер'
                }
              </div>
            </div>
            {message.content.media?.url && (
              <a
                href={message.content.media.url}
                download={message.content.media.filename}
                className="file-download"
              >
                ⬇️
              </a>
            )}
          </div>
        );

      case 'location':
        return (
          <div className="message-location">
            <div className="location-icon">📍</div>
            <div className="location-info">
              {message.content.location ? (
                <>
                  <div className="location-coords">
                    {message.content.location.latitude.toFixed(6)}, {message.content.location.longitude.toFixed(6)}
                  </div>
                  {message.content.location.address && (
                    <div className="location-address">{message.content.location.address}</div>
                  )}
                </>
              ) : (
                <div className="location-coords">Координаты недоступны</div>
              )}
            </div>
          </div>
        );

      case 'sticker':
        return (
          <div className="message-sticker">
            {message.content.sticker?.url ? (
              <img
                src={message.content.sticker.url}
                alt="Стикер"
                className="sticker-image"
              />
            ) : (
              <div className="message-text">Стикер недоступен</div>
            )}
          </div>
        );

      default:
        return (
          <div className="message-text">
            Неподдерживаемый тип сообщения
          </div>
        );
    }
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-avatar">
        {authorizedUserData?.avatar && typeof authorizedUserData.avatar === 'string' ? (
          <img
            src={authorizedUserData.avatar}
            alt="Avatar"
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder--mini">
            {authorizedUserData?.name?.charAt(0) || 'U'}
          </div>
        )}
      </div>

      <div className="message-content">
        <div className="message-bubble">
          {renderMessageContent()}
          <div className="message-meta">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {isOwnMessage && (
              <span className="message-status">
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 