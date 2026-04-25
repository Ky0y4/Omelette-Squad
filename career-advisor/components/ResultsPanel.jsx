'use client';

import React, { useState, useEffect } from 'react';
import './ResultsPanel.css';

export default function ResultsPanel({ results }) {
  if (!results || !results.top_careers) {
    return (
      <div className="results-error">
        <h3>No results available</h3>
        <p>Please try submitting your profile again.</p>
      </div>
    );
  }

  const { top_careers, summary } = results;

  return (
    <div className="results-panel">
      <div className="results-header">
        <h2>Your Career Analysis Results</h2>
        <div className="summary">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      </div>

      <div className="careers-section">
        <h3>Top Career Recommendations</h3>
        <div className="careers-grid">
          {top_careers.map((career, index) => (
            <CareerCard
              key={career.role}
              career={career}
              rank={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CareerCard({ career, rank }) {
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    // Set the score width after component mounts to avoid hydration mismatch
    setScoreWidth(career.match_score || 0);
  }, [career.match_score]);

  const medal = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `#${rank}`;

  return (
    <div className="career-card">
      <div className="card-header">
        <div className="rank-badge">
          <span className="medal">{medal}</span>
          <span className="rank-text">#{rank}</span>
        </div>
        <h4>{career.role}</h4>
        <div className="match-score">
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${scoreWidth}%`, transition: 'width 0.8s ease' }}
            ></div>
          </div>
          <span className="score-text">{career.match_score}% Match</span>
        </div>
      </div>

      <div className="card-content">
        <div className="section">
          <h5>Why It Fits</h5>
          <p>{career.why_it_fits}</p>
        </div>

        <div className="section">
          <h5>Trade-offs</h5>
          <p>{career.trade_offs}</p>
        </div>

        <div className="section">
          <h5>Next Steps</h5>
          <div className="next-steps">
            {career.next_steps?.split('\n').map((step, index) => (
              <div key={index} className="step">
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="section insight-section">
          <h5>Market Reality</h5>
          <p>{career.market_reality}</p>
        </div>

        <div className="section insight-section">
          <h5>Economic Forecast</h5>
          <p>{career.economic_forecast}</p>
        </div>

        <div className="section insight-section">
          <h5>Optimization Strategy</h5>
          <p>{career.optimization_strategy}</p>
        </div>

        <div className="section insight-section">
          <h5>Decision Impact</h5>
          <p>{career.decision_impact}</p>
        </div>
      </div>
    </div>
  );
}
