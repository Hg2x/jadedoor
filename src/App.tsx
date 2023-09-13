import React, { useRef, useEffect, useState, ChangeEvent, FC } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const MODELS = ['gpt-3.5-turbo', 'gpt-4'] as const;

type ChatLog = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

type ChatLogs = ChatLog[];

const App: FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState<ChatLogs>([]);
  const [promptTokens, setPromptTokens] = useState<number | null>(null);
  const [completionTokens, setCompletionTokens] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<typeof MODELS[number]>(MODELS[0]);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchChatLogs = async () => {
      try {
        const response = await axios.get(BACKEND_URL + '/chat_logs');
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

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(e.target.value);
    adjustHeight();
  };

  const handleSubmit = async () => {
    const startTime = new Date();

    setIsLoading(true);
    try {
      const response = await axios.post(BACKEND_URL + '/generate_reply', {
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
    await axios.delete(BACKEND_URL + '/chat_logs');
    setChatLogs([]);
  };

  const adjustHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  };

  const clearInput = () => {
    setUserPrompt('');
    setTimeout(adjustHeight, 0);
  };

  const toggleModel = () => {
    setSelectedModel(prev => (prev === 'gpt-3.5-turbo' ? 'gpt-4' : 'gpt-3.5-turbo'));
  };

  return (
    <div className="app-container">
      <InputArea 
        onInputChange={handleInputChange} 
        onGenerateClick={handleSubmit}
        onClearInputClick={clearInput}
        userPrompt={userPrompt}
        textAreaRef={textAreaRef}
        onClearChatClick={handleClearChat}
      />
      <LoadingArea isLoading={isLoading} />
      <TokenInfo 
        promptTokens={promptTokens} 
        completionTokens={completionTokens} 
        onToggleModelClick={toggleModel} 
        selectedModel={selectedModel} 
      />
      <ChatHistory chatLogs={chatLogs} chatHistoryRef={chatHistoryRef} />
    </div>
  );
};

interface InputAreaProps {
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerateClick: () => void;
  onClearInputClick: () => void;
  userPrompt: string;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onClearChatClick: () => void;
}
const InputArea: FC<InputAreaProps> = ({
  onInputChange,
  onGenerateClick,
  onClearInputClick,
  userPrompt,
  textAreaRef,
  onClearChatClick,
}) => {
  return (
    <div className="input-area">
      <textarea
        ref={textAreaRef}
        value={userPrompt}
        onChange={onInputChange}
        className="input-area"
      />
      <button onClick={onGenerateClick} className="generate-btn">
        Generate
      </button>
      <button onClick={onClearInputClick}>
        Clear Input
      </button>
      <button onClick={onClearChatClick}>
        Clear Chat
      </button>
    </div>
  );
};

interface LoadingAreaProps {
  isLoading: boolean;
}
const LoadingArea: FC<LoadingAreaProps> = ({ isLoading }) => {
  return (
    <div className={`loading-container ${isLoading ? '' : 'hidden'}`}>
      Loading...
    </div>
  );
};

interface TokenInfoProps {
  promptTokens: number | null;
  completionTokens: number | null;
  onToggleModelClick: () => void;
  selectedModel: typeof MODELS[number];
}
const TokenInfo: FC<TokenInfoProps> = ({
  promptTokens,
  completionTokens,
  onToggleModelClick,
  selectedModel,
}) => {
  return (
    <div className="token-info">
      <div>
        <span>Prompt Tokens: {promptTokens !== null ? promptTokens : 'N/A'}</span>
      </div>
      <div>
        <span>Completion Tokens: {completionTokens !== null ? completionTokens : 'N/A'}</span>
      </div>
      <div>
        <button onClick={onToggleModelClick}>
          Toggle Model (Current: {selectedModel})
        </button>
      </div>
    </div>
  );
};

interface ChatHistoryProps {
  chatLogs: ChatLogs;
  chatHistoryRef: React.RefObject<HTMLDivElement>;
}
const ChatHistory: FC<ChatHistoryProps> = ({ chatLogs, chatHistoryRef }) => {
  return (
    <div className="chat-history" ref={chatHistoryRef}>
      {chatLogs.map((log, index) => (
        <ChatLogComponent key={index} log={log} />
      ))}
    </div>
  );
};

interface ChatLogComponentProps {
  log: ChatLog;
}
const ChatLogComponent: FC<ChatLogComponentProps> = ({ log }) => {
  return (
    <div className={`chat-log ${log.role}`}>
      <strong>{log.role}:</strong>
      <pre className="chat-content">{log.content}</pre>
    </div>
  );
};

export default App;