import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { Observation, Concept } from "avni-models";
import { conceptService, i18n } from "../services/ConceptService";
import { addressLevelService } from "../services/AddressLevelService";
import { subjectService } from "../services/SubjectService";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@material-ui/icons/Error";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";
import useCommonStyles from "dataEntryApp/styles/commonStyles";
import clsx from "clsx";
import Colors from "dataEntryApp/Colors";
import { Link } from "react-router-dom";
import MediaObservations from "./MediaObservations";
import http from "../../common/utils/httpClient";
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
  }
}));

const Observations = ({ observations, additionalRows, form, customKey, highlight }) => {
  const i = new i18n();
  const { t } = useTranslation();
  const classes = useStyles();
  const commonStyles = useCommonStyles();

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
      return renderMedia(displayable.displayValue.trim());
    } else {
      return renderText(displayable.displayValue, observation.isAbnormal());
    }
  };

  const renderSubject = (subject, addLineBreak) => {
    return (
      <div>
        <Link to={`/app/subject?uuid=${subject.entityObject.uuid}`}>
          {subject.entityObject.firstName +
            (isEmpty(subject.entityObject.lastName) ? "" : " " + subject.entityObject.lastName)}
        </Link>
        {addLineBreak && <br />}
      </div>
    );
  };

  const openMediaInNewTab = mediaUrl => {
    window.open(mediaSignedUrls.find(media => media.unsignedUrl === mediaUrl).url);
  };

  const renderMedia = mediaUrl => {
    return (
      <div>
        <Link
          onClick={event => {
            event.preventDefault();
            showMediaOverlay(mediaUrl);
          }}
        >
          {t("View Media")}
        </Link>{" "}
        |{" "}
        <Link
          onClick={event => {
            event.preventDefault();
            openMediaInNewTab(mediaUrl);
          }}
        >
          {t("Open in new Tab")}
        </Link>
      </div>
    );
  };

  const getSignedUrl = async url => {
    return await http.get(`/media/signedUrl?url=${url}`);
  };

  const refreshSignedUrlsForMedia = async () => {
    if (!_.isEmpty(mediaObservations)) {
      return await Promise.all(
        mediaObservations.map(async obs => {
          const signedUrl = await getSignedUrl(obs.valueJSON.answer);
          return {
            unsignedUrl: obs.valueJSON.answer,
            url: signedUrl.data,
            type: obs.concept.datatype === "Image" ? "photo" : "video",
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
    Concept.dataType.Media.includes(obs.concept.datatype)
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

  const rows = orderedObs.map((obs, index) => {
    return (
      <TableRow key={`${index}-${customKey}`}>
        <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
          {t(obs.concept["name"])}
        </TableCell>
        <TableCell align="left" width="50%">
          <div>{renderValue(obs)}</div>
        </TableCell>
      </TableRow>
    );
  });

  additionalRows &&
    additionalRows.forEach((row, index) => {
      rows.unshift(
        <TableRow key={observations.length + index}>
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
            {t(row.label)}
          </TableCell>
          <TableCell align="left" width="50%">
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
        className={clsx(commonStyles.tableContainer, highlight && classes.highlightBackground)}
        size="small"
        aria-label="a dense table"
      >
        <TableBody>{rows}</TableBody>
      </Table>
      {showMedia && (
        <MediaObservations
          mediaData={mediaSignedUrls}
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
