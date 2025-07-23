import React, { useState } from 'react';
import './EventModal.css';

function EventModal({ isOpen, onClose, teamName, players, eventType, onSubmit }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedPlayer) {
      alert('Please select a player.');
      return;
    }
    onSubmit(selectedPlayer);
  };

  const getTitle = () => {
    switch (eventType) {
      case 'yellow_card':
        return 'Yellow Card';
      case 'red_card':
        return 'Red Card';
      case 'shot_on_target':
        return 'Shot on Target';
      case 'shot_off_target':
        return 'Shot off Target';
      case 'corner':
        return 'Corner';
      case 'foul':
        return 'Foul';
      case 'offside':
        return 'Offside';
      default:
        return 'Record Event';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="event-modal-content">
        <h3 className="modal-title">{getTitle()}</h3>
        <p className="modal-team-name">{teamName}</p>
        
        <div className="form-group">
          <label htmlFor="player-select">Player</label>
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

        <div className="modal-actions">
          <button onClick={onClose} className="modal-button cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="modal-button confirm-button">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
