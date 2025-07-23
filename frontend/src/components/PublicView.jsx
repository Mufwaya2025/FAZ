import React, { useState, useEffect } from 'react';
import PublicMatchDetails from './PublicMatchDetails';

function PublicView() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/matches');
        const data = await response.json();
        if (response.ok) {
          setMatches(data);
        } else {
          console.error('Failed to fetch matches:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
  }, []);

  const filters = ['ALL', 'LIVE', 'FINISHED', 'SCHEDULED'];
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.match_date);
    const isToday = matchDate.toDateString() === currentDate.toDateString();
    if (!isToday) return false;
    if (activeFilter === 'ALL') return true;
    return match.status === activeFilter;
  });

  if (selectedMatch) {
    return <PublicMatchDetails match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  return (
    <React.Fragment>
      <div style={{ 
        display: 'flex',
        gap: '0px',
        marginBottom: '20px',
        backgroundColor: '#34495e',
        borderRadius: '8px',
        padding: '4px'
      }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: activeFilter === filter ? '#3498db' : 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
        backgroundColor: '#34495e',
        padding: '12px',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => navigateDate(-1)}
          style={{
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ←
        </button>
        <span style={{ 
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {formatDate(currentDate)}
        </span>
        <button
          onClick={() => navigateDate(1)}
          style={{
            backgroundColor: '#4a5568',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          →
        </button>
      </div>

      {filteredMatches.length === 0 ? (
        <div style={{
          backgroundColor: '#34495e',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#95a5a6'
        }}>
          No matches found for the selected criteria.
        </div>
      ) : (
        filteredMatches.map(match => (
          <div key={match.id} onClick={() => setSelectedMatch(match)} style={{
            backgroundColor: '#34495e',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer'
          }}>
            {match.home_team_name} vs {match.away_team_name}
          </div>
        ))
      )}
    </React.Fragment>
  );
}

export default PublicView;
