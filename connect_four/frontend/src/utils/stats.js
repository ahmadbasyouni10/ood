const STATS_KEY = "connect4_stats";

function getStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || defaultStats();
  } catch {
    return defaultStats();
  }
}

function defaultStats() {
  return { totalGames: 0, players: {} };
}

function ensurePlayer(stats, name) {
  if (!stats.players[name]) {
    stats.players[name] = {
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0,
      bestStreak: 0,
      fastestWin: null,
      totalMoves: 0,
      gamesPlayed: 0,
    };
  }
}

export function recordGame(player1Name, player2Name, winnerPiece, totalMoves) {
  const stats = getStats();
  stats.totalGames++;

  ensurePlayer(stats, player1Name);
  ensurePlayer(stats, player2Name);

  const p1 = stats.players[player1Name];
  const p2 = stats.players[player2Name];

  p1.gamesPlayed++;
  p2.gamesPlayed++;
  p1.totalMoves += totalMoves;
  p2.totalMoves += totalMoves;

  if (winnerPiece === null) {
    p1.draws++;
    p2.draws++;
    p1.currentStreak = 0;
    p2.currentStreak = 0;
  } else if (winnerPiece === 1) {
    p1.wins++;
    p2.losses++;
    p1.currentStreak++;
    p1.bestStreak = Math.max(p1.bestStreak, p1.currentStreak);
    p2.currentStreak = 0;
    if (p1.fastestWin === null || totalMoves < p1.fastestWin) {
      p1.fastestWin = totalMoves;
    }
  } else {
    p2.wins++;
    p1.losses++;
    p2.currentStreak++;
    p2.bestStreak = Math.max(p2.bestStreak, p2.currentStreak);
    p1.currentStreak = 0;
    if (p2.fastestWin === null || totalMoves < p2.fastestWin) {
      p2.fastestWin = totalMoves;
    }
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getAllStats() {
  return getStats();
}

export function clearStats() {
  localStorage.removeItem(STATS_KEY);
}
