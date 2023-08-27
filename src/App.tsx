// npm start
import React, { useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/', {
        user_prompt: userPrompt,
      });
      setGeneratedResult(response.data.generated_result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={userPrompt}
        onChange={handleInputChange}
        placeholder="Enter your prompt"
      />
      <button onClick={handleSubmit}>Generate Reply</button>
      {generatedResult && <div>Response: {generatedResult}</div>}
    </div>
  );
};

export default App;