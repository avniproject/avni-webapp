import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { List, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { InternalLink } from "../../../common/components/utils";
import { useTranslation } from "react-i18next";
import SubjectTypeIcon from "../../components/SubjectTypeIcon";
import { sortBy } from "lodash";
import ListItemButton from "@mui/material/ListItemButton";

const StyledContainer = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2.5), // 20px
  color: "blue",
  borderRadius: "3px"
}));

const StyledInternalLink = styled(InternalLink)({
  color: "blue"
});

const StyledDivider = styled(Divider)({
  backgroundColor: "grey"
});

function NewMenu({ handleClose }) {
  const { t } = useTranslation();
  const operationalModules = useSelector(
    state => state.dataEntry.metadata.operationalModules
  );

  return (
    <StyledContainer>
      <List component="nav" aria-labelledby="nested-list-subheader">
        {sortBy(operationalModules.subjectTypes, ({ name }) => t(name)).map(
          (element, index) => (
            <Fragment key={index}>
              <StyledInternalLink to={`/app/register?type=${element.name}`}>
                <ListItemButton onClick={handleClose}>
                  <ListItemIcon>
                    <SubjectTypeIcon subjectType={element} size={25} />
                  </ListItemIcon>
                  <ListItemText primary={t(element.name)} />
                  <ChevronRight />
                </ListItemButton>
              </StyledInternalLink>
              <StyledDivider />
            </Fragment>
          )
        )}
      </List>
    </StyledContainer>
  );
}

export default NewMenu;
