import React, { useEffect } from "react";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import api from "./api";
import { DocumentationReducer, initialState } from "./reducers";
import { filter, get, isNil, map } from "lodash";
import DocumentationContext from "./context";
import Documentation from "./components/Documentation";
import CustomizedBackdrop from "../dataEntryApp/components/CustomizedBackdrop";
import { Box } from "@mui/material";
import { Item } from "./components/Item";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import UserInfo from "../common/model/UserInfo";
import { Privilege } from "openchs-models";

function createDocumentationNode(
  documentations,
  onDocumentationToggle,
  allDocumentations,
  onDocumentationAdd,
  onRemoveDocumentation,
  level,
  selectedDocumentationUUID,
  hasEditPrivilege
) {
  return map(documentations, (documentation, idx) => {
    const { uuid, name } = documentation;
    const childrenDocumentations = filter(allDocumentations, ad => uuid === get(ad, "parent.uuid"));
    return (
      <React.Fragment key={uuid}>
        <Item
          name={name}
          onAdd={hasEditPrivilege && (() => onDocumentationAdd(documentation))}
          onDelete={hasEditPrivilege && (() => onRemoveDocumentation(uuid))}
          level={level}
          onToggle={() => onDocumentationToggle(documentation)}
          isSelected={selectedDocumentationUUID === uuid}
        />
        {createDocumentationNode(
          childrenDocumentations,
          onDocumentationToggle,
          allDocumentations,
          onDocumentationAdd,
          onRemoveDocumentation,
          level + 1,
          selectedDocumentationUUID,
          hasEditPrivilege
        )}
      </React.Fragment>
    );
  });
}

const DocumentationList = ({ userInfo }) => {
  const location = useLocation();
  const documentationUUID = get(location, "state.documentationUUID");
  const [state, dispatch] = React.useReducer(DocumentationReducer, initialState);
  const { documentations, saving, selectedDocumentation } = state;
  const rootNodes = filter(documentations, d => isNil(d.parent));

  useEffect(() => {
    const fetchData = async () => {
      const documentations = await api.getDocumentation();
      const nonVoidedDocumentations = filter(documentations, d => !d.voided);
      const orgConfig = await api.getOrganisationConfig();
      const languages = get(orgConfig, "organisationConfig.languages", []);
      dispatch({
        type: "setData",
        payload: { documentations: nonVoidedDocumentations, languages, documentationUUID }
      });
    };
    fetchData();
  }, []);

  const onDocumentationToggle = documentation => dispatch({ type: "toggleDocumentation", payload: documentation });

  const onDocumentationAdd = (parent = null) => dispatch({ type: "newDocumentation", payload: { parent: parent } });

  const onRemoveDocumentation = async uuid => {
    if (window.confirm("Do you really want to delete this documentation?")) {
      dispatch({ type: "saving", payload: true });
      const error = await api.deleteDocumentation(uuid);
      if (error) {
        dispatch({ type: "saving", payload: false });
        alert(error);
      } else {
        dispatch({ type: "delete", payload: { uuid } });
        dispatch({ type: "saving", payload: false });
      }
    }
  };

  const hasEditPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditDocumentation);
  return (
    <ScreenWithAppBar appbarTitle={"Documentation"}>
      <DocumentationContext.Provider value={{ state: state, dispatch: dispatch }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Box border={1} pt={2} pb={2} borderColor={"#ddd"} bgcolor={"rgba(248,248,248,0.37)"} style={{ flex: 0.2 }}>
            <Item name={"Documentation"} onAdd={hasEditPrivilege && (() => onDocumentationAdd())} level={1} disabled={true} />
            {createDocumentationNode(
              rootNodes,
              onDocumentationToggle,
              documentations,
              onDocumentationAdd,
              onRemoveDocumentation,
              1,
              get(selectedDocumentation, "uuid"),
              hasEditPrivilege
            )}
          </Box>
          <div style={{ flex: 0.8 }}>
            <Documentation />
          </div>
        </div>
        <CustomizedBackdrop load={!saving} />
      </DocumentationContext.Provider>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(DocumentationList);
