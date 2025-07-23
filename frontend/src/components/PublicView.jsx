import React, { useState, useEffect } from 'react';
import PublicMatchDetails from './PublicMatchDetails';
import StandingsView from './StandingsView';
import ScoreCard from './ScoreCard';
import './PublicView.css';

function PublicView() {
  const [activeTab, setActiveTab] = useState('SCORES');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('');

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
    const fetchLeagues = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/v1/leagues', {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setLeagues(data);
          if (data.length > 0) {
            setSelectedLeague(data[0].id);
          }
        } else {
          console.error('Failed to fetch leagues:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };
    fetchMatches();
    fetchLeagues();
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
    <div className="public-view-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('SCORES')} className={`tab-button ${activeTab === 'SCORES' ? 'active' : ''}`}>Scores</button>
        <button onClick={() => setActiveTab('STANDINGS')} className={`tab-button ${activeTab === 'STANDINGS' ? 'active' : ''}`}>Standings</button>
      </div>

      {activeTab === 'SCORES' && (
        <>
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="date-navigation">
            <button onClick={() => navigateDate(-1)} className="nav-button">←</button>
            <span className="date-display">{formatDate(currentDate)}</span>
            <button onClick={() => navigateDate(1)} className="nav-button">→</button>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="no-matches">
              No matches found for the selected criteria.
            </div>
          ) : (
            filteredMatches.map(match => (
              <ScoreCard key={match.id} match={match} onClick={setSelectedMatch} />
            ))
          )}
        </>
      )}

      {activeTab === 'STANDINGS' && (
        <div>
          <select onChange={(e) => setSelectedLeague(e.target.value)} value={selectedLeague} className="league-select">
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
          <StandingsView leagueId={selectedLeague} />
        </div>
      )}
    </div>
  );
}

export default PublicView;