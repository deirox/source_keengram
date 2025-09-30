import React from 'react';

const EnvironmentTest: React.FC = () => {
  const envVars = {
    'VITE_REACT_APP_FIREBASE_API_KEY': import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
    'VITE_REACT_APP_FIREBASE_AUTH_DOMAIN': import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
    'VITE_REACT_APP_FIREBASE_PROJECT_ID': import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
    'VITE_REACT_APP_FIREBASE_STORAGE_BUCKET': import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
    'VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID': import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    'VITE_REACT_APP_FIREBASE_APP_ID': import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(envVars).filter(([key, value]) => {
    console.log(key); return !value
  });

  // Тест шифрования
  // const testEncryption = (): {
  //   success: boolean;
  //   original?: string;
  //   encrypted?: string;
  //   decrypted?: string;
  //   error?: string;
  // } => {
  //   try {

  //     const testMessage = "Привет, это тестовое сообщение!";


  //     return {
  //       success: decryptedMessage === testMessage,
  //       original: testMessage,
  //       encrypted: encryptedContent,
  //       decrypted: decryptedMessage
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Unknown error'
  //     };
  //   }
  // };

  // const encryptionTest = testEncryption();

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: missingVars.length > 0 ? '#ffebee' : '#e8f5e8'
    }}>
      <h3>Проверка переменных окружения Firebase</h3>

      {missingVars.length > 0 ? (
        <div style={{ color: 'red' }}>
          <p><strong>Отсутствуют переменные окружения:</strong></p>
          <ul>
            {missingVars.map(([key]) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <p>Создайте файл .env в корне проекта с этими переменными.</p>
        </div>
      ) : (
        <div style={{ color: 'green' }}>
          <p><strong>✅ Все переменные окружения настроены</strong></p>
        </div>
      )}

      <details style={{ marginTop: '15px' }}>
        <summary>Показать все переменные (скрыто для безопасности)</summary>
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <strong>{key}:</strong> {value ? `${value.substring(0, 10)}...` : 'НЕ УСТАНОВЛЕНА'}
            </div>
          ))}
        </div>
      </details>

      {/* Тест шифрования */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h4>Тест шифрования</h4>
        {/* {encryptionTest.success ? (
          <div style={{ color: 'green' }}>
            <p><strong>✅ Шифрование работает корректно</strong></p>
            <details>
              <summary>Детали теста</summary>
              <div style={{ fontSize: '12px', marginTop: '10px' }}>
                <p><strong>Оригинальное сообщение:</strong> {encryptionTest.original}</p>
                <p><strong>Зашифрованное:</strong> {encryptionTest.encrypted?.substring(0, 50) || 'N/A'}...</p>
                <p><strong>Расшифрованное:</strong> {encryptionTest.decrypted}</p>
              </div>
            </details>
          </div>
        ) : (
          <div style={{ color: 'red' }}>
            <p><strong>❌ Ошибка шифрования:</strong> {encryptionTest.error}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EnvironmentTest; 