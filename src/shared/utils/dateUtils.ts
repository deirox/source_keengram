import dayjs from 'dayjs';

export const formatTime = (timestamp: number): string => {
  const now = dayjs();
  const messageTime = dayjs(timestamp);

  // Если сообщение сегодня
  if (messageTime.isSame(now, 'day')) {
    return messageTime.format('HH:mm');
  }

  // Если сообщение вчера
  if (messageTime.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Вчера';
  }

  // Если сообщение на этой неделе
  if (messageTime.isAfter(now.subtract(7, 'day'))) {
    return messageTime.format('dddd');
  }

  // Если сообщение в этом году
  if (messageTime.isSame(now, 'year')) {
    return messageTime.format('DD MMM');
  }

  // Если сообщение в прошлом году
  return messageTime.format('DD.MM.YYYY');
};

export const formatMessageTime = (timestamp: number): string => {
  return dayjs(timestamp).format('HH:mm');
};

export const formatFullDate = (timestamp: number): string => {
  return dayjs(timestamp).format('DD MMMM YYYY в HH:mm');
};

export const isToday = (timestamp: number): boolean => {
  return dayjs(timestamp).isSame(dayjs(), 'day');
};

export const isYesterday = (timestamp: number): boolean => {
  return dayjs(timestamp).isSame(dayjs().subtract(1, 'day'), 'day');
}; 