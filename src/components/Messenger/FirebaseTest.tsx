import React, { useEffect, useState } from 'react';
import { firestore } from '@/shared/api/firebase';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Проверка подключения...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        setStatus('Проверка подключения к Firebase...');
        
        // Проверяем, что db инициализирован
        if (!firestore) {
          throw new Error('Firebase db не инициализирован');
        }
        
        setStatus('Попытка подключения к коллекции chats...');
        
        // Пытаемся получить коллекцию chats
        const chatsRef = collection(firestore, 'chats');
        const snapshot = await getDocs(chatsRef);
        
        setStatus(`Подключение успешно! Найдено ${snapshot.size} чатов`);
        setError(null);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(errorMessage);
        setStatus('Ошибка подключения');
        console.error('Ошибка тестирования Firebase:', err);
      }
    };

    testFirebaseConnection();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: error ? '#ffebee' : '#e8f5e8'
    }}>
      <h3>Тест подключения к Firebase</h3>
      <p><strong>Статус:</strong> {status}</p>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 