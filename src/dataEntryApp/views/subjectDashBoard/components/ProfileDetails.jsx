import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Typography,
  DialogContent,
  FormControl,
  InputLabel,
  NativeSelect,
  Fab,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import Modal from "./CommonModal";
import { getPrograms } from "../../../reducers/programReducer";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { CommentDrawer } from "./comments/CommentDrawer";
import { Comment } from "@mui/icons-material";
import { selectOrganisationConfig } from "../../../sagas/selectors";
import { get, isNil, isEmpty } from "lodash";
import { ExtensionOption } from "./extension/ExtensionOption";
import { extensionScopeTypes } from "../../../../formDesigner/components/Extensions/ExtensionReducer";
import SubjectProfilePicture from "../../../components/SubjectProfilePicture";
import { AgeUtil } from "openchs-models";

const StyledTableView = styled("div")(({ theme }) => ({
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2.5),
}));

const StyledMainHeading = styled(Typography)({
  fontSize: "20px",
  fontWeight: "500",
});

const StyledGrid = styled(Grid)(({ theme }) => ({
  container: true,
  spacing: theme.spacing(1),
  alignItems: "center",
}));

const StyledProfileStack = styled(Stack)({
  container: true,
  alignItems: "left",
});

const StyledRightStack = styled(Stack)(({ theme }) => ({
  alignItems: "flex-start",
  display: "flex",
  width: "100%",
}));

const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(1.25),
}));

const StyledTableCell = styled(TableCell)({
  color: "#555555",
  fontSize: "12px",
  borderBottom: "none",
  padding: "0px 0px 0px 11px",
  fontWeight: "500",
});

const StyledTableCellDetails = styled(TableCell)({
  borderBottom: "none",
  padding: "0px 21px 0px 11px",
  fontWeight: "500",
  color: "#1010101",
  fontSize: "14px",
});

const StyledEnrollButton = styled(Fab)({
  backgroundColor: "#f27510",
  height: "38px",
  zIndex: 1,
  boxShadow: "none",
  whiteSpace: "nowrap",
  alignSelf: "flex-start",
});

const StyledCommentButton = styled(Fab)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: "#f27510",
  height: "38px",
  zIndex: 1,
  boxShadow: "none",
  whiteSpace: "nowrap",
}));

const sxEnrollButton = {
  backgroundColor: "#f27510",
  height: "38px",
  zIndex: 1,
  boxShadow: "none",
  whiteSpace: "nowrap",
  alignSelf: "flex-start",
};

const sxSaveButton = {
  float: "left",
  backgroundColor: "#fc9153",
  height: "30px",
};

const sxCancelButton = {
  float: "left",
  backgroundColor: "#F8F9F9",
  color: "#fc9153",
  border: "1px solid #fc9153",
  height: "30px",
};

const StyledForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  margin: "auto",
  minWidth: "450px",
  minHeight: "170px",
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  minWidth: 120,
  width: "211px",
}));

const StyledInputLabel = styled(InputLabel)(({ error }) => ({
  color: error ? "red" : undefined,
}));

const StyledNativeSelect = styled(NativeSelect)({
  width: "211px",
});

const StyledError = styled("div")({
  color: "red",
  padding: "3px",
  fontSize: "12px",
});

const ProfilePictureWrapper = styled("div")({
  width: "150px",
  height: "150px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  marginBottom: "16px",
  "& .MuiBox-root": {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    },
  },
});

const StyledProfilePicture = (props) => (
  <ProfilePictureWrapper>
    <SubjectProfilePicture size={200} {...props} />
  </ProfilePictureWrapper>
);

