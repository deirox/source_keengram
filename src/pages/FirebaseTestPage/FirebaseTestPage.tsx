import React from 'react';
import FirebaseTest from '@/components/Messenger/FirebaseTest';
import EnvironmentTest from '@/components/Messenger/EnvironmentTest';
import './FirebaseTestPage.css';

const FirebaseTestPage: React.FC = () => {
  return (
    <div className="firebase-test-page">
      <h1>Тестирование Firebase</h1>
      <EnvironmentTest />
      <FirebaseTest />
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Инструкции по устранению проблем:</h3>
        <ol style={{ textAlign: 'left' }}>
          <li>Проверьте, что Firebase проект настроен правильно</li>
          <li>Убедитесь, что переменные окружения установлены</li>
          <li>Проверьте правила безопасности Firestore</li>
          <li>Убедитесь, что коллекция 'chats' существует</li>
          <li>Проверьте консоль браузера на наличие ошибок</li>
        </ol>
      </div>
    </div>
  );
};

export default FirebaseTestPage; 