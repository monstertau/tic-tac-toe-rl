import React from "react";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import WrappedGame from "./Game/Game";
class App extends React.Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <Route path="/" exact={true} component={WrappedGame} />
        </BrowserRouter>
      </div>
    );
  }
}
export default App;
