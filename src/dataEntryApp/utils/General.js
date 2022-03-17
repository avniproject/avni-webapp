import moment from "moment";

export const formatDate = aDate => (aDate ? moment(aDate).format("DD-MM-YYYY") : "-");
