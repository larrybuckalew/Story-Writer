/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai';
import {useState} from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateStory = async () => {
    if (!prompt) {
      setError('Please enter a prompt to start your story.');
      return;
    }
    
    setIsLoading(true);
    setStory('');
    setError('');

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a creative and engaging storyteller for all ages. Write a short story based on the user\'s prompt.',
        }
      });

      let currentStory = '';
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          currentStory += text;
          setStory(currentStory);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while writing the story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Story Writer</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A shy dragon who loves to bake..."
        aria-label="Story prompt"
        disabled={isLoading}
      />
      <button onClick={handleGenerateStory} disabled={isLoading}>
        {isLoading ? 'Writing...' : 'Generate Story'}
      </button>

      {error && <p className="error">{error}</p>}
      
      <div className="story-container" aria-live="polite">
        {isLoading && !story && <p className="loading">Your story will appear here...</p>}
        {story || ''}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
