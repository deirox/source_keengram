import { IMessage, TChatTypes, TUserInterfaces } from "./api.types";

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';

export interface MessageContent {
  text?: string;
  media?: {
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    filename?: string;
    size?: number;
    duration?: number; // для видео и аудио
    thumbnail?: string; // для видео
    mimeType?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  sticker?: {
    id: string;
    url: string;
    pack?: string;
  };
}

export interface Message {
  uid: string;
  id: number
  senderId: string;
  receiverId: string;
  content: MessageContent;
  timestamp: number;
  isRead: boolean;
  messageType: MessageType;
  iv?: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  reactions?: {
    [userId: string]: string; // userId -> emoji
  };
}

export interface Chat {
  id: string;
  type: TChatTypes
  participants: (string | TUserInterfaces | null)[];
  lastMessage?: IMessage;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  key: CryptoKey
}

export interface UserKeyPair {
  publicKey: string;
  privateKey: string;
  userId: string;
  createdAt: number;
}

export interface EncryptedMessage {
  content: string;
  iv: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
}

export interface ChatSession {
  chatId: string;
  sharedSecret: string;
  participants: string[];
  isActive: boolean;
}

export interface MessengerState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  messagesLoading: { [chatId: string]: boolean }; // Состояние загрузки для каждого чата
  userKeyPair: UserKeyPair | null;
  chatSessions: { [sessionId: string]: ChatSession };
  isConnected: boolean;
  isLoading: boolean;
} 