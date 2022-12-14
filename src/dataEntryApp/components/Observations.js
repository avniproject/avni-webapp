import React, { Fragment } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { Concept, Observation, Individual } from "avni-models";
import { conceptService, i18n } from "../services/ConceptService";
import { addressLevelService } from "../services/AddressLevelService";
import { subjectService } from "../services/SubjectService";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@material-ui/icons/Error";
import PropTypes from "prop-types";
import { filter, find, get, includes, isEmpty, isNil, lowerCase, map } from "lodash";
import clsx from "clsx";
import Colors from "dataEntryApp/Colors";
import { Link } from "react-router-dom";
import MediaObservations from "./MediaObservations";
import http from "../../common/utils/httpClient";
import { AudioPlayer } from "./AudioPlayer";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import ReportProblemIcon from "@material-ui/icons/ReportProblem";
import _ from "lodash";

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  abnormalColor: {
    color: "#ff4f33"
  },
  highlightBackground: {
    backgroundColor: Colors.HighlightBackgroundColor
  },
  tableContainer: {
    borderRadius: "3px",
    boxShadow: "0px 0px 1px"
  },
  verifiedIconStyle: {
    color: Colors.SuccessColor,
    fontSize: 20,
    marginLeft: theme.spacing(1)
  },
  unverifiedIconStyle: {
    color: Colors.ValidationError,
    fontSize: 20,
    marginLeft: theme.spacing(1)
  }
}));

