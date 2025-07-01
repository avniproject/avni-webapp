import React, { Fragment } from "react";
import { GridLegacy as Grid, Table } from "@mui/material";
import { TableBody } from "@mui/material";
import { TableCell } from "@mui/material";
import { TableRow } from "@mui/material";

import { Concept, findMediaObservations, Individual, Observation } from "avni-models";
import { conceptService, i18n } from "../services/ConceptService";
import { addressLevelService } from "../services/AddressLevelService";
import { subjectService } from "../services/SubjectService";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import _, { find, isEmpty, isNil, lowerCase, map } from "lodash";
import clsx from "clsx";
import Colors from "dataEntryApp/Colors";
import { Link } from "react-router-dom";
import MediaObservations from "./MediaObservations";
import http from "../../common/utils/httpClient";
import { AudioPlayer } from "./AudioPlayer";
import { TextField } from "@mui/material";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Collapse, IconButton, styled } from "@mui/material";
import { ReportProblem, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { VerifiedUser } from "@mui/icons-material";
import { Error } from "@mui/icons-material";

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
  },
  boxStyle: {
    minWidth: 200,
    minHeight: 50,
    marginTop: 5
  }
}));

class MediaData {
  static MissingSignedMediaMessage = "Unable to fetch media.";

  constructor(url, type, altTag, unsignedUrl) {
    this.url = url;
    this.type = type;
    this.altTag = altTag;
    this.unsignedUrl = unsignedUrl;
  }
}

function includeAdditionalRows(additionalRows, fegIndex, t, renderText, renderFEGView, StyledTableRow) {
  const additionalObsRows = [];
  additionalRows &&
    additionalRows.forEach((row, index) => {
      additionalObsRows.unshift(
        <StyledTableRow key={"feg-" + fegIndex + "fe-" + index}>
          <TableCell width={"0.1%"} style={{ padding: "6px 4px 6px 6px" }} />
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="25%">
            {t(row.label)}
          </TableCell>
          <TableCell align="left" width="75%" style={{ padding: "6px 4px 6px 6px" }}>
            <div>{renderText(t(row.value), row.abnormal)}</div>
          </TableCell>
        </StyledTableRow>
      );
    });

  return renderFEGView("Miscellaneous Information", "feg-" + fegIndex, additionalObsRows);
}

function renderSingleQuestionGroup(valueWrapper, index, customKey, t, observation, StyledTableRow, renderValue) {
  const groupObservations = valueWrapper ? valueWrapper.getValue() : [];
  return (
    <div style={{ borderStyle: "inset", borderWidth: "2px" }}>
      {map(groupObservations, (obs, i) => (
        <StyledTableRow key={`${index}-${i}-${customKey}`}>
          <TableCell width={"0.1%"} style={{ padding: "6px 4px 6px 6px" }} />
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="25%">
            {t(obs.concept["name"])}
          </TableCell>
          <TableCell align="left" width="75%" style={{ padding: "6px 4px 6px 6px" }}>
            {renderValue(obs)}
          </TableCell>
        </StyledTableRow>
      ))}
    </div>
  );
}

function initMediaObservations(observations) {
  let mediaObservations = findMediaObservations(observations);
  observations
    .filter(obs => obs.concept.isQuestionGroup())
    .forEach(qgObservation => {
      if (qgObservation.valueJSON.repeatableObservations) {
        qgObservation.valueJSON.repeatableObservations.forEach(rqg => {
          mediaObservations.push(...findMediaObservations(rqg.groupObservations));
        });
      } else {
        mediaObservations.push(...findMediaObservations(qgObservation.valueJSON.groupObservations));
      }
    });

  return mediaObservations;
}

