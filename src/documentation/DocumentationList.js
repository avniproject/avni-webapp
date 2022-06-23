import React, { useEffect } from "react";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import api from "./api";
import { DocumentationReducer, initialState } from "./reducers";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { get, map } from "lodash";
import TreeView from "@material-ui/lab/TreeView";
import DocumentationContext from "./context";
import { DocumentationNode, renderButton } from "./components/DocumentationNode";
import { Documentation } from "./components/Documentation";
import CustomizedBackdrop from "../dataEntryApp/components/CustomizedBackdrop";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles({
  root: {
    height: "100%",
    flexGrow: 1,
    maxWidth: 400
  }
});

const DocumentationList = ({ history, ...props }) => {
  const classes = useStyles();
  const [state, dispatch] = React.useReducer(DocumentationReducer, initialState);
  const { documentationNodes, saving, expandedNodeUUIDs } = state;

  useEffect(() => {
    const fetchData = async () => {
      const documentationNodes = await api.getDocumentation();
      const orgConfig = await api.getOrganisationConfig();
      const languages = get(orgConfig, "organisationConfig.languages", []);
      dispatch({ type: "setData", payload: { documentationNodes, languages } });
    };
    fetchData();
  }, []);

  return (
    <ScreenWithAppBar appbarTitle={"Documentation"}>
      <DocumentationContainer filename={"Documentation.md"}>
        <DocumentationContext.Provider value={{ state: state, dispatch: dispatch }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: 0.2 }}>
              <Box border={1} borderColor={"#ddd"} p={2} bgcolor={"rgba(221,221,221,0.51)"}>
                <TreeView
                  expanded={expandedNodeUUIDs}
                  onNodeToggle={(e, ids) => dispatch({ type: "nodeToggle", payload: ids })}
                  className={classes.root}
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                >
                  {map(documentationNodes, (documentationNode, idx) => (
                    <DocumentationNode key={idx} documentationNode={documentationNode} />
                  ))}
                  {renderButton("New Node", () => dispatch({ type: "newNode" }))}
                </TreeView>
              </Box>
            </div>
            <div style={{ flex: 0.8 }}>
              <Documentation />
            </div>
          </div>
          <CustomizedBackdrop load={!saving} />
        </DocumentationContext.Provider>
      </DocumentationContainer>
    </ScreenWithAppBar>
  );
};

export default DocumentationList;
