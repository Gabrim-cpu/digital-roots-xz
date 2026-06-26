import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getLeaderboard } from '../services/apiService';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaders(Array.isArray(data) ? data : data.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="rounded-3xl border p-5 shadow-sm border-stone-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-brand-burgundy" />
        <h3 className="text-base font-bold">Top Contributors</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-brand-burgundy rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Loading...</p>
        </div>
      ) : leaders.length === 0 ? (
        <p className="text-sm py-2 text-stone-400">No contributors yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div key={leader.user_id || index} className="flex items-center justify-between rounded-2xl p-3.5 bg-[#FBF9F6]">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold min-w-[24px] ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-stone-400' : index === 2 ? 'text-amber-700' : 'text-stone-400'}`}>
                  #{index + 1}
                </span>
                <span className="text-base font-bold">{leader.display_name || leader.user_id}</span>
              </div>
              <span className="text-base font-bold text-brand-burgundy">{leader.total_points} pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