const Observations = ({ observations, additionalRows, form, customKey, highlight }) => {
  const i = new i18n();
  const { t } = useTranslation();
  const classes = useStyles();

  const [showMedia, setShowMedia] = React.useState(false);
  const [currentMediaItemIndex, setCurrentMediaItemIndex] = React.useState(0);
  const [mediaSignedUrls, setMediaSignedUrls] = React.useState([]);

  if (isNil(observations)) {
    return <div />;
  }

  const renderText = (value, isAbnormal) => {
    return isAbnormal ? (
      <span className={classes.abnormalColor}>
        {" "}
        <ErrorIcon /> {value}
      </span>
    ) : (
      value
    );
  };

  const renderValue = observation => {
    const displayable = Observation.valueForDisplay({
      observation,
      conceptService,
      addressLevelService,
      subjectService,
      i18n: i
    });
    if (observation.concept.datatype === "Subject") {
      return displayable.map((subject, index) => {
        return renderSubject(subject, index < displayable.length - 1);
      });
    } else if (Concept.dataType.Media.includes(observation.concept.datatype)) {
      return renderMedia(displayable.displayValue, observation.concept);
    } else if (observation.concept.isPhoneNumberConcept()) {
      return renderPhoneNumber(observation.getValueWrapper());
    } else {
      return renderText(displayable.displayValue, observation.isAbnormal());
    }
  };

  const renderPhoneNumber = phoneNumber => {
    const isVerified = phoneNumber.isVerified();
    const Icon = isVerified ? VerifiedUserIcon : ReportProblemIcon;
    const className = isVerified ? classes.verifiedIconStyle : classes.unverifiedIconStyle;
    return (
      <span>
        {phoneNumber.getValue()} <Icon className={className} />
      </span>
    );
  };

  const renderSubject = (subject, addLineBreak) => {
    return (
      <div>
        <Link to={`/app/subject?uuid=${subject.entityObject.uuid}`}>
          {Individual.getFullName(subject.entityObject)}
        </Link>
        {addLineBreak && <br />}
      </div>
    );
  };

  const openMediaInNewTab = mediaUrl => {
    window.open(mediaSignedUrls.find(media => media.url.startsWith(mediaUrl)).url);
  };

  const imageVideoOptions = mediaUrl => {
    return (
      <div>
        <Link
          to={"#"}
          onClick={event => {
            event.preventDefault();
            showMediaOverlay(mediaUrl);
          }}
        >
          {t("View Media")}
        </Link>{" "}
        |{" "}
        <Link
          to={"#"}
          onClick={event => {
            event.preventDefault();
            openMediaInNewTab(mediaUrl);
          }}
        >
          {t("Open in New Tab")}
        </Link>
      </div>
    );
  };

  const fileOptions = conceptName => {
    const signedURL = get(find(mediaSignedUrls, ({ altTag }) => altTag === conceptName), "url");
    return (
      <Link
        to={"#"}
        onClick={event => {
          event.preventDefault();
          window.open(signedURL, "_blank");
        }}
      >
        {t("View/Download File")}
      </Link>
    );
  };

  const renderMedia = (mediaUrl, concept) => {
    switch (concept.datatype) {
      case Concept.dataType.Audio:
        return <AudioPlayer url={mediaUrl} />;
      case Concept.dataType.Image:
      case Concept.dataType.Video:
        return imageVideoOptions(mediaUrl);
      case Concept.dataType.File:
        return fileOptions(concept.name);
      default:
        return <div />;
    }
  };

  const getSignedUrl = async url => {
    return await http.get(`/media/signedUrl?url=${url}`);
  };

  const refreshSignedUrlsForMedia = async () => {
    if (!isEmpty(mediaObservations)) {
      return await Promise.all(
        mediaObservations.map(async obs => {
          const signedUrl = await getSignedUrl(obs.valueJSON.answer);
          return {
            url: signedUrl.data,
            type: obs.concept.datatype === "Image" ? "photo" : lowerCase(obs.concept.datatype),
            altTag: obs.concept.name
          };
        })
      );
    }
  };

  const showMediaOverlay = url => {
    setCurrentMediaItemIndex(mediaObservations.findIndex(obs => obs.valueJSON.answer === url));
    setShowMedia(true);
  };

  const orderedObs = isNil(form) ? observations : form.orderObservations(observations);

  const mediaObservations = orderedObs.filter(obs =>
    includes(
      [Concept.dataType.Image, Concept.dataType.Video, Concept.dataType.File],
      obs.concept.datatype
    )
  );

  React.useEffect(() => {
    refreshSignedUrlsForMedia().then(signedUrls => setMediaSignedUrls(signedUrls));
  }, []);

  React.useEffect(() => {
    const refreshedMediaUrls = setInterval(async () => {
      refreshSignedUrlsForMedia().then(signedUrls => setMediaSignedUrls(signedUrls));
    }, 110000); //config on server for signed url expiry is 2 minutes. Refreshing it before that.

    return () => clearInterval(refreshedMediaUrls);
  }, []);

  const renderGroupQuestionView = (observation, index) => {
    const valueWrapper = observation.getValueWrapper();
    const groupObservations = valueWrapper ? valueWrapper.getValue() : [];
    return (
      <Fragment>
        <TableRow key={`${index}-${customKey}`}>
          <TableCell
            style={{ backgroundColor: "rgba(0, 0, 0, 0.12)", padding: "6px 4px 6px 6px" }}
            width={"0.1%"}
          />
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
            {t(observation.concept["name"])}
          </TableCell>
          <TableCell align="left" width="50%" />
        </TableRow>
        {map(groupObservations, (obs, i) => (
          <TableRow key={`${index}-${i}-${customKey}`}>
            <TableCell
              style={{ backgroundColor: "rgba(0, 0, 0, 0.12)", padding: "6px 4px 6px 6px" }}
              width={"0.1%"}
            />
            <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
              <div style={{ marginLeft: "10px" }}>{t(obs.concept["name"])}</div>
            </TableCell>
            <TableCell align="left" width="50%" style={{ padding: "6px 4px 6px 6px" }}>
              {renderValue(obs)}
            </TableCell>
          </TableRow>
        ))}
      </Fragment>
    );
  };

  const renderNormalView = (observation, index) => {
    return (
      <TableRow key={`${index}-${customKey}`}>
        <TableCell width={"0.1%"} style={{ padding: "6px 4px 6px 6px" }} />
        <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
          {t(observation.concept["name"])}
        </TableCell>
        <TableCell align="left" width="50%" style={{ padding: "6px 4px 6px 6px" }}>
          {renderValue(observation)}
        </TableCell>
      </TableRow>
    );
  };

  const renderObservationValue = observation => {
    return observation.concept.isQuestionGroup()
      ? renderGroupQuestionView(observation)
      : renderNormalView(observation);
  };

  const rows = _.map(orderedObs, renderObservationValue);

  additionalRows &&
    additionalRows.forEach((row, index) => {
      rows.unshift(
        <TableRow key={observations.length + index}>
          <TableCell width={"0.1%"} style={{ padding: "6px 4px 6px 6px" }} />
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
            {t(row.label)}
          </TableCell>
          <TableCell align="left" width="50%" style={{ padding: "6px 4px 6px 6px" }}>
            <div>{renderText(t(row.value), row.abnormal)}</div>
          </TableCell>
        </TableRow>
      );
    });

  return isEmpty(rows) ? (
    <div />
  ) : (
    <div>
      <Table
        className={clsx(classes.tableContainer, highlight && classes.highlightBackground)}
        size="small"
        aria-label="a dense table"
      >
        <TableBody>{rows}</TableBody>
      </Table>
      {showMedia && (
        <MediaObservations
          mediaData={filter(mediaSignedUrls, ({ type }) => type !== "file")}
          currentMediaItemIndex={currentMediaItemIndex}
          onClose={() => setShowMedia(false)}
        />
      )}
    </div>
  );
};

Observations.propTypes = {
  observations: PropTypes.arrayOf(Observation).isRequired,
  additionalRows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      abnormal: PropTypes.bool
    })
  ),
  highlight: PropTypes.bool
};

export default Observations;
