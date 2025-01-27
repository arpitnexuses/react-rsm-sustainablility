'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const funFacts = [
    "Did you know? The concept of ESG was first introduced in a 2004 United Nations report titled 'Who Cares Wins'.",
    "Fun fact: The first global ESG index was launched by the Dow Jones in 1999.",
    "Interesting tidbit: More than 80% of the world's largest companies now report on ESG metrics.",
    // ... add all fun facts here
  ];

  const actionButtons = [
    {
      icon: "book-open",
      text: "IFRS S1: General Requirements"
    },
    {
      icon: "cloud-sun",
      text: "IFRS S2: Climate related Disclosures"
    },
    {
      icon: "chart-line",
      text: "Key insights about IFRS S1 & S2"
    }
  ];

  const formatMessage = (message: string) => {
    return message
      .replace(/###\s*(.*?)\s*(\n|$)/g, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 rounded px-1">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre><code class="block bg-gray-100 rounded p-2 my-2">$1</code></pre>')
      .replace(/\n/g, '<br>');
  };

  const sendMessage = async (text: string = inputMessage) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      content: text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        content: data.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        content: "Sorry, there was an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = Math.floor(Math.random() * (4000 - 3000 + 1) + 3000);
    const timer = setTimeout(() => {
      setMessages([{
        content: "Welcome to RSM's - I'm here to help you with questions about IFRS S1 & S2 for GCC Businesses.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg custom-shadow w-full max-w-4xl p-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="https://cdn-nexlink.s3.us-east-2.amazonaws.com/rsm-international-vector-logo_2_eb7fb9d1-228a-426a-b682-c0d24dc736fa.jpg"
            alt="RSM Logo"
            width={200}
            height={64}
            className="h-16 w-auto"
          />
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold mb-2">Hi Dear, <span className="text-green-600">Reader</span></h1>
        <h2 className="text-2xl text-green-600 mb-2">Welcome to RSM's - IFRS S1 & S2 for GCC Businesses.</h2>
        <p className="text-gray-600 mb-6">Use one of the most common prompts below or use your own to begin</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link
            href="https://cdn-nexlink.s3.us-east-2.amazonaws.com/RSM_IFRS_Newsletter_compressed_60b4b697-ac77-4c14-9942-d40e68e3a645.pdf"
            target="_blank"
            className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <i className="fas fa-download text-gray-600"></i>
            <span>Download Newsletter</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <i className="fas fa-envelope text-gray-600"></i>
              <span>Book an Appointment with RSM Team</span>
              <i className="fas fa-chevron-down ml-2"></i>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu">
                  <Link
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=deepali.singh@rsm.com.kw&su=Appointment Request with RSM Team"
                    target="_blank"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <i className="fab fa-google mr-2"></i> Gmail
                  </Link>
                  <Link
                    href="https://outlook.office.com/mail/deeplink/compose?to=deepali.singh@rsm.com.kw&subject=Appointment%20Request%20with%20RSM%20Team"
                    target="_blank"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <i className="fab fa-microsoft mr-2"></i> Outlook
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => sendMessage(button.text)}
              className="gradient-btn flex items-center justify-center space-x-2 p-4 text-center"
            >
              <i className={`fas fa-${button.icon}`}></i>
              <span>{button.text}</span>
            </button>
          ))}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div ref={chatContainerRef} className="chat-container p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block ${msg.isUser ? 'bg-green-100' : 'bg-gray-100'} rounded-lg px-4 py-2 max-w-[70%]`}>
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: msg.isUser ? msg.content : formatMessage(msg.content) }}
                  />
                  <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="loader-container">
                <div className="loader"></div>
                <div className="loader-text">
                  Thinking<span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about RSM Sustainability..."
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={1000}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {inputMessage.length}/1000
              </span>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
