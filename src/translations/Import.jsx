import DropDown from "../common/components/DropDown";
import FileUpload from "../common/components/FileUpload";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { httpClient as http } from "common/utils/httpClient";
import { filter, find, isEmpty, isString, size } from "lodash";
import { Box, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import UserInfo from "../common/model/UserInfo";
import { Privilege } from "openchs-models";

const noOfKeysWithValues = (file) => {
  console.log(file);
  return size(file && file.json) - noOfKeysWithoutValues(file);
};

const noOfKeysWithoutValues = (file) => {
  return filter(file && file.json, (value) =>
    ["", undefined, null].includes(value),
  ).length;
};

const isInvalidFile = (file) => {
  if (!file || !file.json) return false;
  return Object.values(file.json).some((value) => typeof value !== "string");
};

const ImportTranslations = ({ locales = [], onSuccessfulImport }) => {
  const userInfo = useSelector((state) => state.app.userInfo);
  const theme = useTheme();

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
    const languageId = find(locales, (local) => local.name === language).id;
    http
      .post("/translation", { translations: file.json, language: languageId })
      .then((res) => {
        if (res.status === 200) {
          alert("Upload successful");
          onSuccessfulImport();
        }
      })
      .catch((error) => {
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
    <Box>
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        <Grid item>
          <DropDown
            name="Language"
            label="Language"
            value={language}
            onChange={setLanguage}
            options={locales}
          />
        </Grid>

        <Grid item>
          <FileUpload
            onSelect={onFileChooseHandler}
            onUpload={onUploadPressedHandler}
            canSelect={!isEmpty(language)}
            canUpload={
              file &&
              //  &&
              // noOfKeysWithoutValues(file) === 0
              isEmpty(error) &&
              UserInfo.hasPrivilege(
                userInfo,
                Privilege.PrivilegeType.EditLanguage,
              )
            }
          />
        </Grid>
      </Grid>

      <Grid container sx={{ mt: 2 }}>
        <Grid item xs={12}>
          {!isEmpty(file) && (
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <p>
                <strong>Summary:</strong>
              </p>
              <p>File name: {file.name}</p>
              <p>{noOfKeysWithValues(file)} keys have translations.</p>
              <p>{noOfKeysWithoutValues(file)} keys don't have translations.</p>
            </Box>
          )}
          {!isEmpty(error) && (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: theme.palette.error.light,
                borderRadius: 1,
                mt: 1,
              }}
            >
              <p style={{ color: theme.palette.error.main }}>{error}</p>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImportTranslations;
