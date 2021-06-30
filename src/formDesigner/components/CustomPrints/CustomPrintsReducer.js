import { filter, forEach, isEmpty, isNil, some, map } from "lodash";

export const printScopeTypes = Object.freeze({
  subjectDashboard: "Subject Dashboard",
  programEnrolment: "Program Enrolment"
});

export const CustomPrintsReducer = (customPrint, action) => {
  switch (action.type) {
    case "setLabel":
      return { ...customPrint, ...updatePropertyAtIndex(customPrint, "label", action.payload) };
    case "setFileName":
      return { ...customPrint, ...updatePropertyAtIndex(customPrint, "fileName", action.payload) };
    case "setScope":
      return {
        ...customPrint,
        ...updatePropertyAtIndex(customPrint, "printScope", action.payload)
      };
    case "newSetting":
      const { labelFileNames } = customPrint;
      labelFileNames.push({ label: "", fileName: "" });
      return { ...customPrint, labelFileNames };
    case "removeSetting":
      const settings = customPrint.labelFileNames;
      settings.splice(action.payload.index, 1);
      const updatedErrors = filter(customPrint.errors, ({ key }) => key !== "EMPTY_SETTING");
      return { ...customPrint, labelFileNames: settings, errors: updatedErrors };
    case "setErrors":
      return { ...customPrint, errors: action.payload };
    case "setFile":
      const errors = filter(customPrint.errors, ({ key }) => key !== "EMPTY_FILE");
      return { ...customPrint, file: action.payload, errors };
    case "setData":
      const printSettings = isEmpty(action.payload)
        ? [{ label: "", fileName: "" }]
        : action.payload;
      return { ...customPrint, labelFileNames: printSettings };
    case "setScopeOptions":
      const { subjectTypes, programs } = action.payload;
      const dashboardOptions = map(subjectTypes, ({ operationalSubjectTypeName, uuid }) => ({
        scopeType: printScopeTypes.subjectDashboard,
        name: operationalSubjectTypeName,
        uuid
      }));
      const programOptions = map(programs, ({ operationalProgramName, uuid }) => ({
        scopeType: printScopeTypes.programEnrolment,
        name: operationalProgramName,
        uuid
      }));
      return { ...customPrint, scopeOptions: [...dashboardOptions, ...programOptions] };
    default:
      return customPrint;
  }
};

export const checkForErrors = customPrint => {
  const errors = [];
  if (isNil(customPrint.file)) {
    errors.push({ key: "EMPTY_FILE", message: "File cannot be empty" });
  } else if (customPrint.file.type !== "application/zip") {
    errors.push({ key: "EMPTY_FILE", message: "Only zip file upload allowed" });
  }
  const isLabelFileEmpty = some(
    customPrint.labelFileNames,
    ({ label, fileName, printScope }) => isEmpty(label) || isNil(fileName) || isEmpty(printScope)
  );
  if (isLabelFileEmpty) {
    errors.push({
      key: "EMPTY_SETTING",
      message: "Label, File name or Print scope cannot be empty"
    });
  }
  return errors;
};

const updatePropertyAtIndex = (customPrint, property, payload) => {
  forEach(customPrint.labelFileNames, (labelFile, i) => {
    if (i === payload.index) {
      return (labelFile[property] = payload.value);
    } else {
      return labelFile;
    }
  });
  const errors = filter(customPrint.errors, ({ key }) => key !== "EMPTY_SETTING");
  return { labelFileNames: customPrint.labelFileNames, errors };
};
