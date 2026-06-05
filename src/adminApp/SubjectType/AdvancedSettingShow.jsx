import { FormLabel } from "@mui/material";
import { useState, useEffect } from "react";
import _, { isEmpty } from "lodash";
import { BooleanStatusInShow } from "../../common/components/BooleanStatusInShow";
import { httpClient as http } from "../../common/utils/httpClient";
import { ConceptSyncAttributesShow } from "./ConceptSyncAttributeShow";
import { ShowLabelValue } from "../../formDesigner/common/ShowLabelValue";
import { TextFormatFieldInShow } from "../../common/components/TextFormatFieldInShow";
import Types, { SubjectTypeType } from "./Types";

export const AdvancedSettingShow = ({ locationTypes, subjectType }) => {
  const [concept1Name, setConcept1Name] = useState("");
  const [concept2Name, setConcept2Name] = useState("");
  const [removalReasonConceptName, setRemovalReasonConceptName] = useState("");
  const removalReasonConceptUuid = _.get(
    subjectType,
    "settings.removalReasonConceptUuid",
  );

  useEffect(() => {
    if (subjectType.syncRegistrationConcept1) {
      http
        .get(`/web/concept/${subjectType.syncRegistrationConcept1}`)
        .then((res) => setConcept1Name(_.get(res, "data.name")));
    }
    if (subjectType.syncRegistrationConcept2) {
      http
        .get(`/web/concept/${subjectType.syncRegistrationConcept2}`)
        .then((res) => setConcept2Name(_.get(res, "data.name")));
    }
  }, [
    subjectType.syncRegistrationConcept2,
    subjectType.syncRegistrationConcept1,
  ]);

  useEffect(() => {
    if (!removalReasonConceptUuid) {
      setRemovalReasonConceptName("");
      return;
    }
    let cancelled = false;
    http
      .get(`/web/concept/${removalReasonConceptUuid}`)
      .then((res) => {
        if (!cancelled) setRemovalReasonConceptName(_.get(res, "data.name"));
      })
      .catch(() => {
        if (!cancelled) setRemovalReasonConceptName("");
      });
    return () => {
      cancelled = true;
    };
  }, [removalReasonConceptUuid]);

  const addressLevelNames = _(locationTypes)
    .filter(({ uuid }) => _.includes(subjectType.locationTypeUUIDs, uuid))
    .map(({ name }) => name)
    .join(", ");
  return (
    <div style={{ marginBottom: 10 }}>
      {!isEmpty(subjectType.locationTypeUUIDs) && (
        <div>
          <FormLabel style={{ fontSize: "13px" }}>
            Lowest Address Levels
          </FormLabel>
          <br />
          <span style={{ fontSize: "15px" }}>{addressLevelNames}</span>
        </div>
      )}

      {subjectType.validFirstNameFormat && (
        <TextFormatFieldInShow
          label="Valid First Name"
          format={subjectType.validFirstNameFormat}
        />
      )}

      <BooleanStatusInShow
        status={subjectType.allowMiddleName}
        label={"Allow Middle Name"}
      />

      {subjectType.allowMiddleName && subjectType.validMiddleNameFormat && (
        <TextFormatFieldInShow
          label="Valid Middle Name"
          format={subjectType.validMiddleNameFormat}
        />
      )}

      <BooleanStatusInShow
        status={subjectType.lastNameOptional}
        label={"Last Name Optional"}
      />

      {subjectType.validLastNameFormat && (
        <TextFormatFieldInShow
          label="Valid Last Name"
          format={subjectType.validLastNameFormat}
        />
      )}

      <BooleanStatusInShow
        status={subjectType.allowEmptyLocation}
        label={"Allow Empty Location"}
      />
      <BooleanStatusInShow
        status={subjectType.uniqueName}
        label={"Unique Name"}
      />
      {subjectType.nameHelpText && (
        <ShowLabelValue
          label={"Name help text"}
          value={subjectType.nameHelpText}
        />
      )}
      {subjectType.type !== SubjectTypeType.User && (
        <>
          <BooleanStatusInShow
            status={subjectType.shouldSyncByLocation}
            label={"Sync By Location"}
          />
          <BooleanStatusInShow
            status={subjectType.directlyAssignable}
            label={"Sync By Direct Assignment"}
          />
        </>
      )}
      {!isEmpty(subjectType.settings) && (
        <div>
          <BooleanStatusInShow
            status={subjectType.settings.displayRegistrationDetails}
            label={"Display Registration Details"}
          />
          <BooleanStatusInShow
            status={subjectType.settings.displayPlannedEncounters}
            label={"Display Planned Encounters"}
          />
        </div>
      )}
      <ConceptSyncAttributesShow
        subjectType={subjectType}
        concept1Name={concept1Name}
        concept2Name={concept2Name}
      />
      {Types.isGroup(subjectType.type) && removalReasonConceptName && (
        <>
          <ShowLabelValue
            label={"Removal reason concept"}
            value={removalReasonConceptName}
          />
          <p />
        </>
      )}
      {subjectType.type === SubjectTypeType.Group && (
        <>
          <BooleanStatusInShow
            status={subjectType.attendanceEnabled}
            label={"Attendance Enabled"}
          />
          {subjectType.attendanceEnabled &&
            !isEmpty(subjectType.attendanceTypes) && (
              <ShowLabelValue
                label={"Attendance Types"}
                value={subjectType.attendanceTypes
                  .filter((type) => !type.voided)
                  .map((type) => type.name)
                  .join(", ")}
              />
            )}
        </>
      )}
    </div>
  );
};
