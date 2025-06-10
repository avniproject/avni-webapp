import React from "react";
import { List, ListItem, ListItemText, Box, Grid } from "@mui/material";
import { isEmpty, map, orderBy } from "lodash";
import WebReportCard from "../../../common/model/WebReportCard";

const ShowDashboardSectionCards = ({ cards }) => {
  return (
    <div>
      {!isEmpty(cards) && (
        <List>
          {map(orderBy(cards, "displayOrder"), card => (
            <div>
              <Box border={2} my={0.5} borderColor={"rgba(133,133,133,0.49)"}>
                <Grid container direction={"column"}>
                  <Grid item>
                    <ListItem>
                      <ListItemText
                        primary={card.name}
                        secondary={`(${WebReportCard.getStandardReportCardTypeName(card)}) ${card.description}`}
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              </Box>
            </div>
          ))}
        </List>
      )}
    </div>
  );
};

export default ShowDashboardSectionCards;
