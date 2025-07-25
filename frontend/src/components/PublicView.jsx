import React, { useState, useEffect } from 'react';
import PublicMatchDetails from './PublicMatchDetails';
import StandingsView from './StandingsView';
import ScoreCard from './ScoreCard';
import './PublicView.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function PublicView() {
  const [activeTab, setActiveTab] = useState('SCORES');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/matches');
        const data = await response.json();
        if (response.ok) {
          console.log("Fetched matches in PublicView:", data); // Debugging line
          setMatches(data);
        } else {
          console.error('Failed to fetch matches:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/teams');
        const data = await response.json();
        if (response.ok) {
          setTeams(data);
        } else {
          console.error('Failed to fetch teams:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    const fetchLeagues = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/leagues');
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
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/v1/events');
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        } else {
          console.error('Failed to fetch events:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchMatches();
    fetchTeams();
    fetchLeagues();
    fetchEvents();

    socket.on('match_updated', (updatedMatch) => {
      setMatches(prevMatches => {
        const index = prevMatches.findIndex(m => m.id === updatedMatch.id);
        if (index !== -1) {
          const newMatches = [...prevMatches];
          newMatches[index] = updatedMatch;
          return newMatches;
        }
        return prevMatches;
      });
    });

    return () => {
      socket.off('match_updated');
    };
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? `http://localhost:5001${team.logo_url}` : '';
  };

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
    const isSameDay = matchDate.getFullYear() === currentDate.getFullYear() &&
                      matchDate.getMonth() === currentDate.getMonth() &&
                      matchDate.getDate() === currentDate.getDate();
    if (!isSameDay) return false;
    if (activeFilter === 'ALL') return true;
    return match.status === activeFilter;
  });

  if (selectedMatch) {
    return <PublicMatchDetails match={{
      ...selectedMatch,
      home_team_name: getTeamName(selectedMatch.home_team_id),
      away_team_name: getTeamName(selectedMatch.away_team_id),
      home_team_logo: getTeamLogo(selectedMatch.home_team_id),
      away_team_logo: getTeamLogo(selectedMatch.away_team_id),
      events: events.filter(e => e.match_id === selectedMatch.id),
    }} onBack={() => setSelectedMatch(null)} />;
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
              <ScoreCard key={match.id} match={{
                ...match,
                home_team_name: getTeamName(match.home_team_id),
                away_team_name: getTeamName(match.away_team_id),
                home_team_logo: getTeamLogo(match.home_team_id),
                away_team_logo: getTeamLogo(match.away_team_id),
              }} onClick={setSelectedMatch} />
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