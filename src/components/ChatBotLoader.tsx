
'use client';

import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('@/components/ChatBot').then(mod => mod.ChatBot), {
  ssr: false,
});

export function ChatBotLoader() {
  return <ChatBot />;
}
