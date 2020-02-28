import React from "react";
import { Box, Typography } from "@material-ui/core";
import { InternalLink, RelativeLink } from "../../common/components/utils";
//import PrimaryButton from "./PrimaryButton";
import PrimaryButton from "./PagenatorButton";

const styles = {
  marginRight20: {
    marginRight: 20
  },
  toppagenum: {
    color: "rgba(0, 0, 0, 0.54)",
    marginRight:10,
    fontSize: "12px"
  },
};

const PaginationButton = ({ page, title, type }) =>
  page && (
    <RelativeLink params={{ page }} noUnderline>
      <PrimaryButton type={type}>{title}</PrimaryButton>
    </RelativeLink>
  );

const Paginator = props => {    
  return (
    <Box justifyContent={"space-start"} flexDirection={"row"} display={"flex"}>
      <Box component={"span"} style={styles.marginRight20}>
        <PaginationButton page={props.pageDetails.previousPageNumber}
         type={props.label.type}
         title={props.label.Previous} />

        {!props.pageDetails.previousPageNumber && (
          <InternalLink to={props.pageDetails.from} params={{ page: "" }} noUnderline>
            <PrimaryButton type={props.label.type}>{props.label.Previous}</PrimaryButton>
          </InternalLink>
        )}

      </Box>
      {props.showCount && <Typography style={styles.toppagenum} variant="subtitle1" gutterBottom>  {props.count} </Typography>}
      <Box component={"span"}>
        <PaginationButton page={props.pageDetails.nextPageNumber} 
        type={props.label.type}
        title={props.label.Next} />
        
        {!props.pageDetails.nextPageNumber && props.onSave && (
          <PrimaryButton type={props.label.type} onClick={props.onSave}>{props.label.Save}</PrimaryButton>
        )}
      </Box>
    </Box>
  );
};

export default Paginator;
