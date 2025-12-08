'use client';

import { useState, useEffect } from 'react';
import { PlayerStats } from '@/types/player';

interface LeaderboardTableProps {
  players: PlayerStats[];
}

type SortField = 'rank' | 'games' | 'wins' | 'top4s' | 'win_rate' | 'top4_rate' | 'avg_placement';
type SortDirection = 'asc' | 'desc';

export default function LeaderboardTable({ players: initialPlayers }: LeaderboardTableProps) {
  const [players, setPlayers] = useState<PlayerStats[]>(initialPlayers);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  const [sortField, setSortField] = useState<SortField>('avg_placement');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const refreshData = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'avg_placement' ? 'asc' : 'desc');
    }
  };

  const getTierValue = (player: PlayerStats): number => {
    const rankStr = player.current_rank.toUpperCase();
    
    const tierValues: { [key: string]: number } = {
      'CHALLENGER': 9,
      'GRANDMASTER': 8,
      'MASTER': 7,
      'DIAMOND': 6,
      'EMERALD': 5,
      'PLATINUM': 4,
      'GOLD': 3,
      'SILVER': 2,
      'BRONZE': 1,
      'IRON': 0,
      'UNRANKED': -1,
    };
    
    const divisionValues: { [key: string]: number } = {
      'I': 4,
      'II': 3,
      'III': 2,
      'IV': 1,
    };
    
    let tierValue = -1;
    let divisionValue = 0;
    let lp = player.lp;
    
    for (const [tier, value] of Object.entries(tierValues)) {
      if (rankStr.includes(tier)) {
        tierValue = value;
        break;
      }
    }
    
    if (tierValue > 0 && tierValue <= 6) {
      for (const [division, value] of Object.entries(divisionValues)) {
        if (rankStr.includes(` ${division} `) || rankStr.includes(` ${division}L`)) {
          divisionValue = value;
          break;
        }
      }
    }
    
    return tierValue * 100000 + divisionValue * 1000 + lp;
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortField) {
      case 'rank':
        aValue = getTierValue(a);
        bValue = getTierValue(b);
        break;
      case 'games':
        aValue = a.total_games;
        bValue = b.total_games;
        break;
      case 'wins':
        aValue = a.wins;
        bValue = b.wins;
        break;
      case 'top4s':
        aValue = a.top4s;
        bValue = b.top4s;
        break;
      case 'win_rate':
        aValue = a.win_rate;
        bValue = b.win_rate;
        break;
      case 'top4_rate':
        aValue = a.top4_rate;
        bValue = b.top4_rate;
        break;
      case 'avg_placement':
        aValue = a.avg_placement;
        bValue = b.avg_placement;
        break;
      default:
        return 0;
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getTierColor = (tier: string) => {
    const tierName = tier.toUpperCase();
    if (tierName.includes('CHALLENGER')) return 'text-cyan-400';
    if (tierName.includes('GRANDMASTER')) return 'text-red-400';
    if (tierName.includes('MASTER')) return 'text-purple-400';
    if (tierName.includes('DIAMOND')) return 'text-blue-400';
    if (tierName.includes('EMERALD')) return 'text-emerald-400';
    if (tierName.includes('PLATINUM')) return 'text-teal-400';
    if (tierName.includes('GOLD')) return 'text-yellow-400';
    if (tierName.includes('SILVER')) return 'text-gray-400';
    if (tierName.includes('BRONZE')) return 'text-orange-700';
    return 'text-gray-500';
  };

  const getPlacementColor = (avg: number) => {
    if (avg <= 2.5) return 'text-green-400 font-bold';
    if (avg <= 3.5) return 'text-blue-400';
    if (avg <= 4.5) return 'text-yellow-400';
    if (avg <= 5.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center justify-center gap-2 hover:text-white transition-colors w-full"
    >
      {children}
      <span className="text-xs opacity-60">
        {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-400 text-lg">All Ranked Games • Set 16</p>
        </div>
        <div className="text-right">
          <button
            onClick={refreshData}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 mb-3"
          >
            <span className="flex items-center gap-2">
              Refresh Data
            </span>
          </button>
          <p className="text-sm text-gray-500">Updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="relative">
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">Summoner</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                    <SortButton field="rank">Current Rank</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="games">Games</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="wins">Wins</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="top4s">Top 4</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="win_rate">Win %</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="top4_rate">Top 4 %</SortButton>
                  </th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider text-center">
                    <SortButton field="avg_placement">Avg</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedPlayers.map((player, index) => (
                  <tr
                    key={player.summoner}
                    className="hover:bg-white/5 transition-all duration-200 group"
                  >
                    <td className="px-6 py-5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white/10 text-gray-300">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a
                        href={player.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-300 font-medium group-hover:underline transition-colors text-lg"
                      >
                        {player.summoner}
                      </a>
                    </td>
                    <td className={`px-6 py-5 font-bold text-lg ${getTierColor(player.tier)}`}>
                      {player.current_rank}
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-center font-medium">{player.total_games}</td>
                    <td className="px-6 py-5 text-center text-gray-300 font-medium">
                      {player.wins}
                    </td>
                    <td className="px-6 py-5 text-center text-gray-300 font-medium">
                      {player.top4s}
                    </td>
                    <td className="px-6 py-5 text-gray-300 text-center font-medium">{player.win_rate.toFixed(1)}%</td>
                    <td className="px-6 py-5 text-gray-300 text-center font-medium">{player.top4_rate.toFixed(1)}%</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-sm ${
                        player.avg_placement <= 2.5 ? 'bg-green-500/20 text-green-400' :
                        player.avg_placement <= 3.5 ? 'bg-blue-500/20 text-blue-400' :
                        player.avg_placement <= 4.5 ? 'bg-yellow-500/20 text-yellow-400' :
                        player.avg_placement <= 5.5 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {player.avg_placement.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
