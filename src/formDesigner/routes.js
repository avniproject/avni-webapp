import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { hot } from "react-hot-loader";
import Auth from "@aws-amplify/auth";
import { withAuthenticator } from "aws-amplify-react";
import axios from "axios";

import Shell from "./Shell";
import FormDetails from "./components/FormDetails";
import NewConcept from "./components/NewConcept";
import Concept from "./components/Concept";
import Dashboard from "./components/Dashboard";
import Forms from "./components/Forms";
import Concepts from "./components/Concepts";
import config from "./config";
import { __DEV__ } from "./constants";
import CreateConcept from "./components/CreateConcept";

const __USE_LOCALHOST_BACKEND__ =
  process.env.REACT_APP_API_URL.indexOf("localhost") >= 0;

class Routes extends Component {
  componentWillMount() {
    if (this.props.authData) {
      console.log(`REACT_APP_API_URL = ${process.env.REACT_APP_API_URL}`);
      const signInUserSession = this.props.authData.signInUserSession;
      let jwtToken = null;
      if (signInUserSession) {
        jwtToken = signInUserSession.idToken.jwtToken;
        axios.defaults.headers.common["AUTH-TOKEN"] = jwtToken;
      } else {
        console.log("signInUserSession is null");
      }
    }
  }

  render() {
    const Default = () => {
      return <Shell content={Dashboard} />;
    };

    const FormList = () => {
      console.log("init FormList");
      return <Shell content={Forms} />;
    };

    const ConceptsList = () => {
      return <Shell content={Concepts} />;
    };

    const AddConcept = () => {
      return <Shell content={NewConcept} />;
    };

    const ViewConcept = () => {
      return <Shell content={Concept} />;
    };

    const AddFields = () => {
      return <Shell content={FormDetails} />;
    };

    const CreateConcepts = () => {
      return <Shell content={CreateConcept} />;
    };

    return (
      <Switch>
        <Route exact path="/" component={Default} />
        <Route exact path="/forms" component={FormList} />
        <Route exact path="/concepts" component={ConceptsList} />
        <Route exact path="/createconcept" component={CreateConcepts} />
        <Route path="/concepts/addConcept" component={AddConcept} />
        <Route path="/concepts/:conceptId" component={ViewConcept} />
        <Route path="/forms/:formUUID" component={AddFields} />
      </Switch>
    );
  }
}

class SecuredRoutes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cognitoDetailsLoaded: false
    };
  }

  componentDidMount() {
    if (__DEV__) {
      if (__USE_LOCALHOST_BACKEND__) {
        axios.defaults.headers.common["ORGANISATION-NAME"] = config.orgName;
        this.setState({ cognitoDetailsLoaded: true });
      } else {
        axios
          .get("/cognito-details")
          .then(response => response.data)
          .then(data => {
            Auth.configure({
              region: "ap-south-1",
              userPoolId: data.poolId, // Amazon Cognito User Pool ID
              userPoolWebClientId: data.clientId // Amazon Cognito Web Client ID
            });
            this.setState({ cognitoDetailsLoaded: true });
          });
      }
    } else {
      axios.defaults.baseURL = process.env.REACT_APP_API_URL;
      axios
        .get("/cognito-details")
        .then(response => response.data)
        .then(data => {
          Auth.configure({
            region: "ap-south-1",
            userPoolId: data.poolId, // Amazon Cognito User Pool ID
            userPoolWebClientId: data.clientId // Amazon Cognito Web Client ID
          });
          this.setState({ cognitoDetailsLoaded: true });
        });
    }
  }

  render() {
    if (this.state.cognitoDetailsLoaded) {
      const Authenticator = withAuthenticator(Routes);
      return __DEV__ ? (
        __USE_LOCALHOST_BACKEND__ ? (
          <Routes />
        ) : (
          <Authenticator />
        )
      ) : (
        <Authenticator />
      );
    } else {
      return <div>Loading...</div>;
    }
  }
}

export default hot(module)(SecuredRoutes);
