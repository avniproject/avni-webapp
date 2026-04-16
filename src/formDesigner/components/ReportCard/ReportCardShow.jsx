import { useState, useEffect, Fragment } from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import { FormLabel } from "@mui/material";
import ColorValue from "../../common/ColorValue";
import ResourceShowView from "../../common/ResourceShowView";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";
import { useSelector } from "react-redux";
import { Privilege, ReportCard } from "openchs-models";
import { httpClient as http } from "../../../common/utils/httpClient";
import _ from "lodash";
import MediaService from "../../../adminApp/service/MediaService";
import OperationalModules from "../../../common/model/OperationalModules";
import WebReportCard from "../../../common/model/WebReportCard";
import CustomCardConfigService from "../../../common/service/CustomCardConfigService";
import { useParams } from "react-router-dom";

function RenderCard({ reportCard }) {
  if (!(reportCard instanceof WebReportCard)) return null;

  const [iconPreviewUrl, setIconPreviewUrl] = useState("");
  const [operationalModules, setOperationalModules] = useState({});
  const [customCardConfigName, setCustomCardConfigName] = useState("");
  const cardType = ReportCard.deriveCardType(reportCard);
  const isStandard = cardType === ReportCard.cardTypes.standard;
  const isNested = cardType === ReportCard.cardTypes.nested;
  const isCustomData = cardType === ReportCard.cardTypes.customData;
  const isFullyCustom = cardType === ReportCard.cardTypes.fullyCustom;

  useEffect(() => {
    if (
      !_.isNil(reportCard.iconFileS3Key) &&
      !_.isEmpty(reportCard.iconFileS3Key)
    ) {
      MediaService.getMedia(reportCard.iconFileS3Key).then((res) => {
        setIconPreviewUrl(res);
      });
    }
  }, [reportCard.iconFileS3Key]);

  useEffect(() => {
    if (reportCard.action === ReportCard.actionTypes.DoVisit) {
      http.get("/web/operationalModules").then((response) => {
        setOperationalModules(response.data);
      });
    }
  }, [reportCard.action]);

  useEffect(() => {
    const uuid = reportCard.customCardConfig?.uuid;
    if (uuid) {
      CustomCardConfigService.getAll().then((configs) => {
        const match = configs.find((c) => c.uuid === uuid);
        if (match) setCustomCardConfigName(match.name);
      });
    }
  }, [reportCard.customCardConfig?.uuid]);

  return (
    <div>
      <ShowLabelValue label={"Name"} value={reportCard.name} />
      <p />
      <ShowLabelValue label={"Description"} value={reportCard.description} />
      <p />
      {reportCard.colour && (
        <Fragment>
          <FormLabel style={{ fontSize: "13px" }}>Colour</FormLabel>
          <br />
          <ColorValue colour={reportCard.colour} />
        </Fragment>
      )}
      <p />
      <ShowLabelValue
        label="Card Type"
        value={
          isStandard
            ? "Standard Report Card"
            : isNested
              ? "Nested Report Card"
              : isCustomData
                ? "Custom data card"
                : "Fully custom card"
        }
      />
      <p />
      {isNested && (
        <Fragment>
          <ShowLabelValue label="Number of Cards" value={reportCard.count} />
          <p />
        </Fragment>
      )}
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Icon</FormLabel>
        <br />
        <img src={iconPreviewUrl} alt="Icon Preview" />
      </div>
      <p />
      {isStandard && (
        <ShowLabelValue
          label="Standard Report Card Type"
          value={reportCard.standardReportCardType.description}
        />
      )}
      <p />
      {isStandard &&
        reportCard.isRecentType() &&
        !_.isNil(reportCard.standardReportCardInputRecentDuration) && (
          <ShowLabelValue
            label={`${
              reportCard.standardReportCardType.description
            } in the last`}
            value={`${reportCard.standardReportCardInputRecentDuration.value} ${
              reportCard.standardReportCardInputRecentDuration.unit
            }`}
          />
        )}
      {isStandard && reportCard.isSubjectTypeFilterSupported() && (
        <>
          <br />
          <ShowLabelValue
            label="Subject types"
            value={reportCard.standardReportCardInputSubjectTypes
              .map((subjectType) => subjectType.name)
              .join(", ")}
          />
          <br />
          <ShowLabelValue
            label="Programs"
            value={reportCard.standardReportCardInputPrograms
              .map((program) => program.name)
              .join(", ")}
          />
          <br />
          <ShowLabelValue
            label="Encounter types"
            value={reportCard.standardReportCardInputEncounterTypes
              .map((encounterType) => encounterType.name)
              .join(", ")}
          />
        </>
      )}
      {(isNested || isCustomData) && (
        <RuleDisplay fieldLabel="Query" ruleText={reportCard.query} />
      )}
      {isFullyCustom && reportCard.customCardConfig && (
        <div>
          <FormLabel style={{ fontSize: "13px" }}>Custom Card Config</FormLabel>
          <br />
          <a
            href={`#/appDesigner/customCardConfig/${
              reportCard.customCardConfig.uuid
            }/show`}
          >
            {customCardConfigName || reportCard.customCardConfig.uuid}
          </a>
        </div>
      )}
      {(isNested || isCustomData) && reportCard.action && (
        <>
          <p />
          <ShowLabelValue
            label="Action"
            value={
              reportCard.action === ReportCard.actionTypes.DoVisit
                ? "Do visit"
                : "View subject profile"
            }
          />
        </>
      )}
      {(isNested || isCustomData) &&
        reportCard.action === ReportCard.actionTypes.DoVisit &&
        OperationalModules.isLoaded(operationalModules) && (
          <>
            <p />
            <ShowLabelValue
              label="Subject Type"
              value={OperationalModules.findSubjectTypeName(
                operationalModules,
                reportCard.actionDetailSubjectTypeUUID,
              )}
            />
            <p />
            <ShowLabelValue
              label="Program"
              value={
                OperationalModules.findProgramName(
                  operationalModules,
                  reportCard.actionDetailProgramUUID,
                ) || "None"
              }
            />
            <p />
            <ShowLabelValue
              label="Encounter Type"
              value={OperationalModules.findEncounterTypeName(
                operationalModules,
                reportCard.actionDetailEncounterTypeUUID,
              )}
            />
            <p />
            <ShowLabelValue
              label="Visit Type"
              value={reportCard.actionDetailVisitType}
            />
          </>
        )}
    </div>
  );
}

const ReportCardShow = () => {
  const { id } = useParams();
  const userInfo = useSelector((state) => state.app.userInfo);

  return (
    <ResourceShowView
      title="Card"
      resourceId={id}
      resourceName={"reportCard"}
      resourceURLName={"reportCard"}
      render={(reportCard) => <RenderCard reportCard={reportCard} />}
      editPrivilegeType={
        Privilege.PrivilegeType.EditOfflineDashboardAndReportCard
      }
      userInfo={userInfo}
      mapResource={(resource) => WebReportCard.fromResource(resource)}
      defaultResource={WebReportCard.createNewReportCard()}
    />
  );
};

export default ReportCardShow;
