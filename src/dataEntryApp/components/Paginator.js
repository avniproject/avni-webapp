import React from "react";
import { Box } from "@material-ui/core";
import { InternalLink, RelativeLink } from "../../common/components/utils";
import PrimaryButton from "./PrimaryButton";

const styles = {
  marginRight20: {
    marginRight: 20
  }
};

const PaginationButton = ({ page, title }) =>
  page && (
    <RelativeLink params={{ page }} noUnderline>
      <PrimaryButton>{title}</PrimaryButton>
    </RelativeLink>
  );

const Paginator = props => {  
  return (
    <Box justifyContent={"space-start"} flexDirection={"row"} display={"flex"}>
      <Box component={"span"} style={styles.marginRight20}>
        <PaginationButton page={props.pageDetails.previousPageNumber} title={"Previous"} />
        {!props.pageDetails.previousPageNumber && (
          <InternalLink to={props.pageDetails.from} params={{ page: "" }} noUnderline>
            <PrimaryButton>Previous</PrimaryButton>
          </InternalLink>
        )}
      </Box>
      <Box component={"span"}>
        <PaginationButton page={props.pageDetails.nextPageNumber} title={"Next"} />
        {!props.pageDetails.nextPageNumber && props.onSave && (
          <PrimaryButton onClick={props.onSave}>Save</PrimaryButton>
        )}
      </Box>
    </Box>
  );
};

export default Paginator;
