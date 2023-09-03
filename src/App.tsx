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
    adjustHeight();
  }, []);

  const handleSubmit = async () => {
    const startTime = new Date();

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/', {
        user_prompt: userPrompt,
      });
      setGeneratedResult(response.data.generated_result);
      setChatLogs(response.data.chat_logs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`API call took ${duration} ms`);
  };

  const handleClearChat = async () => {
    await axios.post('http://localhost:8000/clear_chat');
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
      {generatedResult && <div className="response">Response: {generatedResult}</div>}
      <div className="chat-history">
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