const ProfileDetails = ({ profileDetails, subjectUuid }) => {
  const dispatch = useDispatch();
  const programs = useSelector(
    (state) => state.dataEntry.programs?.programs || "",
  );
  const load = useSelector((state) => state.dataEntry.loadReducer.load);
  const tabsStatus = useSelector(
    (state) => state.dataEntry.subjectProfile.tabsStatus,
  );
  const organisationConfigs = useSelector(
    (state) => state.dataEntry.metadata.organisationConfigs,
  );

  const [selectedProgram, setSelectedProgram] = useState("");
  const [openComment, setOpenComment] = useState(false);
  const [errorStatus, setError] = useState(false);

  const orgConfig = useSelector(selectOrganisationConfig);
  const enableComment = get(orgConfig, "settings.enableComments", false);

  const handleChange = (event) => {
    setSelectedProgram(event.target.value);
    setError(!event.target.value);
  };

  const handleError = (isError) => {
    setError(isError);
  };

  const { i18n, t } = useTranslation();

  useEffect(() => {
    dispatch(getPrograms(subjectUuid));
  }, [dispatch, subjectUuid]);

  const close = () => {
    return true;
  };

  const isMultipleProgramEligible = !isNil(programs)
    ? programs.length > 1
    : isNil(programs);

  const content = (
    <DialogContent>
      <StyledForm noValidate>
        <StyledFormControl>
          <StyledInputLabel
            shrink
            id="demo-simple-select-placeholder-label-label"
            error={errorStatus}
          >
            {t("Program")}
          </StyledInputLabel>
          <StyledNativeSelect
            value={selectedProgram}
            onChange={handleChange}
            inputProps={{
              name: "selected_program",
              id: "selected_program-native-helper",
            }}
            error={errorStatus}
          >
            <option key={"emptyElement"} value="" />
            {programs
              ? programs.map((element, index) => (
                  <option key={index} value={element.name}>
                    {t(element.name)}
                  </option>
                ))
              : ""}
          </StyledNativeSelect>
          {errorStatus && (
            <StyledError>Please select program to enrol.</StyledError>
          )}
        </StyledFormControl>
      </StyledForm>
    </DialogContent>
  );

  const allowEnrolment =
    tabsStatus &&
    tabsStatus.showProgramTab &&
    !profileDetails.voided &&
    isMultipleProgramEligible;

  return (
    <StyledTableView>
      <CommentDrawer
        open={openComment}
        setOpen={setOpenComment}
        subjectUUID={subjectUuid}
      />
      <CustomizedBackdrop load={load} />
      <StyledMainHeading component="span">{`${
        profileDetails.nameString
      }`}</StyledMainHeading>
      <StyledGrid>
        <StyledProfileStack>
          <Grid>
            <StyledProfilePicture
              allowEnlargementOnClick={false}
              firstName={profileDetails.firstName}
              profilePicture={profileDetails.profilePicture}
              subjectType={profileDetails.subjectType}
              subjectTypeName={profileDetails.subjectType.name}
            />
            <StyledRightStack>
              <ExtensionOption
                subjectUUIDs={profileDetails.uuid}
                typeUUID={profileDetails.subjectType.uuid}
                typeName={profileDetails.subjectType.name}
                scopeType={extensionScopeTypes.subjectDashboard}
                configExtensions={get(
                  organisationConfigs,
                  "organisationConfig.extensions",
                )}
              />
              <Grid>
                {enableComment && (
                  <StyledCommentButton
                    id="comments"
                    variant="extended"
                    color="primary"
                    aria-label="add"
                    onClick={() => setOpenComment(true)}
                  >
                    <Comment style={{ marginRight: 4 }} />
                    {t("comments")}
                  </StyledCommentButton>
                )}
              </Grid>
              <Grid>
                {allowEnrolment ? (
                  <Modal
                    content={content}
                    handleError={handleError}
                    buttonsSet={[
                      {
                        buttonType: "openButton",
                        label: t("enrolInProgram"),
                        sx: sxEnrollButton,
                      },
                      {
                        buttonType: "saveButton",
                        label: t("Enrol"),
                        sx: sxSaveButton,
                        redirectTo: `/app/subject/enrol?uuid=${subjectUuid}&programName=${selectedProgram}&formType=ProgramEnrolment&subjectTypeName=${
                          profileDetails.subjectType.name
                        }`,
                        requiredField: selectedProgram,
                        handleError: handleError,
                      },
                      {
                        buttonType: "cancelButton",
                        label: t("Cancel"),
                        sx: sxCancelButton,
                      },
                    ]}
                    title={t("Enrol in program")}
                    btnHandleClose={close}
                  />
                ) : (
                  !isEmpty(programs) && (
                    <Link
                      to={`/app/subject/enrol?uuid=${subjectUuid}&programName=${
                        programs[0].name
                      }&formType=ProgramEnrolment&subjectTypeName=${
                        profileDetails.subjectType.name
                      }`}
                    >
                      <StyledEnrollButton
                        id={programs[0].name}
                        variant="extended"
                        color="primary"
                        aria-label="add"
                      >
                        {t(`Enrol in ${programs[0].name}`)}
                      </StyledEnrollButton>
                    </Link>
                  )
                )}
              </Grid>
            </StyledRightStack>
          </Grid>
          <Grid>
            <StyledTable aria-label="caption table">
              <TableHead>
                <TableRow>
                  {profileDetails.subjectType.isPerson() && (
                    <StyledTableCell>{t("gender")}</StyledTableCell>
                  )}
                  {profileDetails.subjectType.isPerson() && (
                    <StyledTableCell>{t("age")}</StyledTableCell>
                  )}
                  {profileDetails.lowestAddressLevel.titleLineage && (
                    <StyledTableCell>{t("Address")}</StyledTableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {profileDetails.subjectType.isPerson() && (
                    <StyledTableCellDetails>
                      {t(profileDetails.gender.name)}
                    </StyledTableCellDetails>
                  )}
                  {profileDetails.subjectType.isPerson() && (
                    <StyledTableCellDetails>
                      {profileDetails.dateOfBirth
                        ? AgeUtil.getDisplayAge(
                            profileDetails.dateOfBirth,
                            i18n,
                          )
                        : "-"}
                    </StyledTableCellDetails>
                  )}
                  <StyledTableCellDetails>
                    {profileDetails.lowestAddressLevel.titleLineage}
                  </StyledTableCellDetails>
                </TableRow>
              </TableBody>
            </StyledTable>
          </Grid>
        </StyledProfileStack>
      </StyledGrid>
    </StyledTableView>
  );
};

export default ProfileDetails;
