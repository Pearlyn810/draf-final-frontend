import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ChatMessage, CampusEvent } from '../types/index.ts';
import { EventCard } from '../components/common/EventCard.tsx';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Compass,
  RefreshCw,
  Info,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Kegiatan terdekat dari sekarang apa?',
  'Ada kegiatan apa minggu ini?',
  'Cari kegiatan choir bulan ini',
  'Jadwal ibadah Sabbath dan pengecekan long weekend',
  'Kapan Ujian Akhir Semester (UAS) I 2026/2027?',
  'Meeting rutin organisasi apa saja di hari Kamis?',
];

export const AssistantPage: React.FC = () => {
  const { currentUser, events } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Halo! Saya UNKLAB Campus Assistant. Tanyakan apa saja tentang kalender akademik resmi, jadwal perkuliahan, ibadah asrama (Midweek, Vesper, Sabbath), kegiatan choir, maupun meeting organisasi kampus. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          userRole: currentUser?.role || 'mahasiswa',
          userInterests: currentUser?.interests || [],
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Maaf, saya tidak dapat menemukan informasi terkait.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedEventIds: data.referencedEventIds || [],
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Terjadi kendala saat menghubungi asisten AI. Silakan coba kembali atau gunakan pencarian manual pada menu Kalender / Jelajahi Acara.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-140px)]">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-[#E9E4EC] p-4 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F1EBF5] flex items-center justify-center text-[#402155]">
            <Sparkles className="w-5 h-5 text-[#D9B85F]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#29242E]">AI Campus Assistant</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                Gemini 3.8 Flash Active
              </span>
            </div>
            <p className="text-xs text-[#706A75]">
              Asisten resmi pencarian agenda kampus terpadu Universitas Klabat
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-welcome',
                sender: 'assistant',
                text: 'Percakapan telah diatur ulang. Ada agenda kampus yang ingin Anda tanyakan?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Mulai Ulang Percakapan"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-[#E9E4EC] p-4 sm:p-6 overflow-y-auto space-y-5 shadow-xs">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const referencedEvents = (msg.referencedEventIds || [])
            .map(id => events.find(e => e.id === id))
            .filter((e): e is CampusEvent => !!e);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#1B4D36] text-white'
                    : 'bg-[#EDF6F1] text-[#1B4D36] border border-[#D5E5DC]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-[#1B4D36]" />}
              </div>

              {/* Message Bubble & Cards */}
              <div className={`space-y-2.5 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1B4D36] text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-[#15261E] border border-[#E1ECE5] rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Referenced Event Cards Grounding */}
                {!isUser && referencedEvents.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-semibold text-[#80639A] uppercase tracking-wider flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      Kegiatan Terkait Dari Database Kampus:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {referencedEvents.map(ev => (
                        <EventCard key={ev.id} event={ev} isCompact />
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`text-[10px] text-gray-400 block px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F1EBF5] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#402155] animate-spin" />
            </div>
            <div className="p-3.5 bg-[#FAF9FB] rounded-2xl border border-[#E9E4EC] text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#402155] animate-ping" />
              <span>Memeriksa jadwal kalender akademik dan database kampus...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-[#52675C]">
          <Sparkles className="w-3 h-3 text-[#D4A338]" />
          <span>Saran pertanyaan cepat:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 text-xs bg-white text-[#15261E] hover:text-[#1B4D36] hover:bg-[#EDF6F1] border border-[#E1ECE5] rounded-md whitespace-nowrap transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white rounded-xl border border-[#E1ECE5] p-2 flex items-center gap-2 shadow-xs shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tanyakan jadwal ujian, ibadah asrama, choir, atau meeting organisasi..."
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-[#15261E]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-[#1B4D36] text-white rounded-lg hover:bg-[#143D2A] disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
          aria-label="Kirim pertanyaan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
