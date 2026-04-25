"use client";

import { useState } from "react";
import UserForm from "@/components/UserForm";
import ResultsPanel from "@/components/ResultsPanel";
import "./page.css";

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (userProfile) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("description", userProfile.description);
      formData.append("timestamp", userProfile.timestamp);

      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let detail = "The analysis server returned an error.";
        try {
          const errData = await response.json();
          detail = errData?.detail || detail;
        } catch {
          // Ignore JSON parsing errors and keep fallback message.
        }
        throw new Error(detail);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || "Could not reach the server. Check if Python is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setIsLoading(false);
  };

  const showForm = !isLoading && !results && !error;

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22c4.418 0 8-3.582 8-8a8.5 8.5 0 0 0-1.226-4.226C16.924 5.253 14.394 2 12 2s-4.924 3.253-6.774 7.774A8.5 8.5 0 0 0 4 14c0 4.418 3.582 8 8 8Z"/>
            </svg>
          </div>
          <span className="logo-text">Employment Guidance Generator (E.G.G)</span>
        </div>
        <span className="header-badge">UM Hackathon 2026</span>
      </header>

      <main className="main-content">
        {showForm && (
          <>
            <div className="page-hero">
              <h1>Find your <em>ideal</em> career path</h1>
              <p>Answer five quick questions and get AI-powered recommendations tailored to your skills, goals, and market realities.</p>
            </div>
            <div className="form-section">
              <UserForm onAnalyze={handleAnalyze} />
            </div>
          </>
        )}

        {isLoading && (
          <div className="loading-state">
            <div className="loading-ring"></div>
            <h3>Analysing your profile&hellip;</h3>
            <p>This usually takes a few seconds</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={handleReset} className="retry-btn">Try again</button>
          </div>
        )}

        {results && !isLoading && (
          <div className="results-section">
            <div className="results-topbar">
              <button onClick={handleReset} className="back-btn">
                ← New analysis
              </button>
              <span className="results-label">Your results</span>
            </div>
            <ResultsPanel results={results} />
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p>Created by Omelette Squad</p>
      </footer>
    </div>
  );
}