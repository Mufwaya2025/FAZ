import React, { useState } from 'react';
import './GoalScorerModal.css';

function GoalScorerModal({ isOpen, onClose, teamName, players, onSubmit }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isOwnGoal, setIsOwnGoal] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedPlayer) {
      alert('Please select a player.');
      return;
    }
    onSubmit(selectedPlayer, isOwnGoal);
  };

  return (
    <div className="modal-overlay">
      <div className="goal-modal-content">
        <h3 className="modal-title">Add Goal Scorer</h3>
        <p className="modal-team-name">{teamName}</p>
        
        <div className="form-group">
          <label htmlFor="player-select">Scorer</label>
          <select 
            id="player-select"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="player-select"
          >
            <option value="" disabled>Select a player...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group-checkbox">
          <input 
            type="checkbox" 
            id="own-goal-checkbox" 
            checked={isOwnGoal}
            onChange={(e) => setIsOwnGoal(e.target.checked)}
            className="own-goal-checkbox"
          />
          <label htmlFor="own-goal-checkbox" className="own-goal-label">
            <span className="checkbox-custom"></span>
            Own Goal
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-button cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="modal-button confirm-button">Confirm Goal</button>
        </div>
      </div>
    </div>
  );
}

export default GoalScorerModal;
