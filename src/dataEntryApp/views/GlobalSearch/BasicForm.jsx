import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import {
  TextField,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { find } from "lodash";
import AddressLevelsByType from "../../../common/components/AddressLevelsByType";

const StyledContainer = styled(Grid)({
  marginTop: "1%",
  marginBottom: "1%",
});

const StyledLabel = styled(Typography)({
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)",
});

function BasicForm({
  searchFilterForms = [],
  onChange,
  genders,
  onGenderChange,
  selectedGender,
  enterValue,
  addressLevelIds,
  setAddressLevelIds,
}) {
  const { t } = useTranslation();

  function renderSearchAll(index, titleKey) {
    return (
      <Grid key={index}>
        <StyledLabel variant="body1">{t(titleKey)}</StyledLabel>
        <TextField
          id={titleKey}
          key={index}
          autoComplete="off"
          name="searchAll"
          type="text"
          style={{ width: "100%" }}
          onChange={onChange}
          value={enterValue.searchAll}
        />
      </Grid>
    );
  }

  const isFilterConfigured = !!find(searchFilterForms, (sff) => sff.type);

  return isFilterConfigured ? (
    <Fragment>
      <StyledContainer container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Name" ? (
            <Grid key={index}>
              <StyledLabel variant="body1">
                {t(searchFilterForm.titleKey)}
              </StyledLabel>
              <TextField
                id={searchFilterForm.titleKey}
                key={index}
                name="name"
                autoComplete="off"
                type="text"
                style={{ width: "100%" }}
                onChange={onChange}
                value={enterValue.name}
              />
            </Grid>
          ) : (
            ""
          ),
        )}

        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Age" ? (
            <Grid key={index}>
              <StyledLabel variant="body1">
                {t(searchFilterForm.titleKey)}
              </StyledLabel>
              <TextField
                id={searchFilterForm.titleKey}
                key={index}
                autoComplete="off"
                name="age"
                type="number"
                style={{ width: "100%" }}
                onChange={onChange}
                value={enterValue.age}
                slotProps={{
                  htmlInput: {
                    onWheel: (e) => e.target.blur(),
                  },
                }}
              />
            </Grid>
          ) : (
            ""
          ),
        )}

        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "SearchAll"
            ? renderSearchAll(index, searchFilterForm.titleKey)
            : "",
        )}
      </StyledContainer>
      <StyledContainer container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Gender" ? (
            <Grid key={index} size={12}>
              <StyledLabel variant="body1">
                {t(searchFilterForm.titleKey)}
              </StyledLabel>
              <FormGroup row>
                {genders.map((gender, index) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          selectedGender != null
                            ? selectedGender[gender.uuid]
                            : false
                        }
                        onChange={onGenderChange}
                        name={gender.uuid}
                        color="primary"
                      />
                    }
                    label={t(gender.name)}
                    key={index}
                  />
                ))}
              </FormGroup>
            </Grid>
          ) : (
            ""
          ),
        )}
      </StyledContainer>

      <StyledContainer container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) =>
          searchFilterForm.type === "Address" ? (
            <Grid key={index} size={12}>
              <AddressLevelsByType
                label={t(searchFilterForm.titleKey)}
                addressLevelsIds={addressLevelIds}
                setAddressLevelsIds={setAddressLevelIds}
              />
            </Grid>
          ) : (
            ""
          ),
        )}
      </StyledContainer>
    </Fragment>
  ) : (
    <StyledContainer container spacing={3}>
      {renderSearchAll(1, "searchAll")}
    </StyledContainer>
  );
}

export default BasicForm;
