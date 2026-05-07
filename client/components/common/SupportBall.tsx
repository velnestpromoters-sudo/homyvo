"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, PhoneCall, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SupportBall() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string}[]>([
    { sender: 'bot', text: 'Hi there! 👋 How can we help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
       chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) < 5 && Math.abs(info.offset.y) < 5) {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    
    // Simulate bot reply
    setTimeout(() => {
       setMessages(prev => [...prev, { 
         sender: 'bot', 
         text: "Thanks for reaching out! We are connecting you with an agent. For immediate assistance, please call the number above." 
       }]);
    }, 1000);
  };

  const supportNumber = "63692 69611";
  
  const supportTitle = user?.role === 'owner' 
    ? 'Owner & Tenant Support' 
    : user?.role === 'tenant' 
      ? 'Tenant Support' 
      : 'Customer Support';

  return (
    <>
      <motion.div
        drag
        dragConstraints={mounted ? { left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 } : { left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-[90px] right-6 z-[999] w-12 h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform ${mounted ? 'visible' : 'invisible'}`}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6 text-[#ec38b7]" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[160px] right-6 z-[998] w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[500px]"
          >
            <div className="bg-gradient-to-r from-[#ec38b7] to-[#801786] p-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-white">{supportTitle}</h3>
                <p className="text-white/80 text-xs font-medium">We're here to help you.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Call Banner */}
            <div className="px-5 pt-4 pb-2 shrink-0">
              <a 
                href={`tel:+916369269611`}
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">Urgent? Call Us Now</p>
                  <p className="font-black text-gray-900">+91 {supportNumber}</p>
                </div>
              </a>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3 min-h-[150px]" style={{ scrollbarWidth: 'thin' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#801786] text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
               <form 
                 onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                 className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:border-[#ec38b7] transition-colors"
               >
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-3 text-sm outline-none text-slate-800"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-full bg-[#ec38b7] disabled:bg-slate-300 text-white flex items-center justify-center transition-colors"
                  >
                     <Send className="w-4 h-4 ml-0.5" />
                  </button>
               </form>
               <p className="text-[9px] text-gray-400 text-center font-medium mt-2">
                 Powered by Homyvo Assistant
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
