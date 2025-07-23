import { useState, useEffect, Fragment } from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import { FormLabel } from "@mui/material";
import ColorValue from "../../common/ColorValue";
import ResourceShowView from "../../common/ResourceShowView";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";
import { useSelector } from "react-redux";
import { Privilege } from "openchs-models";
import _ from "lodash";
import { BooleanStatusInShow } from "../../../common/components/BooleanStatusInShow";
import MediaService from "../../../adminApp/service/MediaService";
import WebReportCard from "../../../common/model/WebReportCard";
import { useParams } from "react-router-dom";

function RenderCard({ reportCard }) {
  if (!(reportCard instanceof WebReportCard)) return null;

  const [iconPreviewUrl, setIconPreviewUrl] = useState("");

  useEffect(() => {
    if (!_.isNil(reportCard.iconFileS3Key) && !_.isEmpty(reportCard.iconFileS3Key)) {
      MediaService.getMedia(reportCard.iconFileS3Key).then(res => {
        setIconPreviewUrl(res);
      });
    }
  }, [reportCard.iconFileS3Key]);

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
      {!reportCard.isStandardReportType() && (
        <Fragment>
          <BooleanStatusInShow status={reportCard.nested} label="Is nested?" />
        </Fragment>
      )}
      <p />
      {!reportCard.isStandardReportType() && reportCard.nested && (
        <Fragment>
          <ShowLabelValue label="Number of Cards" value={reportCard.count} />
          <p />
        </Fragment>
      )}
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Icon</FormLabel>
        <br />
        <img src={iconPreviewUrl} alt="Icon Preview" />
      </div>
      <p />
      {reportCard.isStandardReportType() && (
        <ShowLabelValue label="Standard Report Card Type" value={reportCard.standardReportCardType.description} />
      )}
      <p />
      {reportCard.isStandardReportType() && reportCard.isRecentType() && !_.isNil(reportCard.standardReportCardInputRecentDuration) && (
        <ShowLabelValue
          label={`${reportCard.standardReportCardType.description} in the last`}
          value={`${reportCard.standardReportCardInputRecentDuration.value} ${reportCard.standardReportCardInputRecentDuration.unit}`}
        />
      )}
      {reportCard.isSubjectTypeFilterSupported() && (
        <>
          <br />
          <ShowLabelValue
            label="Subject types"
            value={reportCard.standardReportCardInputSubjectTypes.map(subjectType => subjectType.name).join(", ")}
          />
          <br />
          <ShowLabelValue label="Programs" value={reportCard.standardReportCardInputPrograms.map(program => program.name).join(", ")} />
          <br />
          <ShowLabelValue
            label="Encounter types"
            value={reportCard.standardReportCardInputEncounterTypes.map(encounterType => encounterType.name).join(", ")}
          />
        </>
      )}
      {!reportCard.isStandardReportType() && <RuleDisplay fieldLabel="Query" ruleText={reportCard.query} />}
    </div>
  );
}

const ReportCardShow = () => {
  const { id } = useParams();
  const userInfo = useSelector(state => state.app.userInfo);

  return (
    <ResourceShowView
      title="Offline Report Card"
      resourceId={id}
      resourceName={"reportCard"}
      resourceURLName={"reportCard"}
      render={reportCard => <RenderCard reportCard={reportCard} />}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
      userInfo={userInfo}
      mapResource={resource => WebReportCard.fromResource(resource)}
      defaultResource={WebReportCard.createNewReportCard()}
    />
  );
};

export default ReportCardShow;
