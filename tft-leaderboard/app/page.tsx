import LeaderboardTable from '@/components/LeaderboardTable';
import { PlayerStats } from '@/types/player';
import fs from 'fs';
import path from 'path';

async function getStats(): Promise<PlayerStats[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'ranking_board_tactics.json');
    
    if (!fs.existsSync(filePath)) {
      console.warn('Stats file not found');
      return [];
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading stats:', error);
    return [];
  }
}

export default async function Home() {
  const players = await getStats();



  return (
    <main className="min-h-screen relative p-8 overflow-hidden flex items-center justify-center" style={{
      background: 'linear-gradient(109.6deg, rgb(10, 15, 25) 11.2%, rgb(20, 30, 45) 91.1%)'
    }}>
      <div className="absolute top-20 left-10 w-32 h-32 rounded-2xl animate-float opacity-30" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div className="absolute top-40 right-20 w-24 h-24 rounded-2xl opacity-20" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'float 8s ease-in-out infinite 1s'
      }}></div>
      
      <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-2xl opacity-25" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'float 7s ease-in-out infinite 2s'
      }}></div>
      
      <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-2xl opacity-20" style={{
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'float 9s ease-in-out infinite 0.5s'
      }}></div>

      <div className="w-full max-w-7xl relative z-10">
        <LeaderboardTable players={players} />
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
