'use client';

import { AnalysisResult, CareerMatch } from '@/lib/types';

interface ResultsPanelProps {
  result: AnalysisResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  return (
    <div className="results-container">
      <div className="results-header">
        <h1> Your Career Recommendations</h1>
        <p className="summary">{result.summary}</p>
      </div>

      <div className="top-matches">
        <h2>💡 Top Career Matches</h2>
        <div className="matches-grid">
          {result.topMatches.map((match: CareerMatch, idx: number) => (
            <CareerCard key={match.id} match={match} rank={idx + 1} />
          ))}
        </div>
      </div>

      <div className="trade-off-section">
        <h2>⚖️ Trade-Off Analysis</h2>
        <div className="trade-off-content">
          {result.tradeOffAnalysis.split('\n').map((line: string, idx: number) => (
            line.trim() ? (
              <p key={idx} className={line.startsWith('**') ? 'bold' : ''}>
                {line.replace(/\*\*/g, '')}
              </p>
            ) : (
              <br key={idx} />
            )
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        <h2>📋 Next Steps</h2>
        <ul className="recommendations-list">
          {result.recommendations.map((rec: string, idx: number) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CareerCard({ match, rank }: { match: CareerMatch; rank: number }) {
  const rankEmojis = ['1', '2', '3'];
  
  return (
    <div className="career-card">
      <div className="card-header">
        <span className="rank">{rankEmojis[rank - 1] || `#${rank}`}</span>
        <h3>{match.title}</h3>
        <div className="match-score">
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${match.matchScore}%` }}
            ></div>
          </div>
          <span className="score-text">{match.matchScore}% Match</span>
        </div>
      </div>

      <div className="card-content">
        <div className="reasons">
          <h4>✓ Why This Fits:</h4>
          <ul>
            {match.matchReasons.map((reason: string, idx: number) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="strengths">
          <h4>💪 Your Strengths:</h4>
          <ul>
            {match.strengths.map((strength: string, idx: number) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="improvements">
          <h4>📈 Areas to Improve:</h4>
          <ul>
            {match.areasForImprovement.map((area: string, idx: number) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>

        <div className="steps">
          <h4>🎯 Recommended Steps:</h4>
          <ol>
            {match.nextSteps.map((step: string, idx: number) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
