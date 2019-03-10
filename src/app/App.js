import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import Routes from './Routes';
import { getUserInfo } from "./ducks";

class App extends Component {
    componentDidMount() {
        this.props.getUserInfo();
    }

    render() {
        return (
            <div>
              <Routes />
            </div>
        );
    }
}

export default withRouter(
    connect(null, { getUserInfo })(App)
);
