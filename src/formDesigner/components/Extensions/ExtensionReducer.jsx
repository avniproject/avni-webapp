import { filter, forEach, isEmpty, isNil, some, map } from "lodash";

export const extensionScopeTypes = Object.freeze({
  subjectDashboard: "Subject Dashboard",
  programEnrolment: "Program Enrolment",
  searchResults: "Search Results",
  fieldAppHomeScreen: "Field App Home Screen",
  generic: "Generic"
});

export const ExtensionReducer = (extension, action) => {
  switch (action.type) {
    case "setLabel":
      return {
        ...extension,
        ...updatePropertyAtIndex(extension, "label", action.payload)
      };
    case "setFileName":
      return {
        ...extension,
        ...updatePropertyAtIndex(extension, "fileName", action.payload)
      };
    case "setScope":
      return {
        ...extension,
        ...updatePropertyAtIndex(extension, "extensionScope", action.payload)
      };
    case "newSetting":
      const { labelFileNames } = extension;
      labelFileNames.push({ label: "", fileName: "" });
      return { ...extension, labelFileNames };
    case "removeSetting":
      const settings = extension.labelFileNames;
      settings.splice(action.payload.index, 1);
      const updatedErrors = filter(
        extension.errors,
        ({ key }) => key !== "EMPTY_SETTING"
      );
      return { ...extension, labelFileNames: settings, errors: updatedErrors };
    case "setErrors":
      return { ...extension, errors: action.payload };
    case "setFile":
      const errors = filter(
        extension.errors,
        ({ key }) => key !== "EMPTY_FILE"
      );
      return { ...extension, file: action.payload, errors };
    case "setData":
      const extensionSettings = isEmpty(action.payload)
        ? [{ label: "", fileName: "" }]
        : action.payload;
      return { ...extension, labelFileNames: extensionSettings };
    case "setScopeOptions":
      const { subjectTypes, programs } = action.payload;
      const dashboardOptions = map(
        subjectTypes,
        ({ operationalSubjectTypeName, uuid }) => ({
          scopeType: extensionScopeTypes.subjectDashboard,
          name: operationalSubjectTypeName,
          uuid
        })
      );
      const programOptions = map(
        programs,
        ({ operationalProgramName, uuid }) => ({
          scopeType: extensionScopeTypes.programEnrolment,
          name: operationalProgramName,
          uuid
        })
      );
      const searchResultOption = {
        scopeType: extensionScopeTypes.searchResults,
        name: "Search Results",
        uuid: ""
      };
      const fieldAppHomeScreenOption = {
        scopeType: extensionScopeTypes.fieldAppHomeScreen,
        name: "Field App Home Screen",
        uuid: ""
      };
      const genericOption = {
        scopeType: extensionScopeTypes.generic,
        name: "Generic",
        uuid: ""
      };
      return {
        ...extension,
        scopeOptions: [
          ...dashboardOptions,
          ...programOptions,
          searchResultOption,
          fieldAppHomeScreenOption,
          genericOption
        ]
      };
    default:
      return extension;
  }
};

export const checkForErrors = extension => {
  const errors = [];
  if (isNil(extension.file)) {
    errors.push({ key: "EMPTY_FILE", message: "File cannot be empty" });
  } else if (extension.file.type !== "application/zip") {
    errors.push({ key: "EMPTY_FILE", message: "Only zip file upload allowed" });
  }
  const isLabelFileEmpty = some(
    extension.labelFileNames,
    ({ label, fileName, extensionScope }) =>
      isEmpty(label) || isNil(fileName) || isEmpty(extensionScope)
  );
  if (isLabelFileEmpty) {
    errors.push({
      key: "EMPTY_SETTING",
      message: "Label, File name or Extension scope cannot be empty"
    });
  }
  return errors;
};

const updatePropertyAtIndex = (extension, property, payload) => {
  forEach(extension.labelFileNames, (labelFile, i) => {
    if (i === payload.index) {
      return (labelFile[property] = payload.value);
    } else {
      return labelFile;
    }
  });
  const errors = filter(extension.errors, ({ key }) => key !== "EMPTY_SETTING");
  return { labelFileNames: extension.labelFileNames, errors };
};
