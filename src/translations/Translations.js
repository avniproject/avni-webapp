import React, { useState } from "react";
import axios from "axios";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import { forEach, isEmpty, isNull } from "lodash";
import Box from "@material-ui/core/Box";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

export const Translations = props => {
  const initialTableState = {
    data: [
      {
        language: "",
        complete: 0,
        incomplete: 0
      }
    ]
  };

  const platforms = {
    Android: "Android",
    Web: "Web"
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState(initialTableState);
  const [incompleteCount, setIncomplete] = useState(0);
  const [platform, setPlatform] = useState("");

  const onFileChooseHandler = event => {
    setTableData(initialTableState);
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    fileReader.onloadend = event => {
      let translations;
      try {
        translations = JSON.parse(event.target.result);
      } catch (error) {
        alert(error.message);
        return;
      }
      const data = [];
      forEach(Object.keys(translations), language => {
        const translation = translations[language];
        const incomplete = Object.values(translation).filter(t => t === "").length;
        if (incomplete > 0) {
          setIncomplete(incomplete);
        }
        const complete = Object.keys(translation).length - incomplete;
        data.push({
          language,
          complete,
          incomplete
        });
      });
      setTableData({ data });
    };
    setSelectedFile(event.target.files[0]);
  };

  const onUploadPressedHandler = () => {
    if (isNull(selectedFile)) {
      return alert("Choose File before uploading");
    }
    if (incompleteCount > 0) {
      setSelectedFile(null);
      document.getElementById("file_upload").value = "";
      setIncomplete(0);
      return alert("Can not upload incomplete translation file");
    }
    const data = new FormData();
    data.append("translationFile", selectedFile);
    axios
      .post("/translation", data)
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
    setSelectedFile(null);
    document.getElementById("file_upload").value = "";
  };

  const onPlatformChangeHandler = event => setPlatform(platforms[event.target.value]);

  const onDownloadPressedHandler = () => {
    if (isEmpty(platform)) {
      return alert("Please choose platform to download translation file");
    }
    return axios({
      url: "/translation",
      method: "GET",
      params: { platform: platform },
      responseType: "blob"
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "translations.json");
        document.body.appendChild(link);
        link.click();
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("Something went wrong while downloading this file");
        }
      });
  };

  const renderTable = props => {
    return tableData.data.map(({ language, complete, incomplete }, index) => (
      <tr key={index}>
        <td>{language}</td>
        <td>{complete}</td>
        <td>{incomplete}</td>
      </tr>
    ));
  };

  const renderTableHeader = () => {
    let header = Object.keys(tableData.data[0]);
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  return (
    <ScreenWithAppBar appbarTitle={`Translations`}>
      <div>
        <h1 id="title">Translations Dashboard</h1>
        <table id="translation">
          <tbody>
            <tr>{renderTableHeader()}</tr>
            {renderTable()}
          </tbody>
        </table>
      </div>
      <Box id="inline" component="span" m={1}>
        <input id="file_upload" type="file" onChange={onFileChooseHandler} />
        <div className="box has-text-centered">
          <button className="button" onClick={onUploadPressedHandler}>
            Upload
          </button>
        </div>
      </Box>
      <p />
      <Box id="inline" component="span" m={1}>
        <FormControl required>
          <InputLabel htmlFor="platform-required">Platform</InputLabel>
          <Select
            native
            value={platform}
            onChange={onPlatformChangeHandler}
            name="Platform"
            inputProps={{
              id: "platform-required"
            }}
          >
            <option value="" />
            {Object.keys(platforms).map((platform, index) => (
              <option key={index} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>
        <button className="button" onClick={onDownloadPressedHandler}>
          Download
        </button>
      </Box>
    </ScreenWithAppBar>
  );
};
