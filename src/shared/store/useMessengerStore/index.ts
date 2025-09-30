import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { firestore } from '@/shared/api/firebase';
import {
  MessengerState,
  Message,
  Chat,
  MessageContent,
  MessageType
} from '@/shared/types/messenger';
import { IAuthor, IChat, IMessage, initialIBigDataWithLength, TChatTypes } from '@/shared/types/api.types';
import { useUserStore } from '@/shared/store/useUserStore';
import { Crypto } from '@/shared/utils/cripto';

interface MessengerActions {
  // Инициализация мессенджера
  initializeMessenger: (userId: string) => Promise<void>;

  // Управление чатами
  createChat: (participants: IAuthor[]) => Promise<string>;
  selectChat: (chatId: string) => void;
  loadChats: (userId: string) => Promise<void>;

  // Управление сообщениями
  sendMessage: (chatId: string, content: MessageContent, messageType: MessageType) => Promise<void>;
  sendTextMessage: (chatId: string, text: string) => Promise<void>;
  sendMediaMessage: (chatId: string, media: MessageContent['media']) => Promise<void>;
  sendLocationMessage: (chatId: string, location: MessageContent['location']) => Promise<void>;
  sendStickerMessage: (chatId: string, sticker: MessageContent['sticker']) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  setMessagesLoading: (chatId: string, loading: boolean) => void;
  areMessagesLoaded: (chatId: string) => boolean;

  // Криптография
  getOrCreateSharedSecret: (otherUserId: string) => Promise<string>;
  getUserPublicKey: (userId: string) => Promise<string | null>;
  loadKey: (receptientId: string) => CryptoKey

  // Состояние
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;

  // Очистка
  clearMessenger: () => void;
}

type MessengerStore = MessengerState & MessengerActions;

const initialState: MessengerState = {
  chats: [],
  currentChat: null,
  messages: {},
  messagesLoading: {},
  userKeyPair: null,
  chatSessions: {},
  isConnected: false,
  isLoading: false,
};

