import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Grid,
  useTheme,
} from "@mui/material";
import { SuggestionCardsProps } from "./types";
import { SUGGESTION_CARDS } from "./constants";

const SuggestionCards: React.FC<SuggestionCardsProps> = ({
  onSuggestionClick,
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={1.5} sx={{ maxWidth: 600, width: "100%" }}>
      {SUGGESTION_CARDS.map((card, index) => (
        <Grid key={index}>
          <Card
            sx={{
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
              height: "60px",
            }}
          >
            <CardActionArea
              onClick={() => onSuggestionClick(card.message)}
              sx={{ height: "100%", px: 3, py: 1 }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ color: theme.palette.primary.main }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SuggestionCards;
