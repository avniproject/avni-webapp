import { useEffect, useState, useRef } from "react";
import { Button, Grid } from "@mui/material";
import Select from "react-select";
import _, { map } from "lodash";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import DashboardService from "../../../common/service/DashboardService";

export const SelectCardsView = ({ dashboardSection, addCards }) => {
  const [allCards, setAllCards] = useState([]);
  const [cardsToBeAdded, setCardsToBeAdded] = useState([]);
  const cardSelectRef = useRef(null);

  useEffect(() => {
    DashboardService.getAllReportCards().then(res => setAllCards(res));
  }, []);

  const onSelectChange = event => {
    const selectedCards = allCards.filter(a => _.some(event, lvPair => a.id === lvPair.value));
    setCardsToBeAdded(selectedCards);
  };

  const addCardsToDashboard = event => {
    event.preventDefault();
    addCards(cardsToBeAdded);
    setCardsToBeAdded([]);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid style={{ zIndex: 2 }} size={10}>
          <Select
            name="addCard"
            ref={cardSelectRef}
            isMulti
            isSearchable
            options={map(WebDashboardSection.getCardsNotAdded(dashboardSection, allCards), ({ id, name }) => ({
              label: name,
              value: id
            }))}
            onChange={onSelectChange}
            value={cardsToBeAdded.map(x => {
              return { value: x.id, label: x.name };
            })}
          />
        </Grid>
        <Grid size={2}>
          <Button variant="contained" color="primary" onClick={addCardsToDashboard} disabled={cardsToBeAdded.length === 0} fullWidth={true}>
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
