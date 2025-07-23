import React from 'react';
import './ScoreCard.css';

function ScoreCard({ match, onClick }) {
  return (
    <div className="score-card-container" onClick={() => onClick(match)}>
      <div className="team-info">
        <img src={match.home_team_logo || 'https://via.placeholder.com/40'} alt={match.home_team_name} />
        <span>{match.home_team_name}</span>
      </div>
      <div className="match-score-container">
        <span className="score">{match.home_score} - {match.away_score}</span>
        <span className="minute">{match.status === 'FINISHED' ? 'FT' : `${match.minute || 0}'`}</span>
      </div>
      <div className="team-info">
        <img src={match.away_team_logo || 'https://via.placeholder.com/40'} alt={match.away_team_name} />
        <span>{match.away_team_name}</span>
      </div>
    </div>
  );
}

export default ScoreCard;
