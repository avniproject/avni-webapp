import { useState } from "react";
import { getDocumentationState, useDocumentationDispatch } from "../hooks";
import { Tabs, Tab, Box, TextField } from "@mui/material";
import { find, isEmpty, map } from "lodash";
import { DocumentationItem } from "./DocumentationItem";
import { SaveComponent } from "../../common/components/SaveComponent";
import api from "../api";
import { cloneForSave } from "../reducers";
import { SystemInfo } from "../../formDesigner/components/SystemInfo";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { useSelector } from "react-redux";

function renderDocumentItem(value, index, selectedDocumentation, locale) {
  return (
    <div key={index} role="tabpanel" hidden={value !== index} id={`doc-tab-${index}`}>
      {value === index && (
        <DocumentationItem
          documentationItem={find(selectedDocumentation.documentationItems, ({ language }) => locale === language)}
          language={locale}
        />
      )}
    </div>
  );
}

const Documentation = () => {
  const userInfo = useSelector(state => state.app.userInfo);
  const { selectedDocumentation, languages } = getDocumentationState();
  const dispatch = useDocumentationDispatch();
  const [value, setValue] = useState(0);

  if (isEmpty(selectedDocumentation)) return null;

  const { name, uuid, createdBy, createdDateTime, lastModifiedBy, lastModifiedDateTime } = selectedDocumentation;

  const onDocumentationNameChange = event => {
    dispatch({
      type: "changeDocumentationName",
      payload: {
        uuid: uuid,
        name: event.target.value
      }
    });
  };

  const onSave = async () => {
    dispatch({ type: "saving", payload: true });
    const payload = cloneForSave(selectedDocumentation);
    if (isEmpty(payload.name)) {
      alert("No name provided for the documentation");
      dispatch({ type: "saving", payload: false });
      return;
    }
    const [response, error] = await api.saveDocumentation(payload);
    if (error) {
      dispatch({ type: "saving", payload: false });
      alert(error);
      console.error(response);
    }
    dispatch({ type: "saving", payload: false });
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "#ddd",
        p: 2
      }}
    >
      <TextField id="doc-name" variant="outlined" label="Documentation name" onChange={onDocumentationNameChange} value={name} fullWidth />
      <Tabs value={value} onChange={(e, v) => setValue(v)}>
        {map(languages, locale => (
          <Tab key={locale} label={locale} />
        ))}
      </Tabs>
      {map(languages, (locale, index) => renderDocumentItem(value, index, selectedDocumentation, locale))}
      <SaveComponent
        name="save"
        onSubmit={onSave}
        styleClass={{ marginTop: "14px" }}
        disabledFlag={!UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditDocumentation)}
      />
      <Box
        sx={{
          mt: 2
        }}
      />
      {createdBy && (
        <SystemInfo
          direction="row"
          createdDateTime={createdDateTime}
          lastModifiedDateTime={lastModifiedDateTime}
          createdBy={createdBy}
          lastModifiedBy={lastModifiedBy}
        />
      )}
    </Box>
  );
};

export default Documentation;
