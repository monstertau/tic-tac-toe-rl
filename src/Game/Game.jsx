import React from "react";
import { Modal, Button, Form, Slider, Radio } from "antd";
import "./Game.css";
import "antd/dist/antd.css";
import logo from "../logo.png";
const A = {
  width: 100,
  borderBottom: "2px solid #14bdac"
};
const B = {
  width: 100,
  borderBottom: "none"
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.playerTurn = "X";
    this.board = Array(9).fill(" ");
    this.state = {
      turn: "X",
      gameEnded: false,
      result: "",
      level: "Easy",
      visible: true,
      confirmLoading: false,
      canPlay: true,
      disableForm: true,
      type: "PVP"
    };
  }
  colorLevel = level => {
    if (level === "Easy") {
      return "badge badge-primary";
    }
    if (level === "Medium") {
      return "badge badge-success";
    }
    if (level === "Impossible") {
      return "badge badge-danger";
    }
  };
  colorWinner = result => {
    if (result === "X is the Winner!") {
      return "text-success";
    }
    if (result === "O is the Winner!") {
      return "text-primary";
    }
    if (result === "The game is Draw!") {
      return "text-secondary";
    }
  };
  componentDidMount() {
    if (this.state.type === "PVE") {
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
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.turn != prevState.turn ||
      this.state.result != prevState.result
    ) {
      const result = this.checkWinner();
      if (result == "X" || result == "O") {
        this.setState({
          result: result + " is the Winner!",
          gameEnded: true
        });
      } else if (result == ".") {
        this.setState({
          result: "The game is Draw!",
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
  chooseType = e => {
    // console.log(e.target.value);
    const type = e.target.value;
    if (type === "PVP") {
      this.setState({
        disableForm: true
      });
    } else {
      this.setState({
        disableForm: false
      });
    }
  };
  handleOk = () => {
    const el = document.querySelectorAll(".square");
    el.forEach(x => {
      x.classList.remove("square_marked");
      x.classList.remove("symbol_X");
      x.classList.remove("symbol_O");
      x.style.backgroundColor = null;
      x.style.borderColor = "#666";
      x.style.filter = "none";
    });
    this.board = Array(9).fill(" ");
    this.setState({
      turn: "X",
      gameEnded: false,
      result: "",
      canPlay: true
    });
    this.setState({
      confirmLoading: true
    });
    // console.log("The modal will be closed after two seconds");

    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log("Received values of form: ", values);
        this.setState({
          type: values.type
        });
        if (values.type === "PVE") {
          this.setState({
            level: values.level,
            turn: values.turn
          });
          this.playerTurn = values.turn;
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
                // console.log(this.state);
                if (values.turn === "O") {
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
                      // console.log(data);
                      if (!this.state.gameEnded) {
                        for (let i = 0; i < this.board.length; i++) {
                          if (this.board[i] != data.board[i]) {
                            // console.log(i);
                            const el = document.querySelectorAll(".square");
                            el.forEach(x => {
                              if (x.dataset.square == i) {
                                x.classList.add("symbol_X");
                                x.classList.add("square_marked");
                                this.fadeIn(x);
                              }
                            });

                            this.board[i] = "X";
                          }
                        }
                        this.setState({
                          canPlay: true
                        });
                      }
                    });
                }
              }
            });
        } else {
          this.setState({
            visible: false,
            confirmLoading: false
          });
        }
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
      visible: true
    });
  };
  gameRenew = event => {
    const el = document.querySelectorAll(".square");
    el.forEach(x => {
      x.classList.remove("square_marked");
      x.classList.remove("symbol_X");
      x.classList.remove("symbol_O");
      x.style.backgroundColor = null;
      x.style.borderColor = "#666";
      x.style.filter = "none";
    });
    // console.log("hehe")
    // console.log(this.playerTurn)
    this.board = Array(9).fill(" ");
    if (this.state.type === "PVE") {
      if (this.playerTurn === "X") {
        this.setState({
          turn: "X",
          gameEnded: false,
          result: "",
          canPlay: true
        });
      } else {
        this.setState({
          turn: "O",
          gameEnded: false,
          result: "",
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
              for (let i = 0; i < this.board.length; i++) {
                if (this.board[i] != data.board[i]) {
                  // console.log(i);
                  const el = document.querySelectorAll(".square");
                  el.forEach(x => {
                    if (x.dataset.square == i) {
                      x.classList.add("symbol_X");
                      x.classList.add("square_marked");
                      this.fadeIn(x);
                    }
                  });

                  this.board[i] = "X";
                }
              }
              this.setState({
                canPlay: true
              });
            }
          });
      }
    } else {
      this.setState({
        turn: "X",
        gameEnded: false,
        result: "",
        canPlay: true
      });
    }
  };
  clicked = event => {
    if (this.state.type === "PVE") {
      if (this.state.canPlay) {
        const dataSquare = event.target.dataset.square;
        if (this.board[dataSquare] === " " && !this.state.gameEnded) {
          this.setState({
            turn: this.state.turn === "X" ? "O" : "X",
            canPlay: false
          });
          this.board[dataSquare] = this.state.turn;
          if (this.state.turn == "X") {
            event.target.classList.add("symbol_X");
            event.target.classList.add("square_marked");
            this.fadeIn(event.target);
          }
          if (this.state.turn == "O") {
            event.target.classList.add("symbol_O");
            event.target.classList.add("square_marked");
            this.fadeIn(event.target);
          }
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
                // console.log(data);
                if (!this.state.gameEnded) {
                  for (let i = 0; i < this.board.length; i++) {
                    if (this.board[i] != data.board[i]) {
                      // console.log(i);
                      const el = document.querySelectorAll(".square");
                      el.forEach(x => {
                        if (x.dataset.square == i) {
                          if (this.state.turn == "X") {
                            setTimeout(() => {
                              x.classList.add("symbol_X");
                              x.classList.add("square_marked");
                              this.fadeIn(x);
                            }, 500);
                          }
                          if (this.state.turn == "O") {
                            setTimeout(() => {
                              x.classList.add("symbol_O");
                              x.classList.add("square_marked");
                              this.fadeIn(x);
                            }, 500);
                          }
                        }
                      });

                      setTimeout(() => {
                        this.board[i] = this.state.turn;
                        this.setState({
                          turn: this.state.turn === "X" ? "O" : "X",
                          canPlay: true
                        });
                      }, 500);
                    }
                  }
                }
              });
          }
        }
      }
    } else {
      const dataSquare = event.target.dataset.square;
      if (this.board[dataSquare] === " " && !this.state.gameEnded) {
        this.setState({
          turn: this.state.turn === "X" ? "O" : "X"
        });
        this.board[dataSquare] = this.state.turn;
        if (this.state.turn == "X") {
          event.target.classList.add("symbol_X");
          event.target.classList.add("square_marked");
          this.fadeIn(event.target);
        }
        if (this.state.turn == "O") {
          event.target.classList.add("symbol_O");
          event.target.classList.add("square_marked");
          this.fadeIn(event.target);
        }
      }
    }
  };
  fadeLosingCells = winningCells => {
    // console.log(winningCells);
    const el = document.querySelectorAll(".square");
    el.forEach(x => {
      const cell = x.dataset.square;
      if (winningCells.includes(parseInt(cell))) {
        if (this.state.result === "X is the Winner!") {
          x.style.backgroundColor = "hsl(134, 61%, 41%)";
        }else{
          x.style.backgroundColor = "hsl(188, 78%, 40%)";
        }
      } else {
        x.style.filter = "grayscale(50%)";
        this.fadeOut(x, 0.5);
      }
    });
  };
  fadeOut = (element, opacityLevel) => {
    element.style.opacity = 1;
    (function fadeOutEffect() {
      let val = parseFloat(element.style.opacity);
      if ((val -= 0.05) >= opacityLevel) {
        element.style.opacity = val;
        requestAnimationFrame(fadeOutEffect);
      }
    })();
    if (opacityLevel === 0) {
      element.style.visibility = "hidden";
    }
  };
  fadeIn = (element, bgColor = "element.style.background") => {
    element.style.visibility = "visible";
    element.style.opacity = 0;
    element.style.background = bgColor;
    (function fadeInEffect() {
      let val = parseFloat(element.style.opacity);
      if ((val += 0.05) <= 1) {
        element.style.opacity = val;
        requestAnimationFrame(fadeInEffect);
      }
    })();
  };
  checkWinner = () => {
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0 + i] !== " " &&
        this.board[0 + i] === this.board[3 + i] &&
        this.board[3 + i] === this.board[6 + i]
      ) {
        const winningCell = [];
        winningCell.push(0 + i, 3 + i, 6 + i);
        setTimeout(() => {
          this.fadeLosingCells(winningCell);
        }, 850);
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
        const winningCell = [];
        winningCell.push(0 + i, 1 + i, 2 + i);
        setTimeout(() => {
          this.fadeLosingCells(winningCell);
        }, 850);
        return this.board[0 + i];
      }
    }
    // main diagonal win
    if (
      this.board[0] !== " " &&
      this.board[0] === this.board[4] &&
      this.board[4] === this.board[8]
    ) {
      const winningCell = [];
      winningCell.push(0, 4, 8);
      setTimeout(() => {
        this.fadeLosingCells(winningCell);
      }, 850);
      return this.board[0];
    }
    // second diagonal win
    if (
      this.board[2] !== " " &&
      this.board[2] === this.board[4] &&
      this.board[4] === this.board[6]
    ) {
      const winningCell = [];
      winningCell.push(2, 4, 6);
      setTimeout(() => {
        this.fadeLosingCells(winningCell);
      }, 850);
      return this.board[2];
    }
    // is whole this.board full?
    for (let i = 0; i < 9; i++) {
      // There's an empty field, we continue the game
      if (this.board[i] === " ") return 0;
    }
    // it's a tie!
    const winningCell = [];
    setTimeout(() => {
      this.fadeLosingCells(winningCell);
    }, 850);
    return ".";
  };
  render() {
    // console.log(this.state);
    // console.log(this.board)
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="text-center box container mb-2">
        <img
          src={logo}
          height={55}
          width={200}
          style={{ objectFit: "cover" }}
          alt="logo"
        />

        {this.state.type === "PVP" ? (
          <div style={{ fontWeight: "bold", fontSize: 30 }}>
            Human vs Human Mode
          </div>
        ) : (
          <>
            <div style={{ fontWeight: "bold", fontSize: 30 }}>
              Human vs AI Mode{" "}
            </div>
            <div style={{ fontSize: 20 }}>
              Level:
              <span class={this.colorLevel(this.state.level)}>
                {this.state.level}
              </span>
            </div>
          </>
        )}
        {this.state.gameEnded ? (
          <div
            style={{ fontWeight: "bold", fontSize: 30 }}
            className={this.colorWinner(this.state.result)}
          >
            {this.state.result}
          </div>
        ) : (
          <>
            {" "}
            <input
              style={this.state.turn === "X" ? A : B}
              type="button"
              className="btn btn-default shadow bg-white rounded btn-sm"
              value="X turn"
            />
            <input
              style={this.state.turn === "O" ? A : B}
              type="button"
              className="btn btn-default ml-5 shadow bg-white rounded btn-sm"
              value="O turn"
            />
          </>
        )}

        <div
          className="mt-2 row board mb-4"
          onClick={event => this.clicked(event)}
        >
          <table>
            <tr>
              <td class="square" data-square="0"></td>
              <td class="square square_center-column" data-square="1"></td>
              <td class="square" data-square="2"></td>
            </tr>
            <tr>
              <td class="square square_middle-row" data-square="3"></td>
              <td class="square square_center-square" data-square="4"></td>
              <td class="square square_middle-row" data-square="5"></td>
            </tr>
            <tr>
              <td class="square" data-square="6"></td>
              <td class="square square_center-column" data-square="7"></td>
              <td class="square" data-square="8"></td>
            </tr>
          </table>
        </div>
        <button
          type="button"
          class="btn btn-danger mr-2"
          onClick={event => this.reset(event)}
        >
          New Game
        </button>
        <button
          type="button"
          class="btn btn-info"
          onClick={event => this.gameRenew(event)}
        >
          Reset
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
            <Form.Item
              label={
                <span style={{ fontWeight: "bold", fontSize: 20 }}>
                  Choose Game Type
                </span>
              }
            >
              {getFieldDecorator("type", {
                initialValue: "PVP"
              })(
                <Radio.Group
                  onChange={this.chooseType}
                  setFieldsValue={this.state.value}
                  buttonStyle="solid"
                >
                  <Radio.Button value="PVP">Human vs Human</Radio.Button>
                  <Radio.Button value="PVE">Human vs AI</Radio.Button>
                </Radio.Group>
              )}
            </Form.Item>

            <Form.Item
              label={
                <span style={{ fontWeight: "bold", fontSize: 20 }}>
                  Your Player
                </span>
              }
              hidden={this.state.disableForm}
              required={true}
            >
              {getFieldDecorator("turn")(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="X">X</Radio.Button>
                  <Radio.Button value="O">O</Radio.Button>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item
              label={
                <span style={{ fontWeight: "bold", fontSize: 20 }}>
                  Level of Bot
                </span>
              }
              hidden={this.state.disableForm}
              required={true}
            >
              {getFieldDecorator("level")(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="Easy">Easy</Radio.Button>
                  <Radio.Button value="Medium">Medium</Radio.Button>
                  <Radio.Button value="Impossible">Impossible</Radio.Button>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}
const WrappedGame = Form.create({ name: "validate_other" })(Game);
export default WrappedGame;
