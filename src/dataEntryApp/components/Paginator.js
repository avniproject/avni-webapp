import React from "react";
import { Box } from "@material-ui/core";
import { InternalLink, RelativeLink } from "../../common/components/utils";
import PagenatorButton from "./PagenatorButton";
import { useTranslation } from "react-i18next";

const styles = {
  marginRight20: {
    marginRight: 20
  },
  toppagenum: {
    marginRight: 10,
    marginTop: 5,
    backgroundColor: "silver",
    color: "black",
    fontSize: 12,
    padding: 3
  }
};

const PaginationButton = ({ page, title, type }) => (
  <RelativeLink params={{ page }} noUnderline>
    <PagenatorButton type={type}>{title}</PagenatorButton>
  </RelativeLink>
);

const Paginator = ({ pageDetails, label, showCount, onSave, isForRegistration }) => {
  const { t } = useTranslation();

  return (
    <Box justifyContent={"space-start"} flexDirection={"row"} display={"flex"}>
      <Box component={"span"} style={styles.marginRight20}>
        {pageDetails.previousPageNumber ? (
          <PaginationButton
            page={pageDetails.previousPageNumber}
            type={label.type}
            title={t(label.Previous)}
          />
        ) : (
          ""
        )}

        {!pageDetails.previousPageNumber && (
          <InternalLink to={pageDetails.from} params={{ page: "" }} noUnderline>
            <PagenatorButton type={label.type} isDisable={true}>
              {t(label.Previous)}
            </PagenatorButton>
          </InternalLink>
        )}
      </Box>

      {showCount && !pageDetails.isOnSummaryPage && (
        <label style={styles.toppagenum}>
          {" "}
          {`${
            isForRegistration ? pageDetails.currentPageNumber + 1 : pageDetails.currentPageNumber
          } / ${
            isForRegistration ? pageDetails.totalNumberOfPages : pageDetails.totalNumberOfPages + 1
          }`}{" "}
        </label>
      )}

      <Box component={"span"}>
        {!pageDetails.isOnSummaryPage && (
          <PaginationButton
            page={pageDetails.nextPageNumber}
            type={label.type}
            title={t(label.Next)}
          />
        )}

        {pageDetails.isOnSummaryPage && (
          <PagenatorButton type={label.type} onClick={onSave}>
            {t(label.Save)}
          </PagenatorButton>
        )}
      </Box>
    </Box>
  );
};

export default Paginator;
