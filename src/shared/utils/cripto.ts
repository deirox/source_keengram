// utils/crypto.ts
export class Crypto {
    // Генерация пары ключей с безопасными параметрами
    static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
        // Используем стандартный и безопасный public exponent (65537)
        // Но гарантируем, что каждый ключ будет уникальным за счет случайной генерации
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048, // Увеличиваем длину ключа для безопасности
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537 в байтах
                hash: "SHA-256", // Используем более стойкий хеш
            },
            true,
            ["encrypt", "decrypt"]
        );

        // Экспорт ключей
        const [publicKey, privateKey] = await Promise.all([
            window.crypto.subtle.exportKey("spki", keyPair.publicKey),
            window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
        ]);

        return {
            publicKey: this.arrayBufferToBase64(publicKey),
            privateKey: this.arrayBufferToBase64(privateKey),
        };
    }

    // Импорт публичного ключа
    static async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
        try {
            const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
            return await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["encrypt"]
            );
        } catch (error) {
            console.error("Error importing public key:", error);
            throw new Error("Неверный формат публичного ключа");
        }
    }

    // Импорт приватного ключа
    static async importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
        try {
            const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
            return await window.crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["decrypt"]
            );
        } catch (error) {
            console.error("Error importing private key:", error);
            throw new Error("Неверный формат приватного ключа");
        }
    }



    // Сохранение приватного ключа (вызывается при первом входе или регистрации)
    // async storeEncryptedKey(privateKey: ArrayBuffer, password: string): Promise<void> {
    //     try {
    //         // Шифруем ключ с помощью пароля
    //         const encryptedData = await this.encryptPrivateKey(privateKey, password);

    //         // Сохраняем зашифрованный ключ в IndexedDB
    //         await this.saveEncryptedKeyToDB(encryptedData);

    //         console.log('Приватный ключ успешно зашифрован и сохранен');
    //     } catch (error) {
    //         console.error('Ошибка при сохранении ключа:', error);
    //         throw error;
    //     }
    // }

    // Шифрование приватного ключа паролем
    static async encryptPrivateKeyWithPassword(
        privateKey: string,
        password: string
    ): Promise<{ encryptedKey: string; salt: string; iv: string }> {
        try {
            // Преобразуем пароль в массив байтов
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);

            // Генерируем случайную соль для PBKDF2
            const salt = crypto.getRandomValues(new Uint8Array(16));

            // Генерируем ключ из пароля с помощью PBKDF2
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );

            // Генерируем случайный IV (Initialization Vector)
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Преобразуем приватный ключ в массив байтов
            const privateKeyData = encoder.encode(privateKey);

            // Шифруем приватный ключ
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                privateKeyData
            );

            // Преобразуем результаты в base64 для хранения
            return {
                encryptedKey: this.arrayBufferToBase64(encrypted),
                salt: this.arrayBufferToBase64(salt),
                iv: this.arrayBufferToBase64(iv),
            };
        } catch (error) {
            console.error('Error encrypting private key:', error);
            throw new Error('Ошибка шифрования приватного ключа');
        }
    }

    // Расшифровка приватного ключа паролем
    static async decryptPrivateKeyWithPassword(
        encryptedKey: string,
        salt: string,
        iv: string,
        password: string
    ): Promise<string> {
        try {
            // Преобразуем пароль в массив байтов
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);

            // Декодируем соль и IV из base64
            const saltBuffer = this.base64ToArrayBuffer(salt);
            const ivBuffer = this.base64ToArrayBuffer(iv);

            // Генерируем ключ из пароля с помощью PBKDF2
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            // Декодируем зашифрованный ключ
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedKey);

            // Расшифровываем приватный ключ
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivBuffer,
                },
                key,
                encryptedBuffer
            );

            // Преобразуем результат в строку
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Error decrypting private key:', error);
            throw new Error('Неверный пароль или поврежденные данные');
        }
    }


    // Генерация случайного симметричного ключа
    static async generateSymmetricKey(): Promise<{ key: CryptoKey; keyData: string }> {
        try {
            const key = await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            );

            // Экспортируем ключ для хранения
            const exportedKey = await window.crypto.subtle.exportKey('raw', key);
            const keyData = this.arrayBufferToBase64(exportedKey);

            return { key, keyData };
        } catch (error) {
            console.error("Error generating symmetric key:", error);
            throw new Error("Ошибка генерации ключа");
        }
    }

    // Шифрование с использованием готового симметричного ключа
    static async encryptMessage(
        key: CryptoKey,
        message: string
    ): Promise<{ encryptedData: string; iv: string }> {
        try {
            // Генерируем случайный IV
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Шифруем сообщение
            const encodedMessage = new TextEncoder().encode(message);
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                encodedMessage
            );

            return {
                encryptedData: this.arrayBufferToBase64(encryptedData),
                iv: this.arrayBufferToBase64(iv),
            };
        } catch (error) {
            console.error("Error encrypting with symmetric key:", error);
            throw new Error("Ошибка шифрования сообщения");
        }
    }

    // Расшифровка с использованием готового симметричного ключа
    static async decryptMessage(
        key: CryptoKey,
        encryptedData: string,
        iv: string
    ): Promise<string> {
        try {
            // Декодируем компоненты из base64
            const ivBuffer = this.base64ToArrayBuffer(iv);
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);

            // Расшифровываем сообщение
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivBuffer,
                },
                key,
                encryptedBuffer
            );

            return new TextDecoder().decode(decryptedData);
        } catch (error) {
            console.error("Error decrypting with symmetric key:", error);
            throw new Error("Ошибка расшифровки сообщения");
        }
    }

    // Импорт симметричного ключа из base64
    static async importSymmetricKey(keyData: string): Promise<CryptoKey> {
        try {
            const keyBuffer = this.base64ToArrayBuffer(keyData);

            return await window.crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error("Error importing symmetric key:", error);
            throw new Error("Ошибка импорта ключа");
        }
    }

    // Сохранение зашифрованного ключа в IndexedDB
    static async saveEncryptedKeyToDB(encryptedData: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(import.meta.env.VITE_REACT_APP_INDEXEDDB_DBNAME, 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction([import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME], 'readwrite');
                const store = transaction.objectStore(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME);
                const saveRequest = store.put({
                    id: 'private_key',
                    ...encryptedData,
                    timestamp: Date.now()
                });

                saveRequest.onsuccess = () => resolve();
                saveRequest.onerror = () => reject(saveRequest.error);

                transaction.onerror = () => reject(transaction.error);
            };

            request.onupgradeneeded = (event) => {
                const target = event.target as IDBOpenDBRequest;
                if (target.result) {
                    if (!target.result.objectStoreNames.contains(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME)) {
                        target.result.createObjectStore(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME, { keyPath: 'id' });
                    }
                }
            };
        });
    }

    // Получение зашифрованного ключа из IndexedDB
    static async getEncryptedKeyFromDB(): Promise<any> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(import.meta.env.VITE_REACT_APP_INDEXEDDB_DBNAME, 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction([import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME], 'readonly');
                const store = transaction.objectStore(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME);
                const getKey = store.get('private_key');

                getKey.onsuccess = () => resolve(getKey.result);
                getKey.onerror = () => reject(getKey.error);

                transaction.onerror = () => reject(transaction.error);
            };

            request.onupgradeneeded = (event) => {
                const target = event.target as IDBOpenDBRequest;
                if (target.result) {
                    if (!target.result.objectStoreNames.contains(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME)) {
                        target.result.createObjectStore(import.meta.env.VITE_REACT_APP_INDEXEDDB_STORENAME, { keyPath: 'id' });
                    }
                }
            };
        });
    }

    // Инициализация при входе пользователя (расшифровка и загрузка ключа)
    // async initialize(password: string): Promise<ArrayBuffer> {
    //     try {
    //         // Получаем зашифрованный ключ из IndexedDB
    //         const encryptedKeyData = await this.getEncryptedKeyFromDB();

    //         if (!encryptedKeyData) {
    //             throw new Error('Зашифрованный ключ не найден');
    //         }

    //         // Расшифровываем ключ
    //         this.privateKey = await this.decryptPrivateKey(encryptedKeyData, password);

    //         console.log('Приватный ключ успешно загружен и расшифрован');
    //         return this.privateKey;

    //     } catch (error) {
    //         console.error('Ошибка при инициализации:', error);
    //         throw error;
    //     }
    // }




    // Вспомогательные функции
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        return btoa(String.fromCharCode(...bytes));
    }

    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}