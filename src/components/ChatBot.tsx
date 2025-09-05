
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { askGemini } from '@/services/gemini';
import { getWeather } from '@/services/weather';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  isTyping?: boolean;
};

type CachedWeather = {
  data: string;
  timestamp: number;
};

const WEATHER_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const TYPING_SPEED = 40; // ms per character

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'bot',
      text: "Hello! I'm RescueBot. How can I assist you with disaster information or current weather?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastWeather, setLastWeather] = useState<CachedWeather | null>(null);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const nextId = messages.length;
    
    setMessages((prev) => [...prev, { id: nextId, sender: 'user', text: userMessageText }]);
    setInputValue('');
    setIsLoading(true);

    const lowerCaseInput = userMessageText.toLowerCase();
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'wind', 'humidity'];
    const isWeatherQuery = weatherKeywords.some(keyword => lowerCaseInput.includes(keyword));

    try {
      let botResponseText = '';
      if (isWeatherQuery) {
        const now = Date.now();
        if (lastWeather && (now - lastWeather.timestamp < WEATHER_CACHE_DURATION)) {
            const geminiPrompt = `The user asked: "${userMessageText}". The current cached weather is: "${lastWeather.data}". Please answer the user's question based on this weather data.`;
            botResponseText = await askGemini(geminiPrompt);
        } else {
          try {
            const position = await getCurrentPosition();
            const weatherInfo = await getWeather(position.coords.latitude, position.coords.longitude);
            setLastWeather({ data: weatherInfo, timestamp: Date.now() });
            const geminiPrompt = `The user asked: "${userMessageText}". The current weather is: "${weatherInfo}". Please answer the user's question based on this weather data.`;
            botResponseText = await askGemini(geminiPrompt);
          } catch (geoError: any) {
             console.error("Geolocation error:", geoError);
             botResponseText = "I couldn't get your location to check the weather. Please ensure you've enabled location permissions for this site. I can still answer other questions.";
          }
        }
      } else {
        botResponseText = await askGemini(userMessageText);
      }
      
      const botMessageId = nextId + 1;
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: 'bot', text: '', isTyping: true },
      ]);
      
      let index = 0;
      const interval = setInterval(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: botResponseText.substring(0, index + 1) }
              : msg
          )
        );
        index++;
        if (index === botResponseText.length) {
          clearInterval(interval);
           setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, isTyping: false } : msg
            )
          );
        }
      }, TYPING_SPEED);

    } catch (error) {
      console.error("Error getting bot response:", error);
       setMessages((prev) => [...prev, { id: nextId + 1, sender: 'bot', text: "⚠️ Gemini API failed. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm">
            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot size={20} />
                    <span>Rescue.AI Assistant</span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground md:hidden">
                    <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col p-4">
                <div ref={chatBodyRef} className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex items-start gap-3',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.sender === 'bot' && (
                        <div className="bg-muted text-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                           <Bot size={16} />
                        </div>
                      )}
                       <div
                        className={cn(
                          'p-3 rounded-lg max-w-[80%]',
                           message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        )}
                      >
                        <p className="text-sm">{message.text}{message.isTyping && <span className="animate-pulse">...</span>}</p>
                      </div>
                    </div>
                  ))}
                   {isLoading && messages[messages.length-1]?.sender === 'user' && (
                    <div className="flex items-start gap-3 justify-start">
                         <div className="bg-muted text-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                           <Bot size={16} />
                        </div>
                        <div className="p-3 rounded-lg bg-muted text-foreground">
                            <p className="text-sm italic">Thinking...</p>
                        </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                 <div className="flex w-full items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Ask about disasters or weather..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                        <Send size={16} />
                    </Button>
                </div>
              </CardFooter>
            </Card>
        </div>
      )}
    </>
  );
}
