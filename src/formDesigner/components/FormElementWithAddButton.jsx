import { useState, memo } from "react";
import { styled } from "@mui/material/styles";
import { Fab } from "@mui/material";
import { Add } from "@mui/icons-material";
import { isEqual } from "lodash";
import FormElement from "./FormElement";

const StyledRoot = styled("div")({
  paddingLeft: 20,
  paddingBottom: 30
});

const StyledFabContainer = styled("div")({
  position: "absolute",
  marginLeft: -35,
  marginTop: -5
});

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

function FormElementWithAddButton(props) {
  const [hover, setHover] = useState(false);

  const hoverDisplayAddGroup = () => {
    setHover(true);
  };

  const hoverHideAddGroup = () => {
    setHover(false);
  };

  return (
    <StyledRoot
      onMouseEnter={hoverDisplayAddGroup}
      onMouseLeave={hoverHideAddGroup}
    >
      <FormElement {...props} />
      <StyledFabContainer>
        {hover && (
          <Fab
            color="secondary"
            aria-label="add"
            onClick={event => props.btnGroupAdd(props.groupIndex, props.index)}
            size="small"
            disabled={props.disableFormElement}
          >
            <Add />
          </Fab>
        )}
      </StyledFabContainer>
    </StyledRoot>
  );
}

export default memo(FormElementWithAddButton, areEqual);
