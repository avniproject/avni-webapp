import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import Modal from "./CommonModal";
import { noop } from "lodash";
import { searchSubjects, setSubjects } from "../../../reducers/searchReducer";
import FindRelativeTable from "./FindRelativeTable";
import { SearchForm } from "../../GlobalSearch/SearchFilterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const StyledContainer = styled("div")(({ theme }) => ({
  margin: theme.spacing(3.75),
}));

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

const FindRelative = ({
  subjectProfile,
  operationalModules,
  genders,
  organisationConfigs,
  searchRequest,
  setError,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const Relations = useSelector((state) => state.dataEntry.relations);
  const subjects = useSelector((state) => state.dataEntry.search.subjects);
  const searchParams = useSelector(
    (state) => state.dataEntry.search.subjectSearchParams,
  );
  const subjectType = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile?.subjectType,
  );
  const load = useSelector((state) => state.dataEntry.loadReducer.load);

  const close = () => {
    dispatch(setSubjects());
    sessionStorage.removeItem("selectedRelative");
  };

  const modifySearch = () => {
    dispatch(setSubjects());
    sessionStorage.removeItem("selectedRelative");
  };

  const applyHandler = () => {
    dispatch(setSubjects());
    let localSavedRelativeData = [];
    let localsSelctedRelative = JSON.parse(
      sessionStorage.getItem("selectedRelative"),
    );
    localSavedRelativeData.push(localsSelctedRelative);
    if (localsSelctedRelative !== null) {
      sessionStorage.setItem(
        "selectedRelativeslist",
        JSON.stringify(localSavedRelativeData),
      );
    }
    sessionStorage.removeItem("selectedRelative");
    setError("");
  };

  const handleSearch = (filterRequest) => {
    dispatch(searchSubjects(filterRequest));
  };

  const searchContent = (
    <StyledContainer>
      {subjects && subjects.listOfRecords ? (
        <FindRelativeTable
          subjectData={subjects.listOfRecords.filter(
            (subject) => subjectProfile.uuid !== subject.uuid,
          )}
        />
      ) : (
        <SearchForm
          operationalModules={operationalModules}
          genders={genders}
          organisationConfigs={organisationConfigs}
          searchRequest={searchRequest}
          onSearch={handleSearch}
        />
      )}
      <CustomizedBackdrop load={load} />
    </StyledContainer>
  );

  return (
    <Modal
      fullScreen
      content={searchContent}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("searchRelative"),
          sx: filterButtonStyle,
        },
        subjects && subjects.listOfRecords
          ? {
              buttonType: "applyFloating",
              label: "OK",
              sx: applyButtonStyle,
              click: applyHandler,
              left: 40,
            }
          : "",
        subjects && subjects.listOfRecords
          ? {
              buttonType: "modifySearchFloating",
              label: "Modify search",
              sx: applyButtonStyle,
              click: modifySearch,
              left: 95,
            }
          : "",
      ]}
      title={t("searchRelative")}
      btnHandleClose={close}
    />
  );
};

export default FindRelative;
