import React, { useEffect } from 'react';
import MatchdayOperatorDashboard from './MatchdayOperatorDashboard';

function MatchdayOperatorView({ user, selectedMatchForOperator, onBackToAdminDashboard }) {
  return (
    <div>
      <MatchdayOperatorDashboard user={user} match={selectedMatchForOperator} onBackToAdminDashboard={onBackToAdminDashboard} />
    </div>
  );
}

export default MatchdayOperatorView;
