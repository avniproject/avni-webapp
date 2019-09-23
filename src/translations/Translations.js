import React, { useState } from "react";
import axios from "axios";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { find, isEmpty } from "lodash";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { localeChoices } from "../adminApp/user";
import Grid from "@material-ui/core/Grid";

export const Translations = props => {
  const initialTableState = {
    "Complete Keys": 0,
    "Incomplete Keys": 0
  };

  const platforms = [{ id: "Android", name: "Android" }, { id: "Web", name: "Web" }];

  const [tableData, setTableData] = useState(initialTableState);
  const [incompleteCount, setIncomplete] = useState(0);
  const [platform, setPlatform] = useState("");
  const [data, setData] = useState("");
  const [language, setLanguage] = useState("");

  const onFileChooseHandler = event => {
    setTableData(initialTableState);
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    fileReader.onloadend = event => {
      let translations;
      try {
        translations = JSON.parse(event.target.result);
        setData(translations);
      } catch (error) {
        alert(error.message);
        return;
      }
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
  };

  const onUploadPressedHandler = () => {
    if (isEmpty(data) || isEmpty(language)) {
      return alert("Choose File and Language before uploading");
    }
    if (incompleteCount > 0) {
      setData("");
      document.getElementById("file_upload").value = "";
      setIncomplete(0);
      return alert("Can not upload incomplete translation file");
    }
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
    document.getElementById("file_upload").value = "";
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
          <input
            style={{ padding: 10 }}
            id="file_upload"
            type="file"
            onChange={onFileChooseHandler}
          />
          <div className="box has-text-centered">
            <button className="button" onClick={onUploadPressedHandler}>
              Upload
            </button>
          </div>
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
