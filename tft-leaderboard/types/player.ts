export interface PlayerStats {
  summoner: string;
  region: string;
  url: string;
  rank: string;
  tier: string;
  lp: number;
  win_rate: number;
  top4_rate: number;
  total_games: number;
  wins: number;
  top4s: number;
  avg_placement: number;
  last_played: string;
  current_rank: string;
}

export interface LeaderboardData {
  players: PlayerStats[];
  lastUpdated: string;
}
