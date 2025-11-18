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
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const handleClickOpen = (templateId) => {
    setSelectedTemplateId(templateId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTemplateId(null);
  };

  const applyTemplate = (templateId) => {
    http
      .post(`/web/templateOrganisations/${templateId}/apply`)
      .then((res) => console.log(res))
      .catch((err) => console.error(err))
      .finally();
  };

  const handleApplyConfirm = () => {
    if (selectedTemplateId) {
      applyTemplate(selectedTemplateId);
    }
    handleClose();
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
            onClick={() => handleClickOpen(template.id)}
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
        open={open}
        onClose={handleClose}
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
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to apply this template?
        </DialogTitle>
        <DialogContent sx={{ flex: "1 1 auto", py: 2 }}>
          <DialogContentText id="alert-dialog-description">
            Once applied, you cannot revert this change but you can customise it
            according to your needs.
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
            onClick={handleClose}
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
