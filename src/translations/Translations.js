import React, { useEffect, useState } from "react";
import axios from "axios";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { find, identity, isEmpty, isNil, sortBy } from "lodash";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Grid from "@material-ui/core/Grid";
import { getOrgConfig } from "./reducers/onLoadReducer";
import { connect } from "react-redux";
import { getLocales } from "../common/utils";
import FileUpload from "../common/components/FileUpload";

export const Translations = ({ user, organisation, organisationConfig, getOrgConfig }) => {
  useEffect(() => {
    getOrgConfig();
  }, []);

  const initialTableState = {
    "Complete Keys": 0,
    "Incomplete Keys": 0
  };

  const platforms = [{ id: "Android", name: "Android" }, { id: "Web", name: "Web" }];
  const localeChoices = organisationConfig && getLocales(organisationConfig);

  const [tableData, setTableData] = useState(initialTableState);
  const [incompleteCount, setIncomplete] = useState(0);
  const [platform, setPlatform] = useState("");
  const [data, setData] = useState("");
  const [language, setLanguage] = useState("");

  const onFileChooseHandler = content => {
    setTableData(initialTableState);
    let translations;
    try {
      translations = JSON.parse(content);
    } catch (error) {
      alert(error.message);
      return "Broken JSON file.";
    }
    setData(translations);
    const incomplete = Object.values(translations).filter(t => t === "").length;
    if (incomplete > 0) {
      setIncomplete(incomplete);
    }
    const complete = Object.keys(translations).length - incomplete;
    setTableData({
      "Complete Keys": complete,
      "Incomplete Keys": incomplete
    });
  };

  const onUploadPressedHandler = () => {
    const languageId = find(localeChoices, local => local.name === language).id;
    axios
      .post("/translation", { translations: data, language: languageId })
      .then(res => {
        if (res.status === 200) {
          alert("upload successful");
        }
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data);
        } else {
          alert("Something went wrong while uploading the file");
        }
      });
    setData("");
    setLanguage("");
  };

  const onDownloadPressedHandler = () => {
    if (isEmpty(platform)) {
      return alert("Please choose platform to download translation file");
    }
    const platformId = find(platforms, p => p.name === platform).id;
    return axios({
      url: "/translation",
      method: "GET",
      params: { platform: platformId }
    })
      .then(response => {
        const zip = new JSZip();
        const folder = zip.folder("locale");
        response.data.forEach(data =>
          folder.file(data.language + ".json", JSON.stringify(data.translationJson))
        );
        zip.generateAsync({ type: "blob" }).then(content => saveAs(content, "translations.zip"));
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Something went wrong while downloading this file");
        }
      });
  };

  const renderTable = () => (
    <tr>
      <td>{tableData["Complete Keys"]}</td>
      <td>{tableData["Incomplete Keys"]}</td>
    </tr>
  );

  const renderTableHeader = () => {
    let header = Object.keys(tableData);
    return header.map((key, index) => {
      return <th key={index}>{key}</th>;
    });
  };

  const renderOptions = (name, state, handler, choices) => (
    <FormControl required>
      <InputLabel htmlFor={`${name}-required`}>{name}</InputLabel>
      <Select
        native
        value={state}
        onChange={event => handler(event.target.value)}
        name={name}
        inputProps={{ id: `${name}-required` }}
      >
        <option value="" />
        {choices.map((option, index) => (
          <option key={index} value={option.name}>
            {option.name}
          </option>
        ))}
      </Select>
      <FormHelperText>Required</FormHelperText>
    </FormControl>
  );

  if (isNil(organisationConfig)) return <ScreenWithAppBar appbarTitle={`Loading`} />;

  return (
    <ScreenWithAppBar appbarTitle={`Translations`}>
      <div id={"margin"}>
        <div style={{ marginBottom: 30 }}>
          <h1 id="title">Translations Dashboard</h1>
          <table id="translation">
            <tbody>
              <tr>{renderTableHeader()}</tr>
              {renderTable()}
            </tbody>
          </table>
        </div>
        <Grid container direction="row" justify="flex-start" alignItems="center">
          {renderOptions("Language", language, setLanguage, localeChoices)}
          <FileUpload
            onSelect={onFileChooseHandler}
            onUpload={onUploadPressedHandler}
            canSelect={!isEmpty(language)}
            canUpload={incompleteCount === 0 && !isEmpty(language)}
          />
        </Grid>
        <p />
        <Grid container direction="row" justify="flex-start" alignItems="center" m={3}>
          {renderOptions("Platform", platform, setPlatform, platforms)}
          <div style={{ padding: 15 }} className="box has-text-centered">
            <button className="button" onClick={onDownloadPressedHandler}>
              Download
            </button>
          </div>
        </Grid>
      </div>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.translations.onLoad.organisationConfig
});

export default connect(
  mapStateToProps,
  { getOrgConfig }
)(Translations);
