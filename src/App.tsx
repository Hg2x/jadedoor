// npm start
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [chatLogs, setChatLogs] = useState<ChatLogs>([]);
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
    const fetchChatLogs = async () => {
      try {
        const response = await axios.get(backendUrl + '/get_chat_logs');
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
      const response = await axios.post(backendUrl, {
        user_prompt: userPrompt,
      });
      setGeneratedResult(response.data.generated_result);
      setChatLogs(response.data.chat_logs);
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
    await axios.post(backendUrl + '/clear_chat');
    setGeneratedResult(null);
    setChatLogs([]);
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
        <button onClick={handleClearChat}>
          Clear Chat History
        </button>
      </div>
      <div className="chat-history" ref={chatHistoryRef}>
          {chatLogs.map((log, index) => (
              <div key={index} className={`chat-log ${log.role}`}>
                  <strong>{log.role}:</strong> {log.content}
              </div>
          ))}
      </div>
      {isLoading && <div>Loading...</div>}
    </div>
  );
};

export default App;