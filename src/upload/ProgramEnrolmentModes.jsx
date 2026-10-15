import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material";

export const PROGRAM_ENROLMENT_MODES = {
  UPLOAD: "upload_enrolments",
  UPLOAD_EXITED: "upload_exited_enrolments",
  EXIT_ENROLMENTS: "exit_enrolments",
};

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ProgramEnrolmentModes = ({
  mode = PROGRAM_ENROLMENT_MODES.UPLOAD,
  setMode,
}) => {
  const { t } = useTranslation();
  const handleChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <StyledFormControl component="fieldset">
      <FormLabel component="legend">
        {t("selectEnrolmentMode", "Select Enrolment Mode")}
      </FormLabel>
      <RadioGroup
        row
        aria-label="program-enrolment-mode"
        name="program-enrolment-mode"
        value={mode}
        onChange={handleChange}
      >
        <Tooltip
          title={t(
            "uploadEnrolmentsTooltip",
            "Upload program enrolments in their active state (default)",
          )}
          placement="bottom-start"
          arrow
        >
          <FormControlLabel
            value={PROGRAM_ENROLMENT_MODES.UPLOAD}
            control={<Radio color="primary" />}
            label={t("uploadEnrolments", "Upload enrolments")}
          />
        </Tooltip>
        <Tooltip
          title={t(
            "uploadHistoricalExitedEnrolmentsTooltip",
            "Upload enrolments that began and ended in the source organisation; one row carries both enrolment and exit observations",
          )}
          placement="bottom-start"
          arrow
        >
          <FormControlLabel
            value={PROGRAM_ENROLMENT_MODES.UPLOAD_EXITED}
            control={<Radio color="primary" />}
            label={t(
              "uploadHistoricalExitedEnrolments",
              "Upload historical exited enrolments",
            )}
          />
        </Tooltip>
        <Tooltip
          title={t(
            "exitEnrolmentsTooltip",
            "Exit enrolments that are already in Avni; each row names the enrolment by its Program Enrolment Id",
          )}
          placement="bottom-start"
          arrow
        >
          <FormControlLabel
            value={PROGRAM_ENROLMENT_MODES.EXIT_ENROLMENTS}
            control={<Radio color="primary" />}
            label={t("exitEnrolments", "Exit enrolments")}
          />
        </Tooltip>
      </RadioGroup>
    </StyledFormControl>
  );
};

ProgramEnrolmentModes.propTypes = {
  mode: PropTypes.string,
  setMode: PropTypes.func.isRequired,
};

export default ProgramEnrolmentModes;
