import React from "react";
import { Box, Typography, Button } from "@material-ui/core";
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
  },
  privbuttonStyle: {
    color: "orange",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px",
    backgroundColor: "white"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: "white",
    height: 30,
    fontSize: 12,
    width: 110,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  savebuttonStyle: {
    backgroundColor: "orange",
    marginLeft: 630,
    color: "white",
    height: 30,
    fontSize: 12,
    width: 300,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  topnav: {
    color: "orange",
    fontSize: "12px",
    cursor: "pointer"
  }
};

const PaginationButton = ({ page, title, type, fe, obs }) =>
  page && (
    <RelativeLink params={{ page }} noUnderline>
      <NavChip type={type} fe={props.fe} obs={props.obs}>
        {title}
      </NavChip>
    </RelativeLink>
  );

const onNextBtnClick = props => {
  console.log("In next click method..");
  console.log("props", props);
};

const NavChip = ({ children, ...props }) => {
  if (props.type === "text") {
    return (
      <Typography style={styles.topnav} variant="overline" {...props}>
        {" "}
        {children}{" "}
      </Typography>
    );
  } else if (children === "PREVIOUS") {
    return (
      <Button style={styles.privbuttonStyle} type="button" variant="outlined" {...props}>
        {children}{" "}
      </Button>
    );
  } else if (children === "Save") {
    return (
      <div>
        <Button style={styles.nextbuttonStyle} type="button" {...props}>
          {children}
        </Button>
        {/* <Button className={classes.savebuttonStyle} type="button" {...props}>SAVE AND REGISTER ANOTHER INDIVIDUAL</Button> */}
      </div>
    );
  } else {
    return (
      <Button
        style={styles.nextbuttonStyle}
        type="button"
        {...props}
        onClick={onNextBtnClick.bind(props)}
      >
        {children}
      </Button>
    );
  }
};

const Paginator = props => {
  const { t } = useTranslation();

  return (
    <Box justifyContent={"space-start"} flexDirection={"row"} display={"flex"}>
      <Box component={"span"} style={styles.marginRight20}>
        <PaginationButton
          page={props.pageDetails.previousPageNumber}
          type={props.label.type}
          title={t(props.label.Previous)}
          fe={props.fe}
          obs={props.obs}
        />

        {!props.pageDetails.previousPageNumber && (
          <InternalLink to={props.pageDetails.from} params={{ page: "" }} noUnderline>
            <NavChip type={props.label.type} fe={props.fe} obs={props.obs}>
              {t(props.label.Previous)}
            </NavChip>
          </InternalLink>
        )}
      </Box>

      {props.showCount && <label style={styles.toppagenum}> {props.count} </label>}

      <Box component={"span"}>
        <PaginationButton
          page={props.pageDetails.nextPageNumber}
          type={props.label.type}
          title={t(props.label.Next)}
          fe={props.fe}
          obs={props.obs}
        />

        {!props.pageDetails.nextPageNumber && props.onSave && (
          <NavChip type={props.label.type} onClick={props.onSave}>
            {t(props.label.Save)}
          </NavChip>
        )}
      </Box>
    </Box>
  );
};

export default Paginator;
