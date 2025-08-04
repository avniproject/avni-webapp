import { Fragment, useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Box,
  TextField,
  Collapse,
  IconButton
} from "@mui/material";
import {
  ReportProblem,
  KeyboardArrowDown,
  KeyboardArrowUp,
  VerifiedUser,
  Error
} from "@mui/icons-material";
import {
  Concept,
  findMediaObservations,
  Individual,
  Observation
} from "avni-models";
import { conceptService, i18n } from "../services/ConceptService";
import { addressLevelService } from "../services/AddressLevelService";
import { subjectService } from "../services/SubjectService";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import _, { find, isEmpty, isNil, lowerCase, map } from "lodash";
import Colors from "dataEntryApp/Colors";
import { Link } from "react-router-dom";
import MediaObservations from "./MediaObservations";
import { httpClient as http } from "../../common/utils/httpClient";
import { AudioPlayer } from "./AudioPlayer";

const StyledTable = styled(Table)(({ theme, highlight }) => ({
  borderRadius: "8px",
  boxShadow: highlight
    ? "0px 2px 8px rgba(33, 150, 243, 0.2)"
    : "0px 1px 3px rgba(0, 0, 0, 0.1)",
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  border: `1px solid ${theme.palette.grey[200]}`
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(0, 0, 0, 0.02)"
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.paper
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover
  },
  "&:last-child td": {
    borderBottom: "none"
  }
}));

const StyledTableCell = styled(TableCell)(({ theme, variant }) => ({
  padding: variant === "spacer" ? "4px 8px" : "6px 12px",
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  color:
    variant === "label"
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
  fontWeight: variant === "label" ? 500 : 400,
  fontSize: variant === "label" ? "0.875rem" : "0.875rem",
  backgroundColor:
    variant === "groupHeader"
      ? theme.palette.primary.main
      : variant === "fegHeader"
      ? theme.palette.grey[50]
      : "inherit",
  color:
    variant === "groupHeader"
      ? theme.palette.primary.contrastText
      : variant === "fegHeader"
      ? theme.palette.text.secondary
      : variant === "label"
      ? theme.palette.text.secondary
      : theme.palette.text.primary
}));

const StyledTableBody = styled(TableBody)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper
}));

const StyledTypography = styled(Typography)(({ theme, variant }) => ({
  marginLeft: variant === "group" ? "10px" : undefined,
  color: variant ? theme.palette.primary.dark : undefined,
  marginBottom: theme.spacing(1)
}));

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const StyledErrorSpan = styled("span")({
  color: "#ff4f33"
});

const StyledMediaError = styled("p")({
  color: "orangered",
  margin: "5px",
  padding: "5px",
  border: "1px solid #999",
  width: "200px",
  height: "200px",
  textAlign: "center",
  overflow: "scroll"
});

const StyledMediaBox = styled(Box)({
  minWidth: 200,
  minHeight: 50,
  marginTop: 5,
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start"
});

const StyledMediaGrid = styled(Grid)({
  alignItems: "center"
});

const StyledToggleBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
});

const StyledVerifiedIcon = styled(VerifiedUser)(({ theme }) => ({
  color: Colors.SuccessColor,
  fontSize: 20,
  marginLeft: theme.spacing(1)
}));

