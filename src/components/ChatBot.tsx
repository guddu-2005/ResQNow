
'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Bot, X, Send, ArrowDown, Square, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { askGemini } from '@/services/gemini';
import { getWeather } from '@/services/weather';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
};

type CachedWeather = {
  data: string;
  timestamp: number;
};

const WEATHER_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const TYPING_SPEED = 40; // ms per character

const initialMessages: Message[] = [
    {
      id: 0,
      sender: 'bot',
      text: "Hello! I'm RescueBot. How can I assist you with disaster information or current weather?",
    },
];

const ChatBotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastWeather, setLastWeather] = useState<CachedWeather | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    setTimeout(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTo({
                top: chatBodyRef.current.scrollHeight,
                behavior: behavior,
            });
        }
    }, 0);
  }, []);

  const handleScroll = useCallback(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      const { scrollTop, scrollHeight, clientHeight } = chatBody;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      isScrolledUpRef.current = !isAtBottom;
      setShowScrollDown(!isAtBottom);
    }
  }, []);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (isOpen && chatBody) {
        scrollToBottom('auto');
        chatBody.addEventListener('scroll', handleScroll, { passive: true });
        
        const stopWheelPropagation = (e: WheelEvent) => {
            if (chatBody.contains(e.target as Node)) {
                if (chatBody.scrollHeight > chatBody.clientHeight) {
                    e.stopPropagation();
                }
            }
        };
        
        document.addEventListener('wheel', stopWheelPropagation, { capture: true });
        
        return () => {
            chatBody.removeEventListener('scroll', handleScroll);
            document.removeEventListener('wheel', stopWheelPropagation, { capture: true });
        };
    }
  }, [isOpen, handleScroll, scrollToBottom]);

  useEffect(() => {
    if (!isScrolledUpRef.current && isTyping) {
        scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);


  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }, []);

  const stopTyping = useCallback(() => {
    if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
    }
    setIsTyping(false);
  }, []);

  const handleNewChat = () => {
    stopTyping();
    setMessages(initialMessages);
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    stopTyping();
    isScrolledUpRef.current = false;

    const userMessageText = inputValue;
    const nextId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
    
    setMessages((prev) => [...prev, { id: nextId, sender: 'user', text: userMessageText }]);
    setInputValue('');
    scrollToBottom('smooth');
    setIsLoading(true);

    const lowerCaseInput = userMessageText.toLowerCase();
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'wind', 'humidity'];
    const isWeatherQuery = weatherKeywords.some(keyword => lowerCaseInput.includes(keyword));

    try {
      let botResponseText = '';
      let geminiPrompt = '';

      if (isWeatherQuery) {
        const now = Date.now();
        if (lastWeather && (now - lastWeather.timestamp < WEATHER_CACHE_DURATION)) {
             geminiPrompt = `The user asked: "${userMessageText}". The current cached weather is: "${lastWeather.data}". Please answer the user's question based on this weather data. Format your response as a natural, conversational paragraph. Do not use markdown, bullet points, or asterisks.`;
            botResponseText = await askGemini(geminiPrompt);
        } else {
          try {
            const position = await getCurrentPosition();
            const weatherInfo = await getWeather(position.coords.latitude, position.coords.longitude);
            setLastWeather({ data: weatherInfo, timestamp: Date.now() });
            geminiPrompt = `The user asked: "${userMessageText}". The current weather is: "${weatherInfo}". Please answer the user's question based on this weather data. Format your response as a natural, conversational paragraph. Do not use markdown, bullet points, or asterisks.`;
            botResponseText = await askGemini(geminiPrompt);
          } catch (geoError: any)             {
             console.error("Geolocation error:", geoError);
             botResponseText = "I couldn't get your location to check the weather. Please ensure you've enabled location permissions for this site. I can still answer other questions.";
          }
        }
      } else {
        geminiPrompt = `The user asked: "${userMessageText}". Please answer the question. Format your response as a natural, conversational paragraph. Do not use markdown, bullet points, or asterisks.`;
        botResponseText = await askGemini(geminiPrompt);
      }
      
      setIsLoading(false);
      const botMessageId = nextId + 1;
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: 'bot', text: '' },
      ]);
      
      setIsTyping(true);
      let index = 0;
      typingIntervalRef.current = setInterval(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: botResponseText.substring(0, index + 1) }
              : msg
          )
        );
        index++;
        if (index >= botResponseText.length) {
          stopTyping();
        }
      }, TYPING_SPEED);

    } catch (error) {
      console.error("Error getting bot response:", error);
       setMessages((prev) => [...prev, { id: nextId + 1, sender: 'bot', text: "⚠️ Gemini API failed. Please try again." }]);
       setIsLoading(false);
       setIsTyping(false);
    }
  };

  useEffect(() => {
    return () => {
        if(typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
        }
    };
  }, []);

  return (
    <>
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Bot size={24} />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
              <Card className="shadow-2xl flex flex-col h-[600px] relative">
                <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                          <Bot size={20} />
                          <span>Rescue.AI Assistant</span>
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={handleNewChat} className="text-primary-foreground hover:bg-primary/80 h-7 w-7">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground md:hidden">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent ref={chatBodyRef} className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={cn(
                          'flex items-start gap-3',
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {message.sender === 'bot' && (
                          <div className="bg-muted text-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                             <Bot size={16} />
                          </div>
                        )}
                         <div
                          className={cn(
                            'p-3 rounded-xl max-w-[80%] whitespace-pre-wrap',
                             message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </motion.div>
                    ))}
                     {isLoading && !isTyping && (
                      <motion.div 
                        className="flex items-start gap-3 justify-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                           <div className="bg-muted text-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                             <Bot size={16} />
                          </div>
                          <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
                              <p className="text-sm italic">Thinking...</p>
                          </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>

                <AnimatePresence>
                    {showScrollDown && (
                        <motion.div
                            className="absolute bottom-24 right-4"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Button onClick={() => scrollToBottom('smooth')} size="icon" className="rounded-full shadow-lg">
                                <ArrowDown size={18} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <CardFooter className="border-t pt-4">
                   <div className="flex w-full items-center space-x-2">
                      <Input
                          type="text"
                          placeholder="Ask about disasters or weather..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !isLoading && !isTyping && handleSendMessage()}
                          disabled={isLoading || isTyping}
                          className="flex-1 rounded-full px-4"
                      />
                       <AnimatePresence mode="wait">
                        {isTyping ? (
                          <motion.div
                            key="stop"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              onClick={stopTyping}
                              variant="destructive"
                              className="rounded-full"
                            >
                              <Square size={16} className="mr-2" />
                              Stop
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="send"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              onClick={handleSendMessage}
                              disabled={isLoading || !inputValue.trim()}
                              className="rounded-full"
                            >
                              <Send size={16} />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </div>
                </CardFooter>
              </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const ChatBot = memo(ChatBotComponent);
