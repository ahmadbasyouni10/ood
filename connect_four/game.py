from connect_four.grid import Grid, GridPosition
from connect_four.player import Player
from connect_four.strategy import HumanStrategy, RandomAIStrategy

class Game:
    def __init__(self, grid: Grid, connect_n: int, target_score: int, players: list[Player]):
        self._grid = grid
        self._connect_n = connect_n
        self._target_score = target_score
        self._players = players
        self._scores = {player.name: 0 for player in players}
    
    def print_board(self):
        symbols = {
            GridPosition.EMPTY: '.',
            GridPosition.RED: 'R',
            GridPosition.YELLOW: 'Y'
        }

        print(' ' + ' '.join(str(c) for c in range(self._grid.column_count)))
        print(' ' + '-' * (self._grid.column_count * 2 - 1))

        for row in self._grid.board:
            print('| ' + ' '.join(symbols[cell] for cell in row) + ' |')

        print(' ' + '-' * (self._grid.column_count * 2 - 1))
        
    def print_score(self):
        score_str = ' | '.join(
            f"{name}: {score}" for name, score in self._scores.items()
        )
        print(f"Score: {score_str}")
    
    def play_move(self, player: Player):
        self.print_board()
        print(f"{player.name}'s turn ({player.piece_color.name})")
        while True:
            try:
                move_column = player.make_move(self._grid)
                move_row = self._grid.place_piece(move_column, player.piece_color)
                return move_row, move_column
            except ValueError as e:
                print(f"Invalid move: {e}. Please try again.")
    
    def play_round(self):
        while True:
            for player in self._players:
                row, col = self.play_move(player)
                if self._grid.check_n_connected(self._connect_n, row, col, player.piece_color):
                    self.print_board()
                    self._scores[player.name] += 1
                    return player
                if self._grid.is_full:
                    self.print_board()
                    return None
    
    def play(self):
        print(f"Connect {self._connect_n} to win! First to {self._target_score} wins the game.")
        while True:
            result = self.play_round()
            if result is None:
                print("Round ended in a draw!")
            else:
                print(f"{result.name} wins the round!")

            self.print_score()

            for player in self._players:
                if self._scores[player.name] >= self._target_score:
                    print(f"{player.name} wins the game!")
                    return
            self._grid.init_grid()
            print("New round starting...")
    
def create_game(rows: int = 6, columns: int = 7, connect_n: int = 4, target_score: int = 2, player1_type: str = "human", player2_type: str = "human") -> Game:
    strategy_map = {
        "human": HumanStrategy(),
        "random_ai": RandomAIStrategy()
    }
    
    if player1_type not in strategy_map or player2_type not in strategy_map:
        raise ValueError("Invalid player type. Valid options are 'human' and 'random_ai'.")

    grid = Grid(rows, columns)
    players = [
        Player("Player 1", GridPosition.RED, strategy_map[player1_type]),
        Player("Player 2", GridPosition.YELLOW, strategy_map[player2_type])
    ]
    return Game(grid, connect_n, target_score, players)

if __name__ == "__main__":
    game = create_game(
        rows = 6,
        cols = 7,
        connect_n = 4,
        target_score = 2,
        player1_type = "human",
        player2_type = "random_ai"
    )
    game.play()