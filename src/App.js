import { Route, Switch } from "react-router-dom";
import React from "react";
import LoginPage from "./login/Login";
import Register from "./login/Register";
import Otpscreen from "./login/Otpscreen";
import After_login from "./login/After_login";

function App() {
  return (
    <Switch>
      <Route exact path="/" component={LoginPage} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/otp" component={Otpscreen} />
      <Route exact path="/loginotp" component={After_login} />
    </Switch>
  );
}

export default App;
