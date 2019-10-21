import React, { Component } from "react";
import PropTypes from "prop-types";
import { Admin, Resource } from "react-admin";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { authProvider, LogoutButton } from "./react-admin-config";
import { adminHistory, store } from "../common/store";
import { UserCreate, UserDetail, UserEdit, UserList } from "./user";
import { CatchmentCreate, CatchmentDetail, CatchmentEdit, CatchmentList } from "./catchment";
import {
  LocationTypeCreate,
  LocationTypeDetail,
  LocationTypeEdit,
  LocationTypeList
} from "./addressLevelType";
import { LocationCreate, LocationDetail, LocationEdit, LocationList } from "./locations";
import { ProgramCreate, ProgramDetail, ProgramEdit, ProgramList } from "./programs";
import {
  SubjectTypeCreate,
  SubjectTypeDetail,
  SubjectTypeEdit,
  SubjectTypeList
} from "./SubjectTypes";
import {
  EncounterTypeCreate,
  EncounterTypeDetail,
  EncounterTypeEdit,
  EncounterTypeList
} from "./EncounterTypes";
import customConfig from "./OrganisationConfig";
import { WithProps } from "../common/components/utils";
import Forms from "../formDesigner/views/Forms";
import Concepts from "../formDesigner/views/Concepts";
import UploadImpl from "../formDesigner/views/UploadImpl";
import customRoutes from "./customRoutes";
import Translations from "../translations";
import { JssProvider } from "react-jss";

const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

// Heavily inspired of Material UI:
// @see https://github.com/mui-org/material-ui/blob/9cf73828e523451de456ba3dbf2ab15f87cf8504/src/styles/createGenerateClassName.js
// The issue with the MUI function is that is create a new index for each
// new `withStyles`, so we handle have to write our own counter
export const generateClassName = (rule, styleSheet) => {
  classCounter += 1;

  //   if (process.env.NODE_ENV === "production") {
  //     return `c${classCounter}`;
  //   }

  if (styleSheet && styleSheet.options.classNamePrefix) {
    let prefix = styleSheet.options.classNamePrefix;
    // Sanitize the string as will be used to prefix the generated class name.
    prefix = prefix.replace(escapeRegex, "-");

    if (prefix.match(/^Mui/)) {
      return `${prefix}-${rule.key}`;
    }

    return `${prefix}-${rule.key}-${classCounter}`;
  }

  return `${rule.key}-${classCounter}`;
};

class OrgManager extends Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return { store };
  }

  render() {
    const { organisation, user } = this.props;
    return (
      <JssProvider generateClassName={generateClassName}>
        <Admin
          title="Manage Organisation"
          authProvider={authProvider}
          history={adminHistory}
          logoutButton={WithProps({ user }, LogoutButton)}
          customRoutes={customRoutes}
        >
          <Resource
            name="organisationConfig"
            options={{ label: "Organisation Config" }}
            list={customConfig}
          />

          <Resource
            name="subjectType"
            options={{ label: "Subject Types" }}
            list={SubjectTypeList}
            show={SubjectTypeDetail}
            create={SubjectTypeCreate}
            edit={SubjectTypeEdit}
          />

          <Resource
            name="program"
            options={{ label: "Programs" }}
            list={ProgramList}
            show={ProgramDetail}
            create={ProgramCreate}
            edit={ProgramEdit}
          />

          <Resource
            name="encounterType"
            options={{ label: "Encounter Types" }}
            list={EncounterTypeList}
            show={EncounterTypeDetail}
            create={EncounterTypeCreate}
            edit={EncounterTypeEdit}
          />

          <Resource name="concepts" options={{ label: "Concepts" }} list={Concepts} />

          <Resource name="forms" options={{ label: "Forms" }} list={Forms} />

          <Resource
            name="addressLevelType"
            options={{ label: "Location Types" }}
            list={LocationTypeList}
            show={LocationTypeDetail}
            create={LocationTypeCreate}
            edit={LocationTypeEdit}
          />
          <Resource
            name="locations"
            options={{ label: "Locations" }}
            list={LocationList}
            show={LocationDetail}
            create={LocationCreate}
            edit={LocationEdit}
          />
          <Resource
            name="catchment"
            list={CatchmentList}
            show={CatchmentDetail}
            create={CatchmentCreate}
            edit={CatchmentEdit}
          />

          <Resource
            name="user"
            list={WithProps({ organisation }, UserList)}
            create={WithProps({ organisation }, UserCreate)}
            show={WithProps({ user }, UserDetail)}
            edit={WithProps({ user }, UserEdit)}
          />

          <Resource
            name="translations"
            options={{ label: "Translations" }}
            list={WithProps({ user, organisation }, Translations)}
          />

          <Resource name="upload" options={{ label: "Bundle" }} list={UploadImpl} />
        </Admin>
      </JssProvider>
    );
  }
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(OrgManager)
);
