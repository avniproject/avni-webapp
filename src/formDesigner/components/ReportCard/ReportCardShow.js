import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import FormLabel from "@material-ui/core/FormLabel";
import ColorValue from "../../common/ColorValue";
import ResourceShowView from "../../common/ResourceShowView";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import _ from "lodash";
import { BooleanStatusInShow } from "../../../common/components/BooleanStatusInShow";
import MediaService from "../../../adminApp/service/MediaService";
import WebReportCard from "../../../common/model/WebReportCard";

function RenderCard({ reportCard }) {
  if (!(reportCard instanceof WebReportCard)) return null;

  const [iconPreviewUrl, setIconPreviewUrl] = React.useState("");

  React.useEffect(() => {
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
      {!reportCard.isStandardReportType() && (
        <React.Fragment>
          <FormLabel style={{ fontSize: "13px" }}>{"Colour"}</FormLabel>
          <br />
          <ColorValue colour={reportCard.color} />
        </React.Fragment>
      )}
      <p />
      {!reportCard.isStandardReportType() && (
        <React.Fragment>
          <BooleanStatusInShow status={reportCard.nested} label={"Is nested?"} />
        </React.Fragment>
      )}
      <p />
      {!reportCard.isStandardReportType() && reportCard.nested && (
        <React.Fragment>
          <ShowLabelValue label={"Number of Cards"} value={reportCard.count} />
          <p />
        </React.Fragment>
      )}
      <p />
      <div>
        <FormLabel style={{ fontSize: "13px" }}>{"Icon"}</FormLabel>
        <br />
        <img src={iconPreviewUrl} alt="Icon Preview" />
      </div>
      <p />
      {reportCard.isStandardReportType() && (
        <ShowLabelValue label={"Standard Report Card Type"} value={reportCard.standardReportCardType.name} />
      )}
      {reportCard.isSubjectTypeFilterSupported() && (
        <>
          <br />
          <ShowLabelValue
            label={"Subject types"}
            value={reportCard.standardReportCardInputSubjectTypes.map(subjectType => subjectType.name).join(", ")}
          />
          <br />
          <ShowLabelValue label={"Programs"} value={reportCard.standardReportCardInputPrograms.map(program => program.name).join(", ")} />
          <br />
          <ShowLabelValue
            label={"Encounter types"}
            value={reportCard.standardReportCardInputEncounterTypes.map(encounterType => encounterType.name).join(", ")}
          />
        </>
      )}
      {!reportCard.isStandardReportType() && <RuleDisplay fieldLabel={"Query"} ruleText={reportCard.query} />}
    </div>
  );
}

const ReportCardShow = props => {
  return (
    <ResourceShowView
      title={"Offline Report Card"}
      resourceId={props.match.params.id}
      resourceName={"reportCard"}
      resourceURLName={"reportCard"}
      render={reportCard => <RenderCard reportCard={reportCard} />}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
      userInfo={props.userInfo}
      mapResource={resource => WebReportCard.fromResource(resource)}
      defaultResource={WebReportCard.createNew()}
    />
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ReportCardShow);