const Observations = ({ observations, additionalRows, form, customKey, highlight }) => {
  const i = new i18n();
  const { t } = useTranslation();
  const classes = useStyles();

  const [showMedia, setShowMedia] = React.useState(false);
  const [currentMediaItem, setCurrentMediaItem] = React.useState(null);
  const [mediaDataList, setMediaDataList] = React.useState([]);
  const [open, setOpen] = React.useState({});

  if (isNil(observations)) {
    return <div />;
  }

  const renderText = (value, isAbnormal) => {
    return isAbnormal ? (
      <span className={classes.abnormalColor}>
        {" "}
        <Error /> {value}
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
    const Icon = isVerified ? VerifiedUser : ReportProblem;
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
        <Link to={`/app/subject?uuid=${subject.entityObject.uuid}`}>{Individual.getFullName(subject.entityObject)}</Link>
        {addLineBreak && <br />}
      </div>
    );
  };

  const mediaPreviewMap = signedMediaUrl => ({
    [Concept.dataType.Image]: (
      <img
        src={signedMediaUrl}
        alt={MediaData.MissingSignedMediaMessage}
        align={"center"}
        width={200}
        height={200}
        onClick={event => {
          event.preventDefault();
          showMediaOverlay(signedMediaUrl);
        }}
      />
    ),
    [Concept.dataType.Video]: (
      <video
        preload="auto"
        controls
        width={200}
        height={200}
        onClick={event => {
          event.stopPropagation();
        }}
      >
        <source src={signedMediaUrl} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
    )
  });

  /**
   * We use observationValue to maintain state of corresponding media observation's collapse state,
   * as use of concept could be a problem with QuestionGroups and RepeatableQG able to re-use same concept
   * @param observationValue
   */
  function updateOpen(observationValue) {
    setOpen(oldOpen => {
      return { ...oldOpen, [observationValue]: !oldOpen[observationValue] };
    });
  }

  const imageVideoOptions = (observationValue, concept) => {
    let isMultiSelect = observationValue && _.isArrayLikeObject(observationValue);
    const mediaUrls = isMultiSelect ? observationValue : [observationValue];
    return (
      <Fragment>
        <Grid
          onClick={event => {
            updateOpen(observationValue);
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Link
              to={"#"}
              onClick={event => {
                event.preventDefault();
              }}
            >
              {!open[observationValue] && t("View Media")}
            </Link>
            <IconButton aria-label="expand row" size="small">
              {open[observationValue] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>
        </Grid>
        <Collapse in={open[observationValue]} timeout="auto" unmountOnExit>
          <Grid
            container
            direction="row"
            spacing={1}
            onClick={() => updateOpen(observationValue)}
            sx={{
              alignItems: "center"
            }}
          >
            {mediaUrls.map((unsignedMediaUrl, index) => {
              const mediaData = _.find(mediaDataList, x => x.unsignedUrl === unsignedMediaUrl);
              const couldntSignMessage = MediaData.MissingSignedMediaMessage;
              const signedMediaUrl = _.get(mediaData, "url");
              return (
                <Grid item key={index}>
                  {_.isNil(signedMediaUrl) ? (
                    <Box
                      className={classes.boxStyle}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start"
                      }}
                    >
                      <p
                        style={{
                          color: "orangered",
                          margin: "5px",
                          padding: "5px",
                          border: "1px solid #999",
                          width: "200px",
                          height: "200px",
                          textAlign: "center",
                          overflow: "scroll"
                        }}
                      >
                        {couldntSignMessage}
                      </p>
                    </Box>
                  ) : (
                    <Box
                      className={classes.boxStyle}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start"
                      }}
                    >
                      {mediaPreviewMap(signedMediaUrl)[concept.datatype]}
                    </Box>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Collapse>
      </Fragment>
    );
  };

  const fileOptions = conceptName => {
    const signedURLS = mediaDataList.filter(mediaData => mediaData.altTag === conceptName).map(mediaData => mediaData.url);
    return _.isEmpty(signedURLS) ? (
      <TextField>MediaData.MissingSignedMediaMessage</TextField>
    ) : (
      <>
        {signedURLS.map((signedURL, index) => (
          <React.Fragment key={index}>
            <Link
              to={"#"}
              onClick={event => {
                event.preventDefault();
                window.open(signedURL, "_blank");
              }}
              key={index}
            >
              {t("View/Download File")}
            </Link>
            <br />
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderMedia = (unsignedMediaUrl, concept) => {
    switch (concept.datatype) {
      case Concept.dataType.Audio:
        return <AudioPlayer url={unsignedMediaUrl} />;
      case Concept.dataType.Image:
      case Concept.dataType.Video:
        return imageVideoOptions(unsignedMediaUrl, concept);
      case Concept.dataType.File:
        return fileOptions(concept.name);
      default:
        return <div />;
    }
  };

  const getSignedUrl = async url => {
    try {
      return await http.get(`/media/signedUrl?url=${url}`);
    } catch (e) {
      return null;
    }
  };

  const refreshSignedUrlsForMedia = async () => {
    if (!isEmpty(mediaObservations)) {
      return await Promise.all(
        mediaObservations.flatMap(obs => {
          const observationValue = obs.valueJSON.answer;
          let isMultiSelect = observationValue && _.isArrayLikeObject(observationValue);
          const mediaUrls = isMultiSelect ? observationValue : [observationValue];
          return mediaUrls.map(async unsignedMediaUrl => {
            const signedUrl = await getSignedUrl(unsignedMediaUrl);
            const type = obs.concept.datatype === "Image" ? "photo" : lowerCase(obs.concept.datatype);
            return new MediaData(_.get(signedUrl, "data"), type, obs.concept.name, unsignedMediaUrl);
          });
        })
      );
    }
  };

  const showMediaOverlay = unsignedMediaUrl => {
    setCurrentMediaItem(find(mediaDataList, img => img.url === unsignedMediaUrl));
    setShowMedia(true);
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0
    }
  }));

  const isNotAssociatedWithForm = isNil(form);
  const orderedObs = isNotAssociatedWithForm ? observations : form.orderObservationsPerFEG(observations);
  const mediaObservations = initMediaObservations(observations);

  React.useEffect(() => {
    refreshSignedUrlsForMedia().then(mediaDataList => setMediaDataList(mediaDataList));
  }, []);

  React.useEffect(() => {
    const refreshedMediaUrls = setInterval(async () => {
      refreshSignedUrlsForMedia().then(signedUrls => setMediaDataList(signedUrls));
    }, 110000); //config on server for signed url expiry is 2 minutes. Refreshing it before that.

    return () => clearInterval(refreshedMediaUrls);
  }, []);

  const renderGroupQuestionView = (observation, index) => {
    const valueWrapper = observation.getValueWrapper();
    let questionGroupRows = null;

    if ("repeatableObservations" in valueWrapper) {
      questionGroupRows = _.map(valueWrapper.repeatableObservations, (questionGroupValueWrapper, rqgIndex) =>
        renderSingleQuestionGroup(
          questionGroupValueWrapper,
          index + "rqg" + rqgIndex,
          customKey,
          t,
          observation,
          StyledTableRow,
          renderValue
        )
      );
    } else {
      questionGroupRows = renderSingleQuestionGroup(valueWrapper, index + "qg-0", customKey, t, observation, StyledTableRow, renderValue);
    }

    return (
      <Fragment>
        <TableRow key={`${index}-${customKey}`}>
          <TableCell style={{ padding: 0, background: "rgb(232 232 232)" }} colSpan={6}>
            <Box sx={{ margin: 2 }}>
              <Typography
                style={{ marginLeft: "10px" }}
                sx={{ color: theme => theme.palette.text.secondary, mb: 1 }}
                variant="body1"
                component="div"
              >
                {t(observation.concept["name"])}
              </Typography>
              <Table size="small" aria-label="questionGroupRows">
                <TableBody style={{ background: "white" }}> {questionGroupRows}</TableBody>
              </Table>
            </Box>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  };

  const renderFEGView = (fegName, index, fegRows, customKey) => {
    return (
      <TableRow key={`${index}-${customKey}`}>
        <TableCell style={{ padding: 0, background: "lightgray" }} colSpan={6}>
          <Box sx={{ margin: 2 }}>
            <Typography sx={{ color: theme => theme.palette.text.secondary, mb: 1 }} variant="h6" component="div">
              {t(fegName)}
            </Typography>
            <Table size="small" aria-label="fegRows">
              <TableBody style={{ background: "white" }}>{fegRows}</TableBody>
            </Table>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const renderNormalView = (observation, index) => {
    return (
      <StyledTableRow key={`${index}-${customKey}`}>
        <TableCell width={"0.1%"} style={{ padding: "6px 4px 6px 6px" }} />
        <TableCell style={{ color: "#555555" }} component="th" scope="row" width="25%">
          {t(observation.concept["name"])}
        </TableCell>
        <TableCell align="left" width="75%" style={{ padding: "6px 4px 6px 6px" }}>
          {renderValue(observation)}
        </TableCell>
      </StyledTableRow>
    );
  };

  const renderObservationValue = (observation, index, isNotAssociatedWithForm) => {
    if (isNotAssociatedWithForm) {
      return observation.concept.isQuestionGroup() ? renderGroupQuestionView(observation, index) : renderNormalView(observation, index);
    } else {
      const fegRows = _.map(observation.sortedObservationsArray, (obs, feIndex) =>
        renderObservationValue(obs, "feg-" + index + "fe-" + feIndex, true)
      );
      return renderFEGView(observation.feg.name, "feg-" + index, fegRows);
    }
  };

  const rows = _.filter(orderedObs, obs => isNotAssociatedWithForm || !_.isEmpty(obs.sortedObservationsArray)).map((obs, fegIndex) =>
    renderObservationValue(obs, fegIndex, isNotAssociatedWithForm)
  );

  additionalRows &&
    !_.isEmpty(additionalRows) &&
    rows.push(includeAdditionalRows(additionalRows, rows.length, t, renderText, renderFEGView, StyledTableRow));

  return isEmpty(rows) ? (
    <div />
  ) : (
    <div>
      <Table className={clsx(classes.tableContainer, highlight && classes.highlightBackground)} size="small" aria-label="a dense table">
        <TableBody>{rows}</TableBody>
      </Table>
      {showMedia && (
        <MediaObservations
          mediaDataList={[currentMediaItem]}
          currentMediaItemIndex={0}
          showResourceCount={false}
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