export const useMessengerStore = create<MessengerStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      initializeMessenger: async (userId: string) => {
        set({ isLoading: true, });

        try {
          console.log('Инициализация мессенджера для пользователя:', userId);

          // Проверяем подключение к Firebase
          if (!firestore) {
            throw new Error('Firebase не инициализирован');
          }

          // Загружаем чаты
          await get().loadChats(userId);
          console.log('Чаты загружены');

          set({ isConnected: true });
          console.log('Мессенджер успешно инициализирован');
        } catch (error) {
          console.error('Ошибка инициализации мессенджера:', error);
          set({ isConnected: false });

          // Показываем более подробную информацию об ошибке
          if (error instanceof Error) {
            console.error('Детали ошибки:', error.message);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      createChat: async (participants) => {
        try {
          const chatType: TChatTypes = participants.length > 2 ? "public_group" : "private_chat"
          const chatData: Partial<IChat> = {
            type: chatType,
            members: participants.map(participant => participant.uid),
            printings: [],
            status: ['active'],
            pined_messages: initialIBigDataWithLength,
            messages: initialIBigDataWithLength,
            deleted_for: { data: [], length: 0 },
            created_at: Timestamp.now() as any,
            updated_at: Timestamp.now() as any
          };

          const { key, keyData } = await Crypto.generateSymmetricKey()

          const docRef = await addDoc(collection(firestore, 'chats'), chatData);

          participants.forEach(async (participant) => {
            if (!participant.public_key) {
              throw `У пользователя ${participant.nickname} возникла ошибка, повторите попытку позже!`;
            }
            await addDoc(collection(firestore, 'chats', docRef.id, 'keys', participant.uid), await Crypto.encryptMessage(await Crypto.importPublicKey(participant.public_key), keyData));
          })

          const newChat: Chat = {
            id: docRef.id,
            type: chatType,
            participants: participants,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            key,
          };

          set(state => {
            state.chats.unshift(newChat)
            state.messages[docRef.id] = []
            return ({
              chats: state.chats, // Новый чат в начале списка
              messages: state.messages
            })
          });

          return docRef.id;
        } catch (error) {
          console.error('Ошибка создания чата:', error);
          throw error;
        }
      },

      selectChat: async (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (chat) {
          set({ currentChat: { ...chat } });
        }
      },

      loadChats: async (userId: string) => {
        try {
          console.log('Загрузка чатов для пользователя:', userId);

          // Проверяем, что коллекция существует
          const chatsRef = collection(firestore, 'chats');
          const authorized_user_key = await Crypto.getEncryptedKeyFromDB() as string

          const chatsQuery = query(
            chatsRef,
            where('members', 'array-contains', userId),
            orderBy('updated_at', 'desc')
          );

          console.log('Создан запрос к чатам');

          onSnapshot(chatsQuery,
            async (snapshot) => {
              console.log('Получены данные чатов:', snapshot.size, 'чатов');
              const chats: Chat[] = [];

              for (const _doc of snapshot.docs) {
                try {

                  const encrypted_key_response = await getDoc(doc(firestore, "chats", _doc.id, 'keys', userId))
                  const encrypted_key = encrypted_key_response.data()
                  if (!encrypted_key) return

                  const decrypted_key = await Crypto.importSymmetricKey(await Crypto.decryptMessage(await Crypto.importPrivateKey(authorized_user_key), encrypted_key.encryptedData as string, encrypted_key.iv as string))
                  const data = _doc.data() as IChat;

                  // Получаем данные пользователей для участников
                  const getUser = useUserStore.getState().getUser;
                  const participants = await Promise.all(
                    data.members.map(async (member) => {
                      if (typeof member === 'string') {
                        try {
                          return await getUser({ by: "uid", data: member, return_type: "IAuthor" });
                        } catch (error) {
                          console.error('Ошибка получения пользователя:', error);
                          return null;
                        }
                      }
                      return member;
                    })
                  );

                  const chat: Chat = {
                    id: _doc.id,
                    type: data.type,
                    participants,
                    isActive: data.status.includes('active'),
                    createdAt: data.created_at?.seconds ? data.created_at.seconds * 1000 : Date.now(),
                    updatedAt: data.updated_at?.seconds ? data.updated_at.seconds * 1000 : (data.last_message?.created_at?.seconds ? data.last_message.created_at.seconds * 1000 : Date.now()),
                    lastMessage: data.last_message ? data.last_message : undefined,
                    key: decrypted_key
                  };
                  chats.push(chat);
                } catch (docError) {
                  console.error('Ошибка обработки документа чата:', docError);
                }
              }

              // Сортируем чаты по updatedAt (новые сообщения вверху)
              const sortedChats = chats.sort((a, b) => b.updatedAt - a.updatedAt);
              set({ chats: sortedChats });
              console.log('Чаты обновлены в store:', sortedChats.length);
            },
            (error) => {
              console.error('Ошибка в onSnapshot для чатов:', error);
            }
          );
        } catch (error) {
          console.error('Ошибка загрузки чатов:', error);
          // Устанавливаем пустой массив чатов в случае ошибки
          set({ chats: [] });
        }
      },

      getOrCreateSharedSecret: async (otherUserId: string) => {
        const { userKeyPair, chatSessions } = get();
        const currentUserId = userKeyPair?.userId;

        if (!currentUserId || !userKeyPair) {
          throw new Error('Ключи пользователя не найдены');
        }

        // Создаем уникальный ID для сессии
        const sessionId = [currentUserId, otherUserId].sort().join('_');

        // Проверяем, есть ли уже сессия
        if (chatSessions[sessionId]) {
          return chatSessions[sessionId].sharedSecret;
        }

        // Генерируем общий секрет (в реальном приложении нужно использовать Diffie-Hellman)
        // Пока используем простой метод для демонстрации
        // const sharedSecret = CryptoUtils.generateSharedSecret(
        //   userKeyPair.privateKey,
        //   otherUserId // В реальном приложении здесь должен быть публичный ключ другого пользователя
        // );

        // const newSession: ChatSession = {
        //   chatId: sessionId,
        //   // sharedSecret,
        //   participants: [currentUserId, otherUserId],
        //   isActive: true
        // };

        // set(state => ({
        //   chatSessions: { ...state.chatSessions, [sessionId]: newSession }
        // }));

        return "";
      },

      getUserPublicKey: async (userId: string) => {
        try {
          // Получаем публичный ключ пользователя из Firebase или другого источника
          // Это может быть отдельная коллекция в Firestore
          const userDoc = await getDoc(doc(firestore, 'user_keys', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return userData.publicKey || null;
          }
          return null;
        } catch (error) {
          console.error('Ошибка получения публичного ключа:', error);
          return null;
        }
      },
      sendMessage: async (chatId: string, content: MessageContent, messageType: MessageType = 'text') => {
        console.log('sendMessage');
        try {
          const { userKeyPair, currentChat } = get()

          if (!currentChat) return console.error("currentChat is unknown")
          if (currentChat.type === 'public_group') {
            currentChat.participants[currentChat.participants.length - 1]
          }
          if (!userKeyPair) return
          console.log('userKeyPair', userKeyPair)
          console.log('sendMessage content', content)
          // Сериализуем контент для шифрования
          const contentString = JSON.stringify(content);
          console.log('sendMessage contentString', contentString)
          // Шифруем контент сообщения
          const { encryptedData, iv } = await Crypto.encryptMessage(await Crypto.importPublicKey(userKeyPair.publicKey), contentString)
          console.log('sendMessage encryptHybrid', { encryptedData })
          // Создаем сообщение для Firebase
          const messageData: Partial<IMessage> = {
            type: messageType,
            id: currentChat.lastMessage ? currentChat.lastMessage.id : 0,
            content: encryptedData, // Сохраняем ЗАШИФРОВАННЫЙ контент
            author: userKeyPair.userId,
            status: ['unread'],
            reactions: { data: [], length: 0 },
            reply_to: '',
            deleted_for: { data: [], length: 0 },
            created_at: Timestamp.now() as any,
            updated_at: Timestamp.now() as any,
            iv
          };

          // Добавляем сообщение в Firebase
          await addDoc(collection(firestore, 'chats', chatId, 'messages'), messageData);

          // Создаем локальное сообщение (расшифрованное для отображения)
          // const message: IMessage = {
          //   uid: messageRef.id,
          //   id: 10,
          //   author: userKeyPair.userId,
          //   content: content, // Оригинальный контент для отображения
          //   status: ['unread'],
          //   type: messageType,
          //   deleted_for: initialIBigDataWithLength,
          //   reactions: initialIBigDataWithLength,
          //   reply_to: "",
          //   created_at: { ...initialIFirebaseCreatedAt, nanoseconds: Date.now() },
          //   updated_at: { ...initialIFirebaseCreatedAt, nanoseconds: Date.now() },
          //   iv,
          //   isRead: false
          // };

          // Обновляем локальное состояние
          set(state => ({
            // Обновляем updatedAt чата при отправке сообщения
            chats: state.chats.map(chat =>
              chat.id === chatId
                ? { ...chat, updatedAt: Date.now() }
                : chat
            )
          }));

          // Обновляем последнее сообщение в чате и время обновления
          await updateDoc(doc(firestore, 'chats', chatId), {
            last_message: messageData,
            updated_at: Timestamp.now()
          });

        } catch (error) {
          console.error('Ошибка отправки сообщения:', error);
          throw error;
        }
      },

      sendTextMessage: async (chatId: string, text: string) => {
        // Убеждаемся, что text является строкой
        const textContent = typeof text === 'string' ? text : String(text);
        const content: MessageContent = { text: textContent };
        await get().sendMessage(chatId, content, 'text');
      },

      sendMediaMessage: async (chatId: string, media: MessageContent['media']) => {
        if (!media) return;
        const content: MessageContent = { media };
        await get().sendMessage(chatId, content, media.type);
      },

      sendLocationMessage: async (chatId: string, location: MessageContent['location']) => {
        if (!location) return;
        const content: MessageContent = { location };
        await get().sendMessage(chatId, content, 'location');
      },

      sendStickerMessage: async (chatId: string, sticker: MessageContent['sticker']) => {
        if (!sticker) return;
        const content: MessageContent = { sticker };
        await get().sendMessage(chatId, content, 'sticker');
      },

      loadMessages: async (chatId: string) => {
        try {
          // Устанавливаем состояние загрузки
          get().setMessagesLoading(chatId, true);

          console.log(`Начинаем загрузку сообщений для чата: ${chatId}`);

          const messagesQuery = query(
            collection(firestore, 'chats', chatId, 'messages'),
            orderBy('created_at', 'asc')
          );

          onSnapshot(messagesQuery, async (snapshot) => {
            console.log(`Получены сообщения для чата ${chatId}:`, snapshot.size, 'сообщений');
            const messages: Message[] = [];

            for (const docSnapshot of snapshot.docs) {
              const data = docSnapshot.data() as IMessage;
              const { userKeyPair } = get();
              if (userKeyPair === null) return
              console.log('userKeyPair', userKeyPair.privateKey)
              let decryptedContent: MessageContent = { text: "" };

              // Расшифровываем сообщение, если есть IV
              if (typeof data.content === 'string') {
                try {
                  const decryptedString = await Crypto.decryptMessage(
                    await Crypto.importPrivateKey(userKeyPair.privateKey),
                    data.content, // Зашифрованный контент
                    data.iv
                  );
                  console.log('loadMessages decrypt decryptedString', decryptedString)
                  try {
                    const parsed = JSON.parse(decryptedString);
                    // Проверяем, что расшифрованный контент имеет правильную структуру
                    if (typeof parsed === 'object' && parsed !== null) {
                      decryptedContent = parsed;
                    } else {
                      decryptedContent = { text: String(parsed) };
                    }
                  } catch (e) {
                    decryptedContent = { text: decryptedString };
                  }
                } catch (error) {
                  console.error('Ошибка расшифровки сообщения:', error);
                  decryptedContent = { text: '[Сообщение не может быть расшифровано]' };
                }
              } else {
                // Если сообщение не зашифровано, используем оригинальный контент
                decryptedContent = { text: "[Пустое сообщение]" };
              }

              const message: Message = {
                uid: docSnapshot.id,
                id: data.id,
                senderId: data.author as string,
                receiverId: '', // Можно определить на основе контекста
                content: decryptedContent,
                timestamp: data.created_at?.seconds ? data.created_at.seconds * 1000 : Date.now(),
                isRead: data.status.includes('read'),
                messageType: data.type as MessageType || 'text',
              };

              messages.push(message);
            }

            // Обновляем состояние
            set(state => ({
              messages: { ...state.messages, [chatId]: messages },
              messagesLoading: { ...state.messagesLoading, [chatId]: false },
              // Обновляем updatedAt чата при получении новых сообщений
              chats: state.chats.map(chat =>
                chat.id === chatId
                  ? { ...chat, updatedAt: Date.now() }
                  : chat
              )
            }));

            console.log(`Сообщения для чата ${chatId} успешно загружены и обработаны`);
          }, (error) => {
            console.error(`Ошибка при загрузке сообщений для чата ${chatId}:`, error);
            get().setMessagesLoading(chatId, false);
          });
        } catch (error) {
          console.error('Ошибка загрузки сообщений:', error);
          get().setMessagesLoading(chatId, false);
        }
      },

      markMessageAsRead: async (messageId: string) => {
        try {
          const { currentChat } = get();
          if (!currentChat) return;

          await updateDoc(doc(firestore, 'chats', currentChat.id, 'messages', messageId), {
            status: ['read']
          });
        } catch (error) {
          console.error('Ошибка отметки сообщения как прочитанного:', error);
        }
      },

      setMessagesLoading: (chatId: string, loading: boolean) => set(state => ({ messagesLoading: { ...state.messagesLoading, [chatId]: loading } })),
      areMessagesLoaded: (chatId: string) => get().messagesLoading[chatId] ?? false,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setConnected: (connected: boolean) => set({ isConnected: connected }),

      clearMessenger: () => set(initialState),
    }),
    {
      name: 'messenger-store',
    }
  )
); 