import { format, isValid } from "date-fns";

export const formatDate = aDate => (aDate && isValid(new Date(aDate)) ? format(new Date(aDate), "dd-MM-yyyy") : "-");
export const formatDateTime = aDate => (aDate && isValid(new Date(aDate)) ? format(new Date(aDate), "dd-MM-yyyy HH:mm") : "-");
