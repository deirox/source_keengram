import React, { useState, useEffect } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import { Users } from '@/shared/api/Firebase/get';
import { IAuthor, initialIAuthor, TUserInterfaces } from '@/shared/types/api.types';
import './NewChatModal.css';

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onChatCreated }) => {
  const { createChat } = useMessengerStore();
  const { authorizedUserData } = useUserStore();
  const [selectedUser, setSelectedUser] = useState(initialIAuthor);
  const [isCreating, setIsCreating] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<TUserInterfaces[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем пользователей при открытии модального окна
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await Users({
          count: 50,
          return_type: "IAuthor"
        });

        if (response.status === "success" && response.data) {
          // Фильтруем текущего пользователя из списка
          const filteredUsers = response.data.filter(
            user => user.uid !== authorizedUserData?.uid
          );
          setAvailableUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [authorizedUserData?.uid]);

  // Фильтруем пользователей по поисковому запросу
  const filteredUsers = availableUsers.filter((user: TUserInterfaces) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const name = `${user.name} ${user.surname}`.toLowerCase();
    const nickname = user.nickname?.toLowerCase() || '';

    return name.includes(searchLower) || nickname.includes(searchLower);
  });

  const handleCreateChat = async () => {
    if (!selectedUser || !authorizedUserData?.uid) return;

    setIsCreating(true);
    try {
      const chatId = await createChat([authorizedUserData as IAuthor, selectedUser]);
      onChatCreated(chatId);
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      // Здесь можно показать уведомление об ошибке
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserSelect = (user: IAuthor) => {
    setSelectedUser(user);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Новый чат</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="user-selection">
            <h4>Выберите пользователя:</h4>

            {/* Поиск */}
            <div className="user-search">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="user-list">
              {isLoadingUsers ? (
                <div className="loading-users">
                  <div className="loading-spinner"></div>
                  <p>Загрузка пользователей...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="no-users">
                  <p>Пользователи не найдены</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    className={`user-item ${selectedUser.uid === user.uid ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      <img
                        src={user.avatar?.url || 'img/EmptyAvatar.jpg'}
                        alt={user.nickname || 'Avatar'}
                      />
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name} {user.surname}</span>
                      <span className="user-nickname">@{user.nickname}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isCreating}
          >
            Отмена
          </button>
          <button
            className="create-button"
            onClick={handleCreateChat}
            disabled={!selectedUser || isCreating}
          >
            {isCreating ? 'Создание...' : 'Создать чат'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal; 