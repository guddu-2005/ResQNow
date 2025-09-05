
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, CornerDownRight, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { askGemini } from '@/services/gemini';
import { getWeather } from '@/services/weather';
import { cn } from '@/lib/utils';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I'm RescueBot. How can I assist you with disaster information or current weather?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const lowerCaseInput = inputValue.toLowerCase();
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'wind', 'humidity'];
    const isWeatherQuery = weatherKeywords.some(keyword => lowerCaseInput.includes(keyword));

    try {
      let botResponseText = '';
      if (isWeatherQuery) {
        botResponseText = await handleWeatherQuery(inputValue);
      } else {
        botResponseText = await askGemini(inputValue);
      }

      const botMessage: Message = { sender: 'bot', text: botResponseText };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Error getting bot response:", error);
      const errorMessage: Message = {
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeatherQuery = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("I can't get weather information because your browser doesn't support geolocation.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const weatherInfo = await getWeather(latitude, longitude);
                    const finalPrompt = `The user asked: "${query}". The current weather is: "${weatherInfo}". Please answer the user's question based on this weather data.`;
                    const geminiResponse = await askGemini(finalPrompt);
                    resolve(geminiResponse);
                } catch (e) {
                    console.error(e);
                    resolve("I couldn't fetch the weather data. However, I can still try to answer your question. What would you like to know?");
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                resolve("I couldn't get your location to check the weather. Please ensure you've enabled location permissions for this site.");
            }
        );
    });
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Bot size={24} />
                    <span>RescueBot</span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="md:hidden">
                    <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col">
                <div ref={chatBodyRef} className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.sender === 'bot' && (
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                           <Bot size={16} />
                        </div>
                      )}
                       <div
                        className={cn(
                          'p-3 rounded-lg max-w-[80%]',
                           message.sender === 'user'
                            ? 'bg-muted text-foreground'
                            : 'bg-card text-card-foreground border'
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                   {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                         <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                           <Bot size={16} />
                        </div>
                        <div className="p-3 rounded-lg bg-card text-card-foreground border">
                            <p className="text-sm italic">Thinking...</p>
                        </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                 <div className="flex w-full items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Ask about disasters or weather..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
