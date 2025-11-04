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

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {template.name}
        </Typography>
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pt: 2,
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              console.log("Apply Template clicked:", template.organisationId)
            }
            sx={{
              minWidth: 180,
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            Apply Template
          </Button>
        </Box>
      </Box>
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
