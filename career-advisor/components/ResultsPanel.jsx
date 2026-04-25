'use client';

import { useState, useEffect } from 'react';
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
      <div className="results-summary">
        <p className="label">Analysis complete</p>
        <h2>Your career recommendations</h2>
        {summary && <p>{summary}</p>}
      </div>

      <div>
        <h3 className="section-heading">Top {top_careers.length} matches</h3>
        <div className="careers-grid">
          {top_careers.map((career, index) => (
            <CareerCard key={career.role || index} career={career} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CareerCard({ career, rank }) {
  const [scoreWidth, setScoreWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setScoreWidth(career.match_score || 0), 120);
    return () => clearTimeout(t);
  }, [career.match_score]);

  const rankLabel = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `#${rank}`;
  const rankClass = rank <= 2 ? `rank-${rank}` : '';

  const nextSteps = career.next_steps
    ? career.next_steps.split('\n').filter(Boolean)
    : [];

  return (
    <div className="career-card">
      <div className="card-header">
        <div className={`rank-badge ${rankClass}`}>{rankLabel}</div>
        <div className="card-header-text">
          <h4>{career.role}</h4>
          <div className="match-score">
            <div className="score-track">
              <div className="score-fill" style={{ width: `${scoreWidth}%` }} />
            </div>
            <span className="score-label">{career.match_score}% match</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          {career.why_it_fits && (
            <div className="info-block">
              <h5>Why it fits</h5>
              <p>{career.why_it_fits}</p>
            </div>
          )}
          {career.trade_offs && (
            <div className="info-block">
              <h5>Trade-offs</h5>
              <p>{career.trade_offs}</p>
            </div>
          )}
        </div>

        {nextSteps.length > 0 && (
          <div>
            <div className="info-block">
              <h5>Next steps</h5>
              <div className="next-steps-list">
                {nextSteps.map((step, i) => (
                  <div className="step-item" key={i}>
                    <div className="step-dot" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="insights-grid">
          {career.market_reality && (
            <div className="insight-block">
              <h5>Market reality</h5>
              <p>{career.market_reality}</p>
            </div>
          )}
          {career.economic_forecast && (
            <div className="insight-block">
              <h5>Economic forecast</h5>
              <p>{career.economic_forecast}</p>
            </div>
          )}
          {career.optimization_strategy && (
            <div className="insight-block">
              <h5>Optimization strategy</h5>
              <p>{career.optimization_strategy}</p>
            </div>
          )}
          {career.decision_impact && (
            <div className="insight-block">
              <h5>Decision impact</h5>
              <p>{career.decision_impact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
