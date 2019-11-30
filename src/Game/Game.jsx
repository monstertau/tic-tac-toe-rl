import React from "react";
import { Modal, Button, Form, Slider, Radio } from "antd";
import "./Game.css";
import "antd/dist/antd.css";
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.board = Array(9).fill(" ");
    this.state = {
      turn: "X",
      gameEnded: false,
      result: "",
      level: "Easy",
      visible: true,
      confirmLoading: false,
      canPlay: true
    };
  }
  componentDidMount() {
    fetch("http://localhost:5000/new-game", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        level: this.state.level,
        turn: this.state.turn
      })
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log(data);
      });
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.turn != prevState.turn ||
      this.state.result != prevState.result
    ) {
      const result = this.checkWinner();
      if (result == "X" || result == "O") {
        this.setState({
          result: "The winner is " + result,
          gameEnded: true
        });
      } else if (result == ".") {
        this.setState({
          result: "The game is draw",
          gameEnded: true
        });
      }
    }
  }
  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = () => {
    console.log("The modal will be closed after two seconds");
    this.setState({
      confirmLoading: true
    });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values.level);
        this.setState({
          level: values.level,
          turn: values.turn
        });
        fetch("http://localhost:5000/new-game", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            level: values.level
          })
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            if (data.success) {
              this.setState({
                confirmLoading: false,
                visible: false
              });
              console.log(this.state);
              if (this.state.turn === "O") {
                this.setState({
                  canPlay: false
                });
                fetch("http://localhost:5000/play-game", {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    board: this.board,
                    turn: this.state.turn
                  })
                })
                  .then(res => {
                    return res.json();
                  })
                  .then(data => {
                    console.log(data);
                    if (!this.state.gameEnded) {
                      this.board = data.board;
                      this.setState({
                        canPlay: true
                      });
                    }
                  });
              }
            }
          });
      }
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };
  reset = event => {
    event.preventDefault();
    this.setState({
      turn: "X",
      gameEnded: false,
      result: "",
      visible: true,
      canPlay: true
    });
    this.board = Array(9).fill(" ");
  };

  clicked = event => {
    if (this.state.canPlay) {
      const dataSquare = event.target.dataset.square;
      if (this.board[dataSquare] === " " && !this.state.gameEnded) {
        this.setState({
          turn: this.state.turn === "X" ? "O" : "X",
          canPlay: false
        });
        this.board[dataSquare] = this.state.turn;
        if (!this.state.gameEnded) {
          fetch("http://localhost:5000/play-game", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              board: this.board,
              turn: this.state.turn
            })
          })
            .then(res => {
              return res.json();
            })
            .then(data => {
              console.log(data);
              if (!this.state.gameEnded) {
                setTimeout(() => {
                  this.board = data.board;
                  this.setState({
                    turn: this.state.turn === "X" ? "O" : "X",
                    canPlay: true
                  });
                }, 500);
              }
            });
        }
      }
    }
  };

  checkWinner = () => {
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0 + i] !== " " &&
        this.board[0 + i] === this.board[3 + i] &&
        this.board[3 + i] === this.board[6 + i]
      ) {
        return this.board[0 + i];
      }
    }
    // horizontal win
    for (let i = 0; i <= 6; i += 3) {
      if (
        this.board[0 + i] !== " " &&
        this.board[0 + i] === this.board[1 + i] &&
        this.board[1 + i] === this.board[2 + i]
      ) {
        return this.board[0 + i];
      }
    }
    // main diagonal win
    if (this.board[0] === this.board[4] && this.board[4] === this.board[8]) {
      return this.board[0];
    }
    // second diagonal win
    if (this.board[2] === this.board[4] && this.board[4] === this.board[6]) {
      return this.board[2];
    }
    // is whole this.board full?
    for (let i = 0; i < 9; i++) {
      // There's an empty field, we continue the game
      if (this.board[i] === " ") return 0;
    }
    // it's a tie!
    return ".";
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="text-center box container mt-5">
        <h1>Play Tic Tac Toe</h1>
        <h5>Level: {this.state.level}</h5>
        <div
          className="mt-5 row boardGame"
          onClick={event => this.clicked(event)}
        >
          <div className="col-3 tic " data-square="0">
            {this.board[0]}
          </div>
          <div className="col-3 tic " data-square="1">
            {this.board[1]}
          </div>
          <div className="col-3 tic " data-square="2">
            {this.board[2]}
          </div>
          <div className="col-3 tic" data-square="3">
            {this.board[3]}
          </div>
          <div className="col-3 tic " data-square="4">
            {this.board[4]}
          </div>
          <div className="col-3 tic " data-square="5">
            {this.board[5]}
          </div>
          <div className="col-3 tic " data-square="6">
            {this.board[6]}
          </div>
          <div className="col-3 tic " data-square="7">
            {this.board[7]}
          </div>
          <div className="col-3 tic " data-square="8">
            {this.board[8]}
          </div>
        </div>
        <button
          type="button"
          class="btn btn-secondary"
          onClick={event => this.reset(event)}
        >
          New Game
        </button>
        <Modal
          title="New Game"
          visible={this.state.visible}
          onOk={this.handleOk}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Return
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={this.state.confirmLoading}
              onClick={this.handleOk}
            >
              {!this.state.confirmLoading ? (
                <>Start Game!</>
              ) : (
                <>Please Wait...</>
              )}
            </Button>
          ]}
        >
          <Form onSubmit={this.handleOk}>
            <Form.Item label="Level of Bot">
              {getFieldDecorator("level")(
                <Radio.Group>
                  <Radio value="Easy">Easy</Radio>
                  <Radio value="Medium">Medium</Radio>
                  <Radio value="Impossible">Impossible</Radio>
                </Radio.Group>
              )}
            </Form.Item>

            <Form.Item label="Your Player">
              {getFieldDecorator("turn")(
                <Radio.Group>
                  <Radio value="X">X</Radio>
                  <Radio value="O">O</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
        {this.state.gameEnded ? (
          <div>{this.state.result}</div>
        ) : (
          <div>Its {this.state.turn} Turn</div>
        )}
      </div>
    );
  }
}
const WrappedGame = Form.create({ name: "validate_other" })(Game);
export default WrappedGame;
