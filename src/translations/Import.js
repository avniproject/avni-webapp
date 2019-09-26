import DropDown from "../common/components/DropDown";
import FileUpload from "../common/components/FileUpload";
import React, { useState } from "react";
import axios from "axios";
import { find, identity, isEmpty, isNil, sortBy } from "lodash";
import Box from "@material-ui/core/Box";

export default ({ locales = [], onSuccessfulImport }) => {
  const [tableData, setTableData] = useState({});
  const [file, setFile] = useState("");
  const [language, setLanguage] = useState("");

  const onFileChooseHandler = (content, file) => {
    let translations;
    try {
      translations = JSON.parse(content);
    } catch (error) {
      alert(error.message);
      return "Broken JSON file.";
    }
    setFile({ name: file.name, json: translations });
    const incomplete = Object.values(translations).filter(t => t === "").length;
    const complete = Object.keys(translations).length - incomplete;
    setTableData({ complete, incomplete });
  };

  const onUploadPressedHandler = () => {
    const languageId = find(locales, local => local.name === language).id;
    axios
      .post("/translation", { translations: file.json, language: languageId })
      .then(res => {
        if (res.status === 200) {
          alert("Upload successful");
          onSuccessfulImport();
        }
        setTableData({});
        setFile("");
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data);
        } else {
          alert("Something went wrong while uploading the file");
        }
        setTableData({});
        setFile("");
      });
    setFile("");
    setLanguage("");
  };

  return isEmpty(locales) ? (
    <div />
  ) : (
    <React.Fragment>
      <DropDown name="Language" value={language} onChange={setLanguage} options={locales} />
      <FileUpload
        onSelect={onFileChooseHandler}
        onUpload={onUploadPressedHandler}
        canSelect={!isEmpty(language)}
        canUpload={isEmpty(tableData.incomplete) && !isEmpty(language)}
      />
      <Box py={4}>
        {!isEmpty(tableData) && (
          <div>
            <p>Summary:</p>
            <p>File name: {file.name}</p>
            <p>{tableData.complete} keys have translations.</p>
            <p>{tableData.incomplete} keys dont have translations.</p>
          </div>
        )}
      </Box>
    </React.Fragment>
  );
};
