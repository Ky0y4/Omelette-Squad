'use client';

import { useState } from 'react';
import UserForm from '@/components/UserForm';
import ResultsPanel from '@/components/ResultsPanel';

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (userProfile) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1> Omelette Squad Career Decision Intelligence Advisor</h1>
        <p>Discover your ideal career path with AI-powered insights</p>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-message">
            <h3> Error</h3>
            <p>{error}</p>
            <button onClick={handleReset} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your career profile...</p>
            <p className="loading-subtitle">This may take a few seconds</p>
          </div>
        )}

        {!isLoading && !results && !error && (
          <div className="form-section">
            <UserForm onAnalyze={handleAnalyze} />
          </div>
        )}

        {results && !isLoading && (
          <div className="results-section">
            <button onClick={handleReset} className="back-btn">
              ← New Analysis
            </button>
            <ResultsPanel results={results} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p> Career Intelligence Advisor • Hackathon 2026</p>
      </footer>
    </div>
  );
}
