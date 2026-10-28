import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  Fragment,
  useMemo,
  useCallback,
} from "react";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { find, get, map, includes, sortBy, join, size, every } from "lodash";
import { Concept } from "openchs-models";
import { useSelector } from "react-redux";
import api from "../api";
import {
  FormLabel,
  FormGroup,
  FormHelperText,
  Grid,
  Link,
  TextField,
} from "@mui/material";
import {
  mapGroupMembers,
  mapIndividual,
} from "../../common/subjectModelMapper";
import { subjectService } from "../services/SubjectService";
import { getAnswerRuleFilter } from "../services/FormElementService";
import Checkbox from "./Checkbox";

const StyledGridContainer = styled(Grid)({
  height: "100%",
});

const StyledSelectAllGrid = styled(Grid)({
  justifyContent: "flex-end",
});

const StyledMemberGrid = styled(Grid)(({ index }) => ({
  backgroundColor: index % 2 === 0 ? "#ececec" : "#FFF",
  paddingLeft: 10,
  paddingRight: 15,
  alignItems: "center",
  justifyContent: "center",
}));

const AttendanceFormElement = ({
  formElement,
  update,
  validationResults,
  uuid,
  value = [],
  displayAllGroupMembers,
}) => {
  const subjectUUID = useSelector((state) =>
    get(state, "dataEntry.subjectProfile.subjectProfile.uuid"),
  );
  const [fetchedMembers, setFetchedMembers] = useState([]);
  const { mandatory, name, answersToShow, type } = formElement;
  const isMultiSelect = type === "MultiSelect";
  const [isSelectAll, setSelectAll] = useState(false);
  const [searchText, setSearchText] = useState("");
  const memberListRef = useRef(null);
  const [fullMemberListHeight, setFullMemberListHeight] = useState(0);
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid &&
      questionGroupIndex === formElement.questionGroupIndex,
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;
  const subjectTypeUUID = useMemo(
    () => formElement.concept.recordValueByKey(Concept.keys.subjectTypeUUID),
    [formElement.concept],
  );
  const answersToShowKey = join(answersToShow, ",");
  const { isAllowed } = useMemo(
    () => getAnswerRuleFilter(formElement),
    [formElement],
  );
  const memberSubjects = useMemo(() => {
    const applicable = displayAllGroupMembers
      ? fetchedMembers.filter((memberSubject) => isAllowed(memberSubject.uuid))
      : fetchedMembers;
    const validSubjects = applicable.filter((s) => s && s.nameString);
    return sortBy(validSubjects, (s) => s.nameString.toLowerCase());
  }, [fetchedMembers, isAllowed, displayAllGroupMembers]);
  const memberUUIDs = useMemo(
    () => memberSubjects.map(({ uuid }) => uuid),
    [memberSubjects],
  );
  const visibleMembers = useMemo(() => {
    const searchWords = searchText
      .toLowerCase()
      .split(/[ \-:]+/)
      .filter(Boolean);
    return searchWords.length > 0
      ? memberSubjects.filter((s) => {
          const nameLowerCase = s.nameString.toLowerCase();
          return every(searchWords, (word) => nameLowerCase.includes(word));
        })
      : memberSubjects;
  }, [memberSubjects, searchText]);
  const selectLabel = isSelectAll ? t("unselectAllLabel") : t("selectAllLabel");

  useEffect(() => {
    let cancelled = false;
    const fetchMembers = async () => {
      let fetchedSubjects = [];
      if (displayAllGroupMembers) {
        const groupSubjects = await api.fetchGroupMembers(subjectUUID);
        const groupSubjectsMatchingRole = groupSubjects.filter(
          (groupSubject) =>
            groupSubject.member.subjectType.uuid === subjectTypeUUID,
        );
        const mappedGroupSubjects = mapGroupMembers(groupSubjectsMatchingRole);
        fetchedSubjects = map(
          mappedGroupSubjects,
          ({ memberSubject }) => memberSubject,
        );
      } else {
        const subjects = await api.fetchSubjectForUUIDs(answersToShowKey);
        fetchedSubjects = map(subjects, mapIndividual);
      }
      subjectService.addSubjects(fetchedSubjects);
      return fetchedSubjects;
    };

    fetchMembers().then((fetchedSubjects) => {
      if (!cancelled) setFetchedMembers(fetchedSubjects);
    });

    return () => {
      cancelled = true;
    };
  }, [displayAllGroupMembers, subjectUUID, subjectTypeUUID, answersToShowKey]);

  useLayoutEffect(() => {
    if (!searchText && memberListRef.current) {
      setFullMemberListHeight(memberListRef.current.offsetHeight);
    }
  }, [searchText, visibleMembers]);

  useEffect(() => {
    setSelectAll(size(memberUUIDs) === size(value));
  }, [memberUUIDs, value]);

  const onsSwitchChange = useCallback(
    (event) => {
      const uuid = event.target.value;
      update(uuid);
    },
    [update],
  );

  const toggleSelectAll = useCallback(() => {
    setSelectAll((prev) => {
      const newSelectAll = !prev;
      memberUUIDs.forEach((memberUUID) => {
        if (
          (newSelectAll && !includes(value, memberUUID)) ||
          (!newSelectAll && includes(value, memberUUID))
        ) {
          update(memberUUID);
        }
      });
      return newSelectAll;
    });
  }, [memberUUIDs, value, update]);

  return (
    <Fragment>
      <StyledGridContainer container direction="column" spacing={0.5} size={4}>
        <Grid>
          <FormLabel component="legend">{label}</FormLabel>
        </Grid>
        <Grid>
          <TextField
            type="text"
            size="small"
            autoComplete="off"
            placeholder={t("search")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: "100%" }}
          />
        </Grid>
        {isMultiSelect && memberSubjects.length > 0 && (
          <StyledSelectAllGrid container>
            <Link
              underline="hover"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleSelectAll();
              }}
            >
              {selectLabel}
            </Link>
          </StyledSelectAllGrid>
        )}
      </StyledGridContainer>
      <FormGroup
        ref={memberListRef}
        style={{ minHeight: searchText ? fullMemberListHeight : undefined }}
      >
        {visibleMembers.length > 0
          ? map(visibleMembers, ({ uuid, nameString }, index) => (
              <StyledMemberGrid key={uuid} container index={index} size={4}>
                <Grid size={11}>
                  <div>{nameString}</div>
                </Grid>
                <Grid size={1}>
                  <Checkbox
                    checked={includes(value, uuid)}
                    onChange={onsSwitchChange}
                    value={uuid}
                  />
                </Grid>
              </StyledMemberGrid>
            ))
          : memberSubjects.length > 0 && (
              <FormHelperText>{t("zeroNumberOfResults")}</FormHelperText>
            )}
      </FormGroup>
      <FormHelperText>
        {validationResult &&
          t(validationResult.messageKey, validationResult.extra)}
      </FormHelperText>
    </Fragment>
  );
};
export default AttendanceFormElement;
