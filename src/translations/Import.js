import DropDown from "../common/components/DropDown";
import FileUpload from "../common/components/FileUpload";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { filter, find, isEmpty, isString, reject, size } from "lodash";
// import { styled } from '@material-ui/core/styles';
// import { compose, spacing, palette } from '@material-ui/system';
// const Box = styled('div')(
//     compose(
//       spacing,
//       palette,
//     ),
// );

const noOfKeysWithValues = file => {
  return size(file && file.json) - noOfKeysWithoutValues(file);
};

const noOfKeysWithoutValues = file => {
  return filter(file && file.json, value => ["", undefined, null].includes(value)).length;
};

const isInvalidFile = file => {
  return !isEmpty(reject(file && file.json, isString));
};

export default ({ locales = [], onSuccessfulImport }) => {
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
    axios
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
    <React.Fragment>
      <DropDown
        name="Language"
        style={{ width: 120 }}
        value={language}
        onChange={setLanguage}
        options={locales}
      />
      <FileUpload
        onSelect={onFileChooseHandler}
        onUpload={onUploadPressedHandler}
        canSelect={!isEmpty(language)}
        canUpload={noOfKeysWithoutValues(file) === 0 && isEmpty(error)}
      />
      <div py={4}>
        {!isEmpty(file) && (
          <div>
            <p>Summary:</p>
            <p>File name: {file.name}</p>
            <p>{noOfKeysWithValues(file)} keys have translations.</p>
            <p>{noOfKeysWithoutValues(file)} keys don't have translations.</p>
          </div>
        )}
        <p>{!isEmpty(error) && error}</p>
      </div>
    </React.Fragment>
  );
};
