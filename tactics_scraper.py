import requests
import json
import re
from typing import List, Dict
import time
from datetime import datetime

class TacticsToolsScraper:
    def __init__(self):
        self.base_url = "https://tactics.tools"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    def get_summoner_stats(self, region: str, player_name: str, tag: str) -> Dict:
        from urllib.parse import quote
        encoded_name = quote(player_name)
        
        url = f"{self.base_url}/player/{region}/{encoded_name}/{tag}"
        
        print(f"Scraping: {url}")
        
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            page_data = self._extract_nextjs_data(response.text)
            
            if not page_data:
                print(f"✗ Could not extract data for {player_name}#{tag}")
                return None
            
            stats = self._parse_profile_data(page_data, player_name, tag, region, url)
            
            if stats:
                print(f"✓ Successfully scraped {stats['summoner']}")
            return stats
            
        except requests.RequestException as e:
            print(f"✗ Error scraping {player_name}#{tag}: {e}")
            return None
        except Exception as e:
            print(f"✗ Error parsing data for {player_name}#{tag}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _extract_nextjs_data(self, html_content: str) -> dict:
        try:
            match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.+?)</script>', html_content, re.DOTALL)
            if match:
                json_str = match.group(1)
                data = json.loads(json_str)
                return data.get('props', {}).get('pageProps', {})
            return None
        except Exception as e:
            print(f"Error extracting Next.js data: {e}")
            return None
    
    def _parse_profile_data(self, page_data: dict, player_name: str, tag: str, region: str, url: str) -> Dict:
        try:
            initial_data = page_data.get('initialData', {})
            all_matches = initial_data.get('matches', [])
            
            matches = [m for m in all_matches if m.get('queueId') == 1100]
            
            if not matches:
                print(f"No ranked matches found for {player_name}#{tag}")
                return {
                    'summoner': f"{player_name}#{tag}",
                    'region': region.upper(),
                    'url': url,
                    'rank': '',
                    'tier': 'No Ranked Matches',
                    'lp': 0,
                    'win_rate': 0.0,
                    'top4_rate': 0.0,
                    'total_games': 0,
                    'wins': 0,
                    'top4s': 0,
                    'avg_placement': 0.0,
                    'last_played': '',
                    'current_rank': 'Unranked'
                }
            
            total_games = len(matches)
            
            print(f"  → Found {len(all_matches)} total matches, {total_games} ranked games")
            
            placements = [m['info']['placement'] for m in matches]
            wins = sum(1 for p in placements if p == 1)
            top4s = sum(1 for p in placements if p <= 4)
            
            win_rate = (wins / total_games * 100) if total_games > 0 else 0.0
            top4_rate = (top4s / total_games * 100) if total_games > 0 else 0.0
            avg_placement = sum(placements) / total_games if total_games > 0 else 0.0
            
            last_played = ''
            current_rank = 'Unranked'
            if matches:
                last_match_time = matches[0].get('dateTime', 0)
                if last_match_time:
                    last_played = datetime.fromtimestamp(last_match_time / 1000).strftime('%Y-%m-%d %H:%M:%S')
                
                rank_after = matches[0].get('rankAfter')
                if rank_after and len(rank_after) == 2:
                    current_rank = f"{rank_after[0]} {rank_after[1]} LP"
            
            return {
                'summoner': f"{player_name}#{tag}",
                'region': region.upper(),
                'url': url,
                'rank': '',
                'tier': rank_after[0].split()[0] if rank_after else 'Unranked',
                'lp': rank_after[1] if rank_after and len(rank_after) == 2 else 0,
                'win_rate': win_rate,
                'top4_rate': top4_rate,
                'total_games': total_games,
                'wins': wins,
                'top4s': top4s,
                'avg_placement': avg_placement,
                'last_played': last_played,
                'current_rank': current_rank
            }
            
        except Exception as e:
            print(f"Error parsing profile data: {e}")
            import traceback
            traceback.print_exc()
            return None


def create_ranking_board(summoners_list: List[tuple]) -> List[Dict]:
    scraper = TacticsToolsScraper()
    all_stats = []
    
    for region, player_name, tag in summoners_list:
        stats = scraper.get_summoner_stats(region, player_name, tag)
        if stats:
            all_stats.append(stats)
        time.sleep(1)
    
    ranked_stats = sorted(all_stats, key=lambda x: x['avg_placement'])
    
    return ranked_stats


def display_ranking_board(ranked_stats: List[Dict]):
    print("\n" + "="*130)
    print("TFT RANKING BOARD (tactics.tools - All Ranked Games)".center(130))
    print("="*130)
    print(f"{'#':<4} {'Summoner':<25} {'Current Rank':<20} {'Games':<7} {'Wins':<6} {'Top 4':<7} {'Win %':<8} {'Top4 %':<8} {'Avg':<6}")
    print("-"*130)
    
    for idx, stats in enumerate(ranked_stats, 1):
        print(f"{idx:<4} {stats['summoner'][:24]:<25} {stats.get('current_rank', 'Unknown'):<20} {stats['total_games']:<7} {stats['wins']:<6} "
              f"{stats['top4s']:<7} {stats['win_rate']:>5.1f}%{'':<2} {stats['top4_rate']:>5.1f}%{'':<2} "
              f"{stats['avg_placement']:.2f}")
    
    print("="*130)
    print("\n📊 Stats based on ALL ranked games (Set 16) from tactics.tools")


def save_ranking_board(ranked_stats: List[Dict], filename: str = "tft-leaderboard/public/ranking_board_tactics.json"):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(ranked_stats, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Ranking board saved to {filename}")


if __name__ == "__main__":
    summoners_to_track = [
        ('na', 'Shμbbanuffa', 'NA1'),
        ('na', 'SUPER CHICKEN', 'birds'),
        ('na', 'Stelle', 'def'),
        ('na', 'Numinya', 'flush'),
        ('na', 'agz', 'fif'),
    ]
    
    print("Starting tactics.tools scraper...")
    print(f"Tracking {len(summoners_to_track)} summoners\n")
    
    ranked_stats = create_ranking_board(summoners_to_track)
    
    if ranked_stats:
        display_ranking_board(ranked_stats)
        save_ranking_board(ranked_stats)
    else:
        print("No stats were successfully scraped.")
