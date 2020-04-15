import React from "react";
import { Box, Typography } from "@material-ui/core";
import { InternalLink, RelativeLink } from "../../common/components/utils";
import PagenatorButton from "./PagenatorButton";
import { useTranslation } from "react-i18next";

const styles = {
  marginRight20: {
    marginRight: 20
  },
  marginRight5: {
    marginRight: 5
  },
  toppagenum: {
    backgroundColor: "silver",
    color: "black",
    fontSize: 12,
    padding: 3
  }
};

const PaginationButton = ({ page, title, type, feg, obsHolder }) => {
  return (
    page && (
      <RelativeLink params={{ page }} noUnderline>
        <PagenatorButton type={type} feg={feg} obsHolder={obsHolder}>
          {title}
        </PagenatorButton>
      </RelativeLink>
    )
  );
};

const Paginator = props => {
  const { t } = useTranslation();

  return (
    <Box justifyContent={"space-start"} flexDirection={"row"} display={"flex"}>
      <Box
        component={"span"}
        style={props.label.type == "text" ? styles.marginRight5 : styles.marginRight20}
      >
        <PaginationButton
          page={
            props.pageDetails.nextPageNumber == null
              ? props.pageDetails.previousPageNumber + 1
              : props.pageDetails.previousPageNumber
          }
          type={props.label.type}
          title={t(props.label.Previous)}
          feg={props.feg}
          obsHolder={props.obsHolder}
        />

        {!props.pageDetails.previousPageNumber && (
          <InternalLink to={props.pageDetails.from} params={{ page: "" }} noUnderline>
            <PagenatorButton type={props.label.type} feg={props.feg} obsHolder={props.obsHolder}>
              {t(props.label.Previous)}
            </PagenatorButton>
          </InternalLink>
        )}
      </Box>

      {props.showCount && <label style={styles.toppagenum}> {props.count} </label>}

      <Box component={"span"}>
        <PaginationButton
          page={props.pageDetails.nextPageNumber}
          type={props.label.type}
          title={t(props.label.Next)}
          feg={props.feg}
          obsHolder={props.obsHolder}
        />

        {!props.pageDetails.nextPageNumber && props.onSave && (
          <PagenatorButton
            type={props.label.type}
            feg={props.feg}
            obsHolder={props.obsHolder}
            onClick={props.onSave}
          >
            {t(props.label.Save)}
          </PagenatorButton>
        )}
      </Box>
    </Box>
  );
};

export default Paginator;
