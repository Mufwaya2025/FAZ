const mockData = {
  leagues: [
    {
      id: 1,
      name: "Zambia Super League",
      country: "Zambia",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 10,
      name: "National Division One",
      country: "Zambia",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 11,
      name: "FAZ Women's League",
      country: "Zambia",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 2,
      name: "Premier League",
      country: "England",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 3,
      name: "Ligue 1",
      country: "France",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 4,
      name: "Bundesliga",
      country: "Germany",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 5,
      name: "Serie A",
      country: "Italy",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 6,
      name: "Eredivisie",
      country: "Netherlands",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 7,
      name: "LaLiga",
      country: "Spain",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 8,
      name: "UEFA Champions League",
      country: "Europe",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    },
    {
      id: 9,
      name: "UEFA Europa League",
      country: "Europe",
      season: "2024/2025",
      flag: "https://picsum.photos/20/15"
    }
  ],
  teams: [
    { id: 101, name: "Nkana FC", leagueId: 1 },
    { id: 102, name: "Zanaco FC", leagueId: 1 },
    { id: 103, name: "Power Dynamos", leagueId: 1 },
    { id: 104, name: "Green Eagles", leagueId: 1 },
    { id: 201, name: "Arsenal", leagueId: 2 },
    { id: 202, name: "Chelsea", leagueId: 2 },
    { id: 203, name: "Liverpool", leagueId: 2 },
    { id: 204, name: "Man Utd", leagueId: 2 },
    { id: 301, name: "PSG", leagueId: 3 },
    { id: 302, name: "Marseille", leagueId: 3 }
  ],
  players: [
    { id: 1, name: "Player A", team_id: 101, position: "Forward", jersey_number: 10, age: 25, nationality: "Zambian", image_url: "" },
    { id: 2, name: "Player B", team_id: 101, position: "Midfielder", jersey_number: 8, age: 28, nationality: "Zambian", image_url: "" },
    { id: 3, name: "Player C", team_id: 102, position: "Defender", jersey_number: 4, age: 22, nationality: "Zambian", image_url: "" },
    { id: 4, name: "Player D", team_id: 102, position: "Goalkeeper", jersey_number: 1, age: 30, nationality: "Zambian", image_url: "" }
  ],
  matches: [
    {
      id: 1,
      leagueId: 1,
      homeTeamId: 101,
      awayTeamId: 102,
      date: "2025-07-10T15:00:00Z",
      status: "live",
      homeScore: 1,
      awayScore: 0,
      minute: 75,
      events: [
        { minute: 20, type: "goal", team: "home", player: "Player A", description: "Goal! Player A scores for Nkana FC." },
        { minute: 45, type: "yellow_card", team: "away", player: "Player B", description: "Yellow card for Player B (Zanaco FC)." }
      ],
      stats: {
        possession: { home: 55, away: 45 },
        shots: { home: 10, away: 7 },
        corners: { home: 5, away: 3 },
        fouls: { home: 8, away: 12 }
      },
      lineups: {
        home: [
          { name: "GK Player 1", position: "GK" },
          { name: "DF Player 2", position: "DF" },
          { name: "MF Player 3", position: "MF" },
          { name: "FW Player 4", position: "FW" }
        ],
        away: [
          { name: "GK Player 5", position: "GK" },
          { name: "DF Player 6", position: "DF" },
          { name: "MF Player 7", position: "MF" },
          { name: "FW Player 8", position: "FW" }
        ]
      }
    },
    {
      id: 2,
      leagueId: 1,
      homeTeamId: 103,
      awayTeamId: 104,
      date: "2025-07-10T17:00:00Z",
      status: "scheduled",
      homeScore: 0,
      awayScore: 0,
      minute: null,
      events: []
    },
    {
      id: 3,
      leagueId: 2,
      homeTeamId: 201,
      awayTeamId: 202,
      date: "2025-07-09T19:30:00Z",
      status: "finished",
      homeScore: 2,
      awayScore: 1,
      minute: 90,
      events: [
        { minute: 10, type: "goal", team: "home", player: "Player X", description: "Goal by Player X!" },
        { minute: 45, type: "goal", team: "away", player: "Player Y", description: "Goal by Player Y!" },
        { minute: 80, type: "goal", team: "home", player: "Player Z", description: "Goal by Player Z!" }
      ]
    },
    {
      id: 4,
      leagueId: 2,
      homeTeamId: 203,
      awayTeamId: 204,
      date: "2025-07-10T14:00:00Z",
      status: "live",
      homeScore: 0,
      awayScore: 0,
      minute: 30,
      events: []
    },
    {
      id: 5,
      leagueId: 3,
      homeTeamId: 301,
      awayTeamId: 302,
      date: "2025-07-11T20:00:00Z",
      status: "scheduled",
      homeScore: 0,
      awayScore: 0,
      minute: null,
      events: []
    },
    {
      id: 6,
      leagueId: 9, // Europa League
      homeTeamId: 101, // Nkana FC
      awayTeamId: 301, // PSG
      date: "2025-07-10T18:00:00Z",
      status: "scheduled",
      homeScore: 0,
      awayScore: 0,
      minute: null,
      events: []
    }
  ]
};

module.exports = mockData;