// npm start
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [chatLogs, setChatLogs] = useState<ChatLogs>([]);
  const [promptTokens, setPromptTokens] = useState<number | null>(null);
  const [completionTokens, setCompletionTokens] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL as string;
  const apiKey = process.env.REACT_APP_API_KEY as string;

  type ChatLog = {
    role: 'user' | 'system' | 'assistant';
    content: string;
  }
  type ChatLogs = ChatLog[];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
    adjustHeight();
  };

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (!process.env.REACT_APP_BACKEND_URL) {
      throw new Error("REACT_APP_BACKEND_URL is not set!");
    }
    const fetchChatLogs = async () => {
      try {
        const response = await axios.get(backendUrl + '/chat_logs');
        setChatLogs(response.data.chat_logs);
      } catch (error) {
        console.error('Error fetching chat logs:', error); // TODO: display error to user
      }
    };
    fetchChatLogs();
    adjustHeight();
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
        const element = chatHistoryRef.current;
        element.scrollTop = element.scrollHeight;
    }
  }, [chatLogs]);

  const handleSubmit = async () => {
    const startTime = new Date();

    setIsLoading(true);
    try {
      const response = await axios.post(backendUrl + '/generate_reply', {
        user_prompt: userPrompt,
        model: selectedModel,
      });
      setChatLogs(response.data.chat_logs);
      setPromptTokens(response.data.prompt_tokens);
      setCompletionTokens(response.data.completion_tokens);
    } catch (error) {
      console.error('Error fetching data:', error); // TODO: display error to user
    } finally {
      setIsLoading(false);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`API call took ${duration} ms`);
  };

  const handleClearChat = async () => {
    await axios.delete(backendUrl + '/chat_logs');
    setChatLogs([]);
  };

  const clearInput = () => {
    setUserPrompt('');
  };

  const toggleModel = () => {
    setSelectedModel(prev => prev === 'gpt-3.5-turbo' ? 'gpt-4' : 'gpt-3.5-turbo');
  };

  return (
    <div className="app-container">
        <div className="input-area">
        <textarea
          ref={textAreaRef}
          className="input-field autoExpand"
          value={userPrompt}
          onChange={handleInputChange}
          placeholder="Enter your prompt"
          rows={1}
        />
        <button className="generate-btn" onClick={handleSubmit}>
          Generate Reply
        </button>
        <button onClick={clearInput}>
          Clear Input
        </button>
        <button onClick={handleClearChat}>
          Clear Chat History
        </button>
      </div>
      <div className={`loading-container ${isLoading ? '' : 'hidden'}`}>
          Loading...
      </div>
      <div className="token-info">
        <div><strong>Prompt Tokens:</strong> {promptTokens}</div>
        <div><strong>Completion Tokens:</strong> {completionTokens}</div>
        <button onClick={toggleModel}>
          Toggle Model (Current: {selectedModel})
        </button>
      </div>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatLogs.map((log, index) => (
          <div key={index} className={`chat-log ${log.role}`}>
            <strong>{log.role}:</strong>
            <pre className="chat-content">{log.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;