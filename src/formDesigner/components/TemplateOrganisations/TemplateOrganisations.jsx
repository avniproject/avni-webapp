import { useEffect, useState } from "react";
import { Title } from "react-admin";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { httpClient as http } from "../../../common/utils/httpClient";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ReactMarkdown from "react-markdown";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CircularProgress } from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "200px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const CardContent = styled(MuiCardContent)(({ theme }) => ({
  flex: "1 0 auto",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

const CardContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: theme.spacing(3),
  width: "100%",
  padding: theme.spacing(2, 0),
  maxWidth: "100%",
  margin: 0,
}));

const TemplateOrganisationDetail = ({ template, onBack }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [applyStatus, setApplyStatus] = useState(null);

  function getDialogTitle(applyStatus) {
    switch (applyStatus) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
        return "Error in applying template";
      case "COMPLETED":
        return "Cheers! Your app is ready for use";
      default:
        return "Applying Template!";
    }
  }

  function getDialogContent(applyStatus) {
    switch (applyStatus) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
        return "Your template could not be applied. Please try again after some time.";
      case "COMPLETED":
        return (
          <span>
            Your template has been applied successfully. You can{" "}
            <a
              href="https://play.google.com/store/apps/details?id=com.openchsclient"
              target={"_blank"}
            >
              download Avni App
            </a>{" "}
            to test it out or try this on our{" "}
            <a href="#/app" target={"_blank"}>
              Data Entry Web App
            </a>
          </span>
        );
      default:
        return "Please wait while we build this program template for you. It will take a few mins.";
    }
  }

  function isTerminalStatus(applyStatus) {
    switch (applyStatus) {
      case "FAILED":
      case "ABANDONED":
      case "UNKNOWN":
      case "STOPPED":
      case "COMPLETED":
        return true;
      default:
        return false;
    }
  }

  const handleClickOpenConfirmDialog = (templateId) => {
    setSelectedTemplateId(templateId);
    setOpenDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenDialog(false);
    setSelectedTemplateId(null);
    setApplyStatus(null);
  };

  const pollApplyJobStatus = () => {
    const pollInterval = setInterval(() => {
      http
        .get("/web/templateOrganisations/apply/status")
        .then((response) => {
          const { applyTemplateJob } = response.data;
          setApplyStatus(applyTemplateJob.status);
          if (applyTemplateJob?.endDateTime) {
            clearInterval(pollInterval);
            // Handle successful completion
            console.log(
              "Template application completed at:",
              applyTemplateJob.endDateTime,
            );
          }
        })
        .catch((error) => {
          console.error("Error polling job status:", error);
          clearInterval(pollInterval);
          setApplyStatus("POLL_ERROR");
        });
    }, 3000);

    // Clean up interval when component unmounts
    return () => clearInterval(pollInterval);
  };

  const applyTemplate = (templateId) => {
    setApplyStatus("JOB_REQUESTED");
    http
      .post(`/web/templateOrganisations/${templateId}/apply`)
      .then(() => {
        setOpenDialog(true);
        setApplyStatus("JOB_CREATED");
        pollApplyJobStatus();
      })
      .catch((err) => {
        console.error(err);
        setApplyStatus("FAILED");
      });
  };

  const handleApplyConfirm = () => {
    if (selectedTemplateId) {
      applyTemplate(selectedTemplateId);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 3,
          "&:hover": {
            "& .back-text": {
              textDecoration: "underline",
            },
          },
        }}
      >
        <IconButton
          onClick={onBack}
          aria-label="Back To All Templates"
          size="small"
          sx={{
            color: "primary.main",
            "&:hover": {
              backgroundColor: "action.hover",
              "& + .back-text": {
                textDecoration: "underline",
              },
            },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body1"
          color="primary"
          className="back-text"
          sx={{
            cursor: "pointer",
            fontWeight: "medium",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          onClick={onBack}
        >
          Back To All Templates
        </Typography>
      </Stack>

      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {template.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            minWidth: 150,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleClickOpenConfirmDialog(template.id)}
            sx={{
              width: "100%",
              minWidth: 150,
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Apply Template
          </Button>
          <Box sx={{ width: "100%", maxWidth: 200, mt: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                textAlign: "left",
                whiteSpace: "normal",
                lineHeight: 1.3,
              }}
            >
              NOTE: Currently you can apply only one template at a time.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "medium" }}
        >
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {template.description || "No description available"}
        </Typography>

        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "medium" }}
        >
          Details
        </Typography>
        <Box sx={{ mb: 4 }}>
          <ReactMarkdown children={template.summary} />
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCloseConfirmDialog();
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            minHeight: "300px",
            maxWidth: "500px",
            width: "100%",
            margin: "16px",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {applyStatus ? (
          <>
            <DialogTitle id="alert-dialog-title">
              {getDialogTitle(applyStatus)}
            </DialogTitle>
            <DialogContent
              sx={{
                flex: "1 1 auto",
                py: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {!isTerminalStatus(applyStatus) && (
                <CircularProgress size={50} sx={{ mb: 3 }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  maxWidth: "80%",
                  whiteSpace: "pre-line",
                }}
              >
                {getDialogContent(applyStatus)}
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                pb: 2,
                pt: 1,
                justifyContent: "flex-end",
                "& > :not(:first-of-type)": {
                  ml: 2,
                },
              }}
            >
              <Button
                onClick={handleCloseConfirmDialog}
                disabled={!isTerminalStatus(applyStatus)}
                variant="contained"
                sx={{ minWidth: 100 }}
              >
                OK
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle id="alert-dialog-title">
              Are you sure you want to apply this template?
            </DialogTitle>
            <DialogContent sx={{ flex: "1 1 auto", py: 2 }}>
              <DialogContentText id="alert-dialog-description">
                Once applied, you cannot revert this change but you can
                customise it according to your needs.
              </DialogContentText>
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                pb: 2,
                pt: 1,
                justifyContent: "flex-end",
                "& > :not(:first-of-type)": {
                  ml: 2,
                },
              }}
            >
              <Button
                onClick={handleCloseConfirmDialog}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyConfirm}
                variant="contained"
                color="primary"
                sx={{ minWidth: 100 }}
                autoFocus
              >
                Apply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const TemplateOrganisationCard = ({ template, onViewDetails }) => {
  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" component="div" noWrap>
          {template.name}
        </Typography>
        {template.description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mt: 1,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: "1 0 auto",
            }}
          >
            {template.description}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ p: 2, mt: "auto" }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(template);
          }}
          sx={{
            color: "common.white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export const TemplateOrganisations = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    http
      .get("/web/templateOrganisations")
      .then((response) => setTemplates(response.data))
      .catch((error) => console.error("Error loading templates:", error));
  }, []);

  const handleCardClick = (template) => {
    setSelectedTemplate(template);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 5,
        bgcolor: "background.paper",
        width: "100%",
        maxWidth: "100%",
        mx: "auto",
        mt: 3,
        "& .MuiCard-root": {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Title title={"Avni Templates"} />
      {selectedTemplate ? (
        <TemplateOrganisationDetail
          template={selectedTemplate}
          onBack={handleBack}
        />
      ) : (
        <div>
          <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4 }}>
            {"Avni Templates"}
          </Typography>
          <CardContainer>
            {templates.map((template, index) => (
              <TemplateOrganisationCard
                key={template.uuid || index}
                template={template}
                onViewDetails={handleCardClick}
              />
            ))}
          </CardContainer>
        </div>
      )}
    </Box>
  );
};
