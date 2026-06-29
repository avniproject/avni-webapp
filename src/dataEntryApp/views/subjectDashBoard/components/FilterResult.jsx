import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Modal from "../components/CommonModal";
import DialogContent from "@mui/material/DialogContent";
import { noop } from "lodash";
import CancelIcon from "@mui/icons-material/Cancel";

const StyledForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const StyledGrid = styled(Grid)({
  justifyContent: "flex-end",
  alignItems: "center",
});

const StyledIconButton = styled(IconButton)({
  fontSize: "13px",
  color: "#212529",
  padding: "4px 8px",
  "&:hover": {
    backgroundColor: "#fff",
  },
  "&:focus": {
    outline: "0",
  },
});

const StyledCancelIcon = styled(CancelIcon)({
  fontSize: "14px",
});

const filterButtonStyle = {
  height: "28px",
  zIndex: 1,
  marginTop: "1px",
  boxShadow: "none",
  backgroundColor: "#0e6eff",
};

const applyButtonStyle = {
  float: "left",
  backgroundColor: "#f27510",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510",
  },
};

const cancelButtonStyle = {
  float: "left",
  backgroundColor: "#F8F9F9",
  color: "#fc9153",
  border: "1px solid #fc9153",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#F8F9F9",
  },
};

const FilterResult = ({ encounterTypes, setFilterParams }) => {
  const { t } = useTranslation();
  const [selectedVisitTypes, setVisitTypes] = useState(null);

  const visitTypesChange = (event) => {
    if (event.target.checked) {
      setVisitTypes({
        ...selectedVisitTypes,
        [event.target.name]: event.target.checked,
      });
    } else {
      setVisitTypes({
        ...selectedVisitTypes,
        [event.target.name]: event.target.checked,
      });
    }
  };

  const applyClick = () => {
    let filterParams = {};

    const SelectedvisitTypesListSort =
      selectedVisitTypes != null
        ? Object.keys(selectedVisitTypes)
            .filter((selectedId) => selectedVisitTypes[selectedId])
            .map(String)
        : [];

    if (SelectedvisitTypesListSort.length > 0) {
      const SelectedvisitTypesList = [
        ...new Set(SelectedvisitTypesListSort.map((item) => item)),
      ];
      filterParams.encounterTypeUuids = SelectedvisitTypesList.join();
    }
    setFilterParams(filterParams);
  };

  const resetClick = () => {
    setVisitTypes(null);
  };

  const content = (
    <DialogContent>
      <StyledGrid container direction="row">
        <StyledIconButton
          color="secondary"
          onClick={resetClick}
          aria-label={t("resetAll")}
          size="small"
        >
          <StyledCancelIcon /> {t("resetAll")}
        </StyledIconButton>
      </StyledGrid>
      <StyledForm noValidate>
        <FormLabel component="legend">{t("visitType")}</FormLabel>
        <FormGroup row>
          {encounterTypes.map((visitType) => (
            <FormControlLabel
              key={visitType.uuid}
              control={
                <Checkbox
                  checked={
                    selectedVisitTypes != null
                      ? selectedVisitTypes[visitType.uuid]
                      : false
                  }
                  onChange={visitTypesChange}
                  name={visitType.uuid}
                  color="primary"
                />
              }
              label={t(visitType.name)}
            />
          ))}
        </FormGroup>
      </StyledForm>
    </DialogContent>
  );

  return (
    <Modal
      content={content}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("filterResults"),
          sx: filterButtonStyle,
        },
        {
          buttonType: "applyButton",
          label: t("apply"),
          sx: applyButtonStyle,
          redirectTo: `/app/completeVisit`,
          click: applyClick,
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          sx: cancelButtonStyle,
        },
      ]}
      title={t("filterResults")}
      btnHandleClose={noop}
    />
  );
};

export default FilterResult;
