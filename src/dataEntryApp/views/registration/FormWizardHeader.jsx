import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { LineBreak } from "common/components/utils";

import { isNil, isDate } from "lodash";
import { AgeUtil } from "openchs-models";

const StyledRoot = styled("div")(({ theme }) => ({
  color: "rgba(0, 0, 0, 0.54)",
  backgroundColor: "#F8F9F9",
  height: 40,
  width: "100%",
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1.25), // 10px
}));

const StyledTypographyValue = styled(Typography)({
  color: "#000",
  fontWeight: "bold",
});

const StyledTypographyLabel = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

function addElement(label, value, headerElements, key) {
  const insertSeparator = headerElements?.length !== 0;
  headerElements.push(
    <StyledTypographyLabel variant="caption" key={`${key}-1`}>
      {(insertSeparator ? " | " : "") + label + ": "}
    </StyledTypographyLabel>,
  );
  headerElements.push(
    <StyledTypographyValue variant="caption" key={`${key}-2`}>
      {value}
    </StyledTypographyValue>,
  );
  return headerElements;
}

const FormWizardHeader = ({ subject }) => {
  const { i18n, t } = useTranslation();
  let headerElements = [];

  const fullName = subject.nameString || "-";
  headerElements = addElement(t("name"), fullName, headerElements, "fw-name");

  if (subject.isPerson()) {
    const dateOfBirth = isDate(subject.dateOfBirth)
      ? AgeUtil.getDisplayAge(subject.dateOfBirth, i18n)
      : null;
    headerElements =
      dateOfBirth &&
      addElement(t("age"), dateOfBirth, headerElements, "fw-age");
    const gender =
      subject.gender && !isNil(subject.gender.name) ? subject.gender.name : "-";
    headerElements = addElement(
      t("gender"),
      gender,
      headerElements,
      "fw-gender",
    );
  }
  const lowestAddressLevel = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.name || "-"
    : "";
  const lowestAddressLevelType = subject.lowestAddressLevel
    ? t(subject.lowestAddressLevel.type) || "-"
    : "";
  headerElements = addElement(
    lowestAddressLevelType,
    lowestAddressLevel,
    headerElements,
    "fw-address",
  );

  return (
    <StyledRoot>
      {headerElements}
      <LineBreak num={2} />
    </StyledRoot>
  );
};

export default FormWizardHeader;
