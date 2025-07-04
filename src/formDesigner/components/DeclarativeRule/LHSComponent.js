import { getForm, getFormType, getIsPerson, getParentConceptUuid, useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import ConceptAndScope from "./ConceptAndScope";
import { findOrDefault } from "../../util";
import { isEmpty } from "lodash";

const LHSComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const formType = getFormType();
  const parentConceptUuid = getParentConceptUuid();
  const { lhs } = rule;
  const onLHSChange = (property, value) => {
    dispatch({
      type: "lhsChange",
      payload: { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
    });
  };

  return (
    <ConceptAndScope
      conceptValue={lhs.getTypeOptionValue()}
      onConceptChange={value =>
        dispatch({
          type: "typeChange",
          payload: {
            declarativeRuleIndex,
            ruleIndex,
            conditionIndex,
            formType,
            parentConceptUuid,
            ...value
          }
        })
      }
      defaultOptions={lhs.getDefaultTypeOptions(getForm(), getIsPerson())}
      displayScope={!isEmpty(lhs.conceptName)}
      getScopeValue={scopeOptions => findOrDefault(scopeOptions, ({ value }) => value === lhs.scope, null)}
      formType={formType}
      onScopeChange={value => onLHSChange("scope", value)}
    />
  );
};

export default LHSComponent;