const StyledUnverifiedIcon = styled(ReportProblem)(({ theme }) => ({
  color: Colors.ValidationError,
  fontSize: 20,
  marginLeft: theme.spacing(1)
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

function includeAdditionalRows(
  additionalRows,
  fegIndex,
  t,
  renderText,
  renderFEGView,
  StyledTableRow
) {
  const additionalObsRows = [];
  additionalRows &&
    additionalRows.forEach((row, index) => {
      additionalObsRows.unshift(
        <StyledTableRow key={"feg-" + fegIndex + "fe-" + index}>
          <StyledTableCell variant="spacer" width={"0.1%"} />
          <StyledTableCell
            variant="label"
            component="th"
            scope="row"
            width="25%"
          >
            {t(row.label)}
          </StyledTableCell>
          <StyledTableCell align="left" width="75%">
            {renderText(t(row.value), row.abnormal)}
          </StyledTableCell>
        </StyledTableRow>
      );
    });

  return renderFEGView(
    "Miscellaneous Information",
    "feg-" + fegIndex,
    additionalObsRows
  );
}

function renderSingleQuestionGroup(
  valueWrapper,
  index,
  customKey,
  t,
  observation,
  StyledTableRow,
  renderValue
) {
  const groupObservations = valueWrapper ? valueWrapper.getValue() : [];
  return map(groupObservations, (obs, i) => (
    <StyledTableRow key={`${index}-${i}-${customKey}`}>
      <StyledTableCell variant="spacer" width={"0.1%"} />
      <StyledTableCell variant="label" component="th" scope="row" width="25%">
        {t(obs.concept["name"])}
      </StyledTableCell>
      <StyledTableCell align="left" width="75%">
        {renderValue(obs)}
      </StyledTableCell>
    </StyledTableRow>
  ));
}

function initMediaObservations(observations) {
  let mediaObservations = findMediaObservations(observations);
  observations
    .filter(obs => obs.concept.isQuestionGroup())
    .forEach(qgObservation => {
      if (qgObservation.valueJSON.repeatableObservations) {
        qgObservation.valueJSON.repeatableObservations.forEach(rqg => {
          mediaObservations.push(
            ...findMediaObservations(rqg.groupObservations)
          );
        });
      } else {
        mediaObservations.push(
          ...findMediaObservations(qgObservation.valueJSON.groupObservations)
        );
      }
    });

  return mediaObservations;
}

const Observations = ({
  observations,
  additionalRows,
  form,
  customKey,
  highlight
}) => {
  const i = new i18n();
  const { t } = useTranslation();
  const [showMedia, setShowMedia] = useState(false);
  const [currentMediaItem, setCurrentMediaItem] = useState(null);
  const [mediaDataList, setMediaDataList] = useState([]);
  const [open, setOpen] = useState({});

  if (isNil(observations)) {
    return <div />;
  }

  const renderText = (value, isAbnormal) => {
    return isAbnormal ? (
      <StyledErrorSpan>
        <Error /> {value}
      </StyledErrorSpan>
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
      return displayable.map((subject, index) =>
        renderSubject(subject, index < displayable.length - 1)
      );
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
    const Icon = isVerified ? StyledVerifiedIcon : StyledUnverifiedIcon;
    return (
      <span>
        {phoneNumber.getValue()} <Icon />
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

  const mediaPreviewMap = signedMediaUrl => ({
    [Concept.dataType.Image]: (
      <img
        src={signedMediaUrl}
        alt={MediaData.MissingSignedMediaMessage}
        align="center"
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

  const updateOpen = observationValue => {
    setOpen(oldOpen => ({
      ...oldOpen,
      [observationValue]: !oldOpen[observationValue]
    }));
  };

  const imageVideoOptions = (observationValue, concept) => {
    const isMultiSelect =
      observationValue && _.isArrayLikeObject(observationValue);
    const mediaUrls = isMultiSelect ? observationValue : [observationValue];
    return (
      <Fragment>
        <StyledMediaGrid onClick={() => updateOpen(observationValue)}>
          <StyledToggleBox>
            <Link
              to="#"
              onClick={event => {
                event.preventDefault();
              }}
            >
              {!open[observationValue] && t("View Media")}
            </Link>
            <IconButton aria-label="expand row" size="small">
              {open[observationValue] ? (
                <KeyboardArrowUp />
              ) : (
                <KeyboardArrowDown />
              )}
            </IconButton>
          </StyledToggleBox>
        </StyledMediaGrid>
        <Collapse in={open[observationValue]} timeout="auto" unmountOnExit>
          <StyledMediaGrid container direction="row" spacing={1}>
            {mediaUrls.map((unsignedMediaUrl, index) => {
              const mediaData = _.find(
                mediaDataList,
                x => x.unsignedUrl === unsignedMediaUrl
              );
              const couldntSignMessage = MediaData.MissingSignedMediaMessage;
              const signedMediaUrl = _.get(mediaData, "url");
              return (
                <Grid key={index}>
                  {_.isNil(signedMediaUrl) ? (
                    <StyledMediaBox>
                      <StyledMediaError>{couldntSignMessage}</StyledMediaError>
                    </StyledMediaBox>
                  ) : (
                    <StyledMediaBox>
                      {mediaPreviewMap(signedMediaUrl)[concept.datatype]}
                    </StyledMediaBox>
                  )}
                </Grid>
              );
            })}
          </StyledMediaGrid>
        </Collapse>
      </Fragment>
    );
  };

  const fileOptions = conceptName => {
    const signedURLS = mediaDataList
      .filter(mediaData => mediaData.altTag === conceptName)
      .map(mediaData => mediaData.url);
    return _.isEmpty(signedURLS) ? (
      <TextField>{MediaData.MissingSignedMediaMessage}</TextField>
    ) : (
      <>
        {signedURLS.map((signedURL, index) => (
          <Fragment key={index}>
            <Link
              to="#"
              onClick={event => {
                event.preventDefault();
                window.open(signedURL, "_blank");
              }}
            >
              {t("View/Download File")}
            </Link>
            <br />
          </Fragment>
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
          const isMultiSelect =
            observationValue && _.isArrayLikeObject(observationValue);
          const mediaUrls = isMultiSelect
            ? observationValue
            : [observationValue];
          return mediaUrls.map(async unsignedMediaUrl => {
            const signedUrl = await getSignedUrl(unsignedMediaUrl);
            const type =
              obs.concept.datatype === "Image"
                ? "photo"
                : lowerCase(obs.concept.datatype);
            return new MediaData(
              _.get(signedUrl, "data"),
              type,
              obs.concept.name,
              unsignedMediaUrl
            );
          });
        })
      );
    }
  };

  const showMediaOverlay = unsignedMediaUrl => {
    setCurrentMediaItem(
      find(mediaDataList, img => img.url === unsignedMediaUrl)
    );
    setShowMedia(true);
  };

  const isNotAssociatedWithForm = isNil(form);
  const orderedObs = isNotAssociatedWithForm
    ? observations
    : form.orderObservationsPerFEG(observations);
  const mediaObservations = initMediaObservations(observations);

  useEffect(() => {
    refreshSignedUrlsForMedia().then(mediaDataList =>
      setMediaDataList(mediaDataList)
    );
  }, []);

  useEffect(() => {
    const refreshedMediaUrls = setInterval(async () => {
      refreshSignedUrlsForMedia().then(signedUrls =>
        setMediaDataList(signedUrls)
      );
    }, 110000);

    return () => clearInterval(refreshedMediaUrls);
  }, []);

  const renderGroupQuestionView = (observation, index) => {
    const valueWrapper = observation.getValueWrapper();
    let questionGroupRows = null;

    if ("repeatableObservations" in valueWrapper) {
      questionGroupRows = _.map(
        valueWrapper.repeatableObservations,
        (questionGroupValueWrapper, rqgIndex) => (
          <Fragment key={`${index}-rqg-${rqgIndex}`}>
            {renderSingleQuestionGroup(
              questionGroupValueWrapper,
              index + "rqg" + rqgIndex,
              customKey,
              t,
              observation,
              StyledTableRow,
              renderValue
            )}
          </Fragment>
        )
      );
    } else {
      questionGroupRows = renderSingleQuestionGroup(
        valueWrapper,
        index + "qg-0",
        customKey,
        t,
        observation,
        StyledTableRow,
        renderValue
      );
    }

    return (
      <Fragment>
        <TableRow key={`${index}-${customKey}`}>
          <StyledTableCell variant="header" colSpan={6}>
            <StyledBox>
              <StyledTypography variant="body1" component="div">
                {t(observation.concept["name"])}
              </StyledTypography>
              <Table size="small" aria-label="questionGroupRows">
                <StyledTableBody>{questionGroupRows}</StyledTableBody>
              </Table>
            </StyledBox>
          </StyledTableCell>
        </TableRow>
      </Fragment>
    );
  };

  const renderFEGView = (fegName, index, fegRows) => {
    return (
      <TableRow key={`${index}-${customKey}`}>
        <StyledTableCell variant="fegHeader" colSpan={6}>
          <StyledBox>
            <StyledTypography variant="h6" component="div">
              {t(fegName)}
            </StyledTypography>
            <Table size="small" aria-label="fegRows">
              <StyledTableBody>{fegRows}</StyledTableBody>
            </Table>
          </StyledBox>
        </StyledTableCell>
      </TableRow>
    );
  };

  const renderNormalView = (observation, index) => {
    return (
      <StyledTableRow key={`${index}-${customKey}`}>
        <StyledTableCell variant="spacer" width={"0.1%"} />
        <StyledTableCell variant="label" component="th" scope="row" width="25%">
          {t(observation.concept["name"])}
        </StyledTableCell>
        <StyledTableCell align="left" width="75%">
          {renderValue(observation)}
        </StyledTableCell>
      </StyledTableRow>
    );
  };

  const renderObservationValue = (
    observation,
    index,
    isNotAssociatedWithForm
  ) => {
    if (isNotAssociatedWithForm) {
      return observation.concept.isQuestionGroup()
        ? renderGroupQuestionView(observation, index)
        : renderNormalView(observation, index);
    } else {
      const fegRows = _.map(
        observation.sortedObservationsArray,
        (obs, feIndex) =>
          renderObservationValue(obs, "feg-" + index + "fe-" + feIndex, true)
      );
      return renderFEGView(observation.feg.name, "feg-" + index, fegRows);
    }
  };

  const rows = _.filter(
    orderedObs,
    obs => isNotAssociatedWithForm || !_.isEmpty(obs.sortedObservationsArray)
  ).map((obs, fegIndex) =>
    renderObservationValue(obs, fegIndex, isNotAssociatedWithForm)
  );

  additionalRows &&
    !_.isEmpty(additionalRows) &&
    rows.push(
      includeAdditionalRows(
        additionalRows,
        rows.length,
        t,
        renderText,
        renderFEGView,
        StyledTableRow
      )
    );

  return isEmpty(rows) ? (
    <div />
  ) : (
    <div>
      <StyledTable
        size="small"
        aria-label="a dense table"
        highlight={highlight}
      >
        <TableBody>{rows}</TableBody>
      </StyledTable>
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
  observations: PropTypes.arrayOf(PropTypes.instanceOf(Observation)).isRequired,
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
