from flask import Flask, jsonify, make_response, request, abort
from flask_cors import CORS, cross_origin
from training import Agent,TicTacToeGame,demo_game_stats
gameConfig = {
    'level' : 'easy',
}
app = Flask(__name__)
CORS(app)


@app.route('/new-game', methods=['POST'])
def configNewGame():
    global agent
    if not request.json:
        abort(400)
    print(request.json)
    gameConfig['level'] = request.json['level']
    
    if(gameConfig['level'] == 'Easy'):
        agent = Agent(TicTacToeGame, epsilon=0.1, alpha=1.0)
        agent.learn_game(1000)
        print("After 1000 learning games:")
        demo_game_stats(agent)
        agent.round_V()
        agent.save_v_table()
        return jsonify({'success': True}), 201
    elif(gameConfig['level'] == 'Medium'):
        agent = Agent(TicTacToeGame, epsilon=0.1, alpha=1.0)
        agent.learn_game(5000)
        print("After 5000 learning games:")
        demo_game_stats(agent)
        agent.round_V()
        agent.save_v_table()
        return jsonify({'success': True}), 201
    elif(gameConfig['level'] == 'Impossible'):
        agent = Agent(TicTacToeGame, epsilon=0.1, alpha=1.0)
        agent.learn_game(30000)
        print("After 30000 learning games:")
        demo_game_stats(agent)
        agent.round_V()
        agent.save_v_table()
        return jsonify({'success': True}), 201

@app.route('/play-game', methods=['POST'])
def bot_turn():
    if not request.json:
        abort(400)
    board, turn = request.json['board'], request.json['turn']
    demo_game_stats(agent)
    if ' ' in board:
        game = agent.NewGame()
        game.state = ''.join(board)
        if turn == 'X':
            game.player = 'O'
        if turn == 'O':
            game.player == 'X'
        move = agent.play_select_move(game)
        board = list(move)
        print(board)
        return jsonify({'board': board, 'turn':game.player,'success': True}), 201
    else:
        print(board)
        return jsonify({'board': board, 'success': False}), 201


if __name__ == '__main__':

    app.run()
