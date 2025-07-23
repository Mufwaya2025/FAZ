import React, { useState, useEffect } from 'react';
import './PublicMatchDetails.css';
import { Shield, Star, CornerRightUp, RectangleVertical, RectangleHorizontal, X, Flag, ArrowRightLeft } from 'lucide-react';

function PublicMatchDetails({ match, onBack }) {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    const fetchCommentary = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/v1/matches/${match.id}/commentary`);
        const data = await response.json();
        if (response.ok) {
          setCommentary(data);
        } else {
          console.error('Failed to fetch commentary:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching commentary:', error);
      }
    };

    if (match.id) {
      fetchCommentary();
    }
  }, [match.id]);

  if (!match) {
    return null;
  }

  const {
    home_team_name,
    away_team_name,
    home_team_logo,
    away_team_logo,
    home_score,
    away_score,
    minute,
    status,
    goal_scorers = [],
    substitutions = [],
    home_possession_seconds = 0,
    away_possession_seconds = 0,
    home_shots = 0,
    away_shots = 0,
    home_shots_on_target = 0,
    away_shots_on_target = 0,
    home_corners = 0,
    away_corners = 0,
    home_fouls = 0,
    away_fouls = 0,
    home_yellow_cards = 0,
    away_yellow_cards = 0,
    home_red_cards = 0,
    away_red_cards = 0,
  } = match;

  const totalPossession = home_possession_seconds + away_possession_seconds;
  const homePossessionPercent = totalPossession > 0 ? Math.round((home_possession_seconds / totalPossession) * 100) : 50;
  const awayPossessionPercent = 100 - homePossessionPercent;

  const events = [
    ...goal_scorers.map(g => ({ ...g, type: 'goal', minute: g.minute_scored })),
    ...substitutions.map(s => ({ ...s, type: 'substitution', minute: s.minute_substituted })),
    ...(match.events || []).map(e => ({ ...e, type: e.event_type, minute: e.minute_of_event }))
  ].sort((a, b) => a.minute - b.minute);

  return (
    <div className="match-details-container">
      <button onClick={onBack} className="details-back-button">← Back to Scores</button>

      <header className="details-header">
        <div className="details-team">
          <img src={home_team_logo || 'https://via.placeholder.com/60'} alt={home_team_name} />
          <h2>{home_team_name}</h2>
        </div>
        <div className="details-score-info">
          <div className="details-minute">{status === 'FINISHED' ? 'FT' : `${minute}'`}</div>
          <div className="details-score">{home_score} - {away_score}</div>
        </div>
        <div className="details-team">
          <img src={away_team_logo || 'https://via.placeholder.com/60'} alt={away_team_name} />
          <h2>{away_team_name}</h2>
        </div>
      </header>

      <div className="stats-and-events">
        <div className="details-stats">
          <h3>Match Statistics</h3>
          <div className="stat-row">
            <span>{home_shots}</span>
            <span className="stat-label">Shots</span>
            <span>{away_shots}</span>
          </div>
          <div className="stat-row">
            <span>{home_shots_on_target}</span>
            <span className="stat-label">Shots on Target</span>
            <span>{away_shots_on_target}</span>
          </div>
          <div className="stat-row">
            <span>{homePossessionPercent}%</span>
            <span className="stat-label">Possession</span>
            <span>{awayPossessionPercent}%</span>
          </div>
          <div className="stat-row">
            <span>{home_fouls}</span>
            <span className="stat-label">Fouls</span>
            <span>{away_fouls}</span>
          </div>
          <div className="stat-row">
            <span>{home_yellow_cards}</span>
            <span className="stat-label">Yellow Cards</span>
            <span>{away_yellow_cards}</span>
          </div>
          <div className="stat-row">
            <span>{home_red_cards}</span>
            <span className="stat-label">Red Cards</span>
            <span>{away_red_cards}</span>
          </div>
          <div className="stat-row">
            <span>{home_corners}</span>
            <span className="stat-label">Corners</span>
            <span>{away_corners}</span>
          </div>
        </div>

        <div className="details-events">
          <h3>Match Events</h3>
          <ul className="event-timeline">
            {events.map(event => (
              <li key={`${event.type}-${event.id}`} className="event-item">
                <div className="event-minute">{event.minute}'</div>
                <div className="event-icon">
                  {event.type === 'goal' && <Star size={18} />}
                  {event.type === 'substitution' && <ArrowRightLeft size={18} />}
                  {event.type === 'yellow_card' && <RectangleVertical size={18} />}
                  {event.type === 'red_card' && <RectangleHorizontal size={18} />}
                  {event.type === 'shot_on_target' && <Shield size={18} />}
                  {event.type === 'shot_off_target' && <Shield size={18} />}
                  {event.type === 'corner' && <CornerRightUp size={18} />}
                  {event.type === 'foul' && <X size={18} />}
                  {event.type === 'offside' && <Flag size={18} />}
                </div>
                <div className="event-details">
                  {event.type === 'goal' && (
                    <span>Goal! <strong>{event.player_name}</strong> scores for {event.team_id === match.home_team_id ? home_team_name : away_team_name}.</span>
                  )}
                  {event.type === 'substitution' && (
                    <span>Substitution for {event.team_id === match.home_team_id ? home_team_name : away_team_name}: 
                      <strong className="player-in">{event.player_in_name}</strong> replaces <span className="player-out">{event.player_out_name}</span>.
                    </span>
                  )}
                  {event.type !== 'goal' && event.type !== 'substitution' && (
                    <span>{event.event_type.replace('_', ' ')} by <strong>{event.player_name}</strong>.</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="details-commentary">
        <h3>Live Commentary</h3>
        <ul className="commentary-timeline">
          {commentary.map(comment => (
            <li key={comment.id} className="commentary-item-public">
              <div className="commentary-minute">{comment.minute}'</div>
              <div className="commentary-text">{comment.commentary_text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PublicMatchDetails;