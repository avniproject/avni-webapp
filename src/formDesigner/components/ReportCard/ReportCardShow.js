import React from "react";
import { ShowLabelValue } from "../../common/ShowLabelValue";
import FormLabel from "@material-ui/core/FormLabel";
import ColorValue from "../../common/ColorValue";
import ResourceShowView from "../../common/ResourceShowView";
import http from "../../../common/utils/httpClient";
import RuleDisplay from "../../../adminApp/components/RuleDisplay";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import * as _ from "lodash";
import { BooleanStatusInShow } from "../../../common/components/BooleanStatusInShow";
import MediaService from "../../../adminApp/service/MediaService";

const ReportCardShow = props => {
  const RenderCard = ({ card }) => {
    const [standardReportCardType, setStandardReportCardType] = React.useState();
    const [isStandardReportCard, setIsStandardReportCard] = React.useState(false);
    const [iconPreviewUrl, setIconPreviewUrl] = React.useState("");

    React.useEffect(() => {
      if (card.standardReportCardTypeId != null) {
        http
          .get(`/web/standardReportCardType/${card.standardReportCardTypeId}`)
          .then(res => res.data)
          .then(res => {
            setStandardReportCardType({ name: res.name, id: res.id });
            setIsStandardReportCard(true);
          });
      }
    }, [card.standardReportCardTypeId]);

    React.useEffect(() => {
      if (!_.isNil(card.iconFileS3Key) && !_.isEmpty(card.iconFileS3Key)) {
        MediaService.getMedia(card.iconFileS3Key).then(res => {
          setIconPreviewUrl(res);
        });
      }
    }, [card.iconFileS3Key]);

    return (
      <div>
        <ShowLabelValue label={"Name"} value={card.name} />
        <p />
        <ShowLabelValue label={"Description"} value={card.description} />
        <p />
        {!isStandardReportCard && (
          <React.Fragment>
            <FormLabel style={{ fontSize: "13px" }}>{"Colour"}</FormLabel>
            <br />
            <ColorValue colour={card.color} />
          </React.Fragment>
        )}
        <p />
        {!isStandardReportCard && (
          <React.Fragment>
            <BooleanStatusInShow status={card.nested} label={"Is nested?"} />
          </React.Fragment>
        )}
        <p />
        {!isStandardReportCard && card.nested && (
          <React.Fragment>
            <ShowLabelValue label={"Number of Cards"} value={card.count} />
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
        {isStandardReportCard && (
          <React.Fragment>
            <ShowLabelValue label={"Standard Report Card Type"} value={standardReportCardType.name} />
            <p />
          </React.Fragment>
        )}
        {!isStandardReportCard && <RuleDisplay fieldLabel={"Query"} ruleText={card.query} />}
      </div>
    );
  };

  return (
    <ResourceShowView
      title={"Offline Report Card"}
      resourceId={props.match.params.id}
      resourceName={"card"}
      resourceURLName={"reportCard"}
      render={card => <RenderCard card={card} />}
      editPrivilegeType={Privilege.PrivilegeType.EditOfflineDashboardAndReportCard}
      userInfo={props.userInfo}
    />
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ReportCardShow);
