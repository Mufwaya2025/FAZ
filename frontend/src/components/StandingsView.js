import React, { useState, useEffect } from 'react';
import './StandingsView.css';

function StandingsView({ leagueId }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Received leagueId in StandingsView:", leagueId); // Debugging line

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/v1/leagues/${leagueId}/standings`, {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setStandings(data);
        } else {
          setError(data.msg);
        }
      } catch (err) {
        setError('Failed to fetch standings.');
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  if (loading) {
    return <div>Loading standings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getRowClass = (index) => {
    if (index < 2) {
      return 'champions-league';
    }
    if (index < 4) {
      return 'confederation-cup';
    }
    if (index >= standings.length - 3) {
      return 'relegation';
    }
    return '';
  };

  return (
    <div className="standings-container">
      <h3>League Standings</h3>
      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={team.team_id} className={getRowClass(index)}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.goalDifference}</td>
              <td>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StandingsView;