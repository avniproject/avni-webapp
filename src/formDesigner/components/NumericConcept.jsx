import {
  TextField as MuiTextField,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";

const StyledTextField = styled(MuiTextField)({
  width: "10rem",
  "& .MuiInputBase-root": {
    backgroundColor: "white",
    width: "auto",
    minWidth: "7.5rem",
  },
});

export default function NumericConcept({
  onNumericConceptAttributeAssignment,
  numericDataTypeAttributes = {},
  inlineConcept = false,
  groupIndex,
  index,
}) {
  return (
    <div>
      <div style={{ display: "flex", marginBottom: "16px" }}>
        <FormControl sx={{ width: "auto", marginRight: "5rem" }}>
          <StyledTextField
            type="number"
            id="lowAbsolute"
            label="Low Absolute"
            placeholder="Enter Low Absolute"
            margin="normal"
            onChange={(event) =>
              inlineConcept
                ? onNumericConceptAttributeAssignment(
                    groupIndex,
                    "lowAbsolute",
                    event.target.value,
                    index,
                  )
                : onNumericConceptAttributeAssignment(event)
            }
            slotProps={{
              htmlInput: {
                min: 0,
                onWheel: (e) => e.target.blur(),
              },
            }}
            defaultValue={numericDataTypeAttributes?.lowAbsolute}
          />
        </FormControl>
        <FormControl sx={{ width: "auto", marginRight: "5rem" }}>
          <StyledTextField
            type="number"
            id="highAbsolute"
            label="High Absolute"
            placeholder="Enter High Absolute"
            margin="normal"
            onChange={(event) =>
              inlineConcept
                ? onNumericConceptAttributeAssignment(
                    groupIndex,
                    "highAbsolute",
                    event.target.value,
                    index,
                  )
                : onNumericConceptAttributeAssignment(event)
            }
            slotProps={{
              htmlInput: {
                min: 0,
                onWheel: (e) => e.target.blur(),
              },
            }}
            defaultValue={numericDataTypeAttributes?.highAbsolute}
          />
          {numericDataTypeAttributes?.error?.absoluteValidation && (
            <FormHelperText error>
              High absolute must be greater than low absolute and high normal
            </FormHelperText>
          )}
        </FormControl>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <FormControl sx={{ width: "auto", marginRight: "5rem" }}>
          <StyledTextField
            type="number"
            id="lowNormal"
            label="Low Normal"
            placeholder="Enter Low Normal"
            margin="normal"
            onChange={(event) =>
              inlineConcept
                ? onNumericConceptAttributeAssignment(
                    groupIndex,
                    "lowNormal",
                    event.target.value,
                    index,
                  )
                : onNumericConceptAttributeAssignment(event)
            }
            slotProps={{
              htmlInput: {
                min: 0,
                onWheel: (e) => e.target.blur(),
              },
            }}
            defaultValue={numericDataTypeAttributes?.lowNormal}
          />
        </FormControl>
        <FormControl sx={{ width: "auto", marginRight: "5rem" }}>
          <StyledTextField
            type="number"
            id="highNormal"
            label="High Normal"
            placeholder="Enter High Normal"
            margin="normal"
            onChange={(event) =>
              inlineConcept
                ? onNumericConceptAttributeAssignment(
                    groupIndex,
                    "highNormal",
                    event.target.value,
                    index,
                  )
                : onNumericConceptAttributeAssignment(event)
            }
            slotProps={{
              htmlInput: {
                min: 0,
                onWheel: (e) => e.target.blur(),
              },
            }}
            defaultValue={numericDataTypeAttributes?.highNormal}
          />
          {numericDataTypeAttributes?.error?.normalValidation && (
            <FormHelperText error>
              High normal must be greater than low normal and low absolute
            </FormHelperText>
          )}
        </FormControl>
      </div>

      {/* Row 3: Unit */}
      <div>
        <FormControl sx={{ width: "auto", marginRight: "5rem" }}>
          <StyledTextField
            type="string"
            id="unit"
            label="Unit"
            placeholder="Enter unit"
            margin="normal"
            onChange={(event) =>
              inlineConcept
                ? onNumericConceptAttributeAssignment(
                    groupIndex,
                    "unit",
                    event.target.value,
                    index,
                  )
                : onNumericConceptAttributeAssignment(event)
            }
            defaultValue={numericDataTypeAttributes?.unit}
          />
        </FormControl>
      </div>
    </div>
  );
}

NumericConcept.propTypes = {
  onNumericConceptAttributeAssignment: PropTypes.func.isRequired,
  numericDataTypeAttributes: PropTypes.object,
  inlineConcept: PropTypes.bool,
  groupIndex: PropTypes.number,
  index: PropTypes.number,
};
