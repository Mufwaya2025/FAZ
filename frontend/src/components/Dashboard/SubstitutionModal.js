import React, { useState } from 'react';
import './SubstitutionModal.css';

function SubstitutionModal({ isOpen, onClose, teamName, players, onSubmit }) {
  const [playerOut, setPlayerOut] = useState('');
  const [playerIn, setPlayerIn] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!playerOut || !playerIn) {
      alert('Please select both players.');
      return;
    }
    if (playerOut === playerIn) {
      alert('Cannot substitute a player for themselves.');
      return;
    }
    onSubmit(playerOut, playerIn);
  };

  return (
    <div className="modal-overlay">
      <div className="sub-modal-content">
        <h3 className="modal-title">Record Substitution</h3>
        <p className="modal-team-name">{teamName}</p>
        
        <div className="form-group">
          <label htmlFor="player-out-select">Player Out</label>
          <select 
            id="player-out-select"
            value={playerOut}
            onChange={(e) => setPlayerOut(e.target.value)}
            className="player-select"
          >
            <option value="" disabled>Select player leaving...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="player-in-select">Player In</label>
          <select 
            id="player-in-select"
            value={playerIn}
            onChange={(e) => setPlayerIn(e.target.value)}
            className="player-select"
          >
            <option value="" disabled>Select player entering...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-button cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="modal-button confirm-button">Confirm Sub</button>
        </div>
      </div>
    </div>
  );
}

export default SubstitutionModal;
