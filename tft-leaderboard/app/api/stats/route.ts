import { NextResponse } from 'next/server';
import { PlayerStats } from '@/types/player';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'ranking_board_tactics.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Stats file not found. Run the Python scraper first.' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const players: PlayerStats[] = JSON.parse(fileContents);

    return NextResponse.json({
      players,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reading stats:', error);
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}
