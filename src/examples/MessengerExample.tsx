import React, { useEffect } from 'react';
import { useMessengerStore } from '@/shared/store/useMessengerStore';
import { useUserStore } from '@/shared/store/useUserStore';
import { Messenger } from '@/components/Messenger';

const MessengerExample: React.FC = () => {
  const { authorizedUserData } = useUserStore();
  const { initializeMessenger, isConnected, isLoading } = useMessengerStore();

  useEffect(() => {
    // Инициализируем мессенджер при загрузке компонента
    if (authorizedUserData?.uid && !isConnected) {
      initializeMessenger(authorizedUserData.uid);
    }
  }, [authorizedUserData?.uid, isConnected, initializeMessenger]);

  if (!authorizedUserData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Мессенджер</h2>
        <p>Для использования мессенджера необходимо войти в систему</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Загрузка мессенджера...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <Messenger />
    </div>
  );
};

export default MessengerExample; 