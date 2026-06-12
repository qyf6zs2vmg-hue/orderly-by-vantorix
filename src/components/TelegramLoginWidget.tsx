import React, { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface Props {
  botName: string;
  onAuth: (user: TelegramUser) => void;
}

export const TelegramLoginWidget: React.FC<Props> = ({ botName, onAuth }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Expose global callback
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    if (containerRef.current) {
      // Clear container
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-userpic', 'false');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;

      containerRef.current.appendChild(script);
    }
  }, [botName, onAuth]);

  return <div ref={containerRef} className="flex justify-center my-4"></div>;
};
