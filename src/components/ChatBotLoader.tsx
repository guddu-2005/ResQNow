
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const ChatBot = dynamic(() => import('@/components/ChatBot').then(mod => mod.ChatBot), {
  ssr: false,
  loading: () => <Skeleton className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16" />
});

export function ChatBotLoader() {
  return <ChatBot />;
}
