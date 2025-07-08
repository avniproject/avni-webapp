import { startOfDay, addDays } from "date-fns";
import { labelValue } from "./util";

const getDateAfter = days => startOfDay(addDays(new Date(), days));

export const dateFilterFieldOptions = [
  labelValue("Any time", new Date("1900-01-01T18:30:00.000Z")),
  labelValue("Yesterday", getDateAfter(-1)),
  labelValue("Last 7 days", getDateAfter(-7)),
  labelValue("Last 30 days", getDateAfter(-30)),
  labelValue("Last 60 days", getDateAfter(-60)),
  labelValue("Last 180 days", getDateAfter(-180))
];
