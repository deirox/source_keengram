import React from 'react';
import { Messenger } from '@/components/Messenger';
import './MessengerPage.css';

const MessengerPage: React.FC = () => {
  return (
    <div className="messenger-page">
      <Messenger />
    </div>
  );
};

export default MessengerPage; 