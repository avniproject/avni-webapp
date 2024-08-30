import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { isEmpty, map, orderBy } from "lodash";
import Grid from "@material-ui/core/Grid";
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
                      <ListItemText primary={WebReportCard.getShortDisplayName(card)} secondary={card.description} />
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
