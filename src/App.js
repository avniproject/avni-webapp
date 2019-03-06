import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { Authenticator, SignUp, Greetings } from 'aws-amplify-react';
import './App.css';
import logo from './logo.png';

const ManageUsers = () => (
    <div>
      <h1>Manage Users</h1>
    </div>
);


const Home = () => (
    <div>
      <ul>
        <li><Link to="/manage/users">Manage Users</Link></li>
      </ul>
    </div>
);


const App = () =>
    <div>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/manage/users" component={ManageUsers}/>
      </Switch>
    </div>;


class AppWithAuth extends Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.setAuthState = this.setAuthState.bind(this);
    }

    setAuthState(authState, authData) {
      this.setState({authState, authData})
    }

    render() {
      return (
        this.state.authState === 'signedIn' ?
          <App {...this.state} {...this.props} />
          :
            <div className="App-header">
              <img src={logo} alt="logo" />
              <Authenticator
                  hide={[Greetings, SignUp]}
                  onStateChange={this.setAuthState}/>
            </div>
      );
    }
}


export {App, AppWithAuth};
