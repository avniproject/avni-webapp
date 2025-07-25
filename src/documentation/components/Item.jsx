import { useState } from "react";
import { styled } from "@mui/material/styles";
import { isFunction } from "lodash";
import { Add, Delete } from "@mui/icons-material";
import { IconButton, Link } from "@mui/material";

const StyledContainer = styled("div")(
  ({ showIcons, isSelected, paddingLeft }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: 30,
    paddingLeft,
    position: "relative",
    backgroundColor:
      showIcons || isSelected
        ? "rgba(145,145,145,0.37)"
        : "rgba(248,248,248,0.37)",
    whiteSpace: "nowrap",
    width: "20vw" // Replaced window.innerWidth / 5 for responsiveness
  })
);

const StyledLink = styled(Link)({
  cursor: "pointer",
  maxWidth: "90%",
  flex: 1,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden"
});

const StyledName = styled("div")(({ theme, extraStyle }) => ({
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  paddingRight: theme.spacing(2.5), // 20px
  ...(extraStyle || {})
}));

const StyledIconsContainer = styled("div")({
  alignSelf: "flex-end",
  position: "absolute",
  right: 0
});

const StyledDeleteIcon = styled(Delete)({
  color: "rgba(175,1,25,0.59)"
});

export const Item = ({
  name,
  onAdd,
  onDelete,
  level,
  disabled,
  onToggle,
  isSelected
}) => {
  const [showIcons, setShowIcons] = useState(false);
  const paddingLeft = level * 15;

  const renderWithLink = () => (
    <StyledLink disabled={disabled} onClick={onToggle}>
      {renderWithoutLink()}
    </StyledLink>
  );

  const renderWithoutLink = extraStyle => (
    <StyledName extraStyle={extraStyle}>{name}</StyledName>
  );

  return (
    <StyledContainer
      showIcons={showIcons}
      isSelected={isSelected}
      paddingLeft={paddingLeft}
    >
      {disabled ? renderWithoutLink({ color: "grey" }) : renderWithLink()}
      {(showIcons || disabled) && (
        <StyledIconsContainer>
          {isFunction(onAdd) && (
            <IconButton size="small" onClick={onAdd}>
              <Add />
            </IconButton>
          )}
          {isFunction(onDelete) && (
            <IconButton size="small" onClick={onDelete}>
              <StyledDeleteIcon />
            </IconButton>
          )}
        </StyledIconsContainer>
      )}
    </StyledContainer>
  );
};
