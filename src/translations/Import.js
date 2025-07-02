import DropDown from "../common/components/DropDown";
import FileUpload from "../common/components/FileUpload";
import React, { useEffect, useState } from "react";
import http from "common/utils/httpClient";
import { filter, find, isEmpty, isString, size } from "lodash";
import { Box, Grid } from "@mui/material";
import UserInfo from "../common/model/UserInfo";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";

const noOfKeysWithValues = file => {
  return size(file && file.json) - noOfKeysWithoutValues(file);
};

const noOfKeysWithoutValues = file => {
  return filter(file && file.json, value => ["", undefined, null].includes(value)).length;
};

const isInvalidFile = file => {
  return !file ? false : isEmpty(filter(file && file.json, isString));
};

const ImportTranslations = ({ locales = [], userInfo, onSuccessfulImport }) => {
  const [file, setFile] = useState();
  const [language, setLanguage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInvalidFile(file)) {
      setError("Invalid file format. Please upload a valid file.");
    } else {
      setError("");
    }
  }, [file]);

  const onFileChooseHandler = (content, domFile) => {
    try {
      setFile({ name: domFile.name, json: JSON.parse(content) });
    } catch (error) {
      setFile({ name: domFile.name });
      setError("Invalid file format. Please upload a valid file.");
    }
  };

  const onUploadPressedHandler = () => {
    const languageId = find(locales, local => local.name === language).id;
    http
      .post("/translation", { translations: file.json, language: languageId })
      .then(res => {
        if (res.status === 200) {
          alert("Upload successful");
          onSuccessfulImport();
        }
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data);
        } else {
          alert("Something went wrong while uploading the file");
        }
      });
    setFile();
    setLanguage("");
  };

  return isEmpty(locales) ? (
    <div />
  ) : (
    <Grid container direction="row" spacing={2}>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 4
          }}
        >
          <DropDown name="Language" style={{ width: 120 }} value={language} onChange={setLanguage} options={locales} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 8
          }}
        >
          <FileUpload
            onSelect={onFileChooseHandler}
            onUpload={onUploadPressedHandler}
            canSelect={!isEmpty(language)}
            canUpload={
              noOfKeysWithoutValues(file) === 0 && isEmpty(error) && UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditLanguage)
            }
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          py: 4
        }}
      >
        {!isEmpty(file) && (
          <div>
            <p>Summary:</p>
            <p>File name: {file.name}</p>
            <p>{noOfKeysWithValues(file)} keys have translations.</p>
            <p>{noOfKeysWithoutValues(file)} keys don't have translations.</p>
          </div>
        )}
        <p>{!isEmpty(error) && error}</p>
      </Box>
    </Grid>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default connect(mapStateToProps)(ImportTranslations);
