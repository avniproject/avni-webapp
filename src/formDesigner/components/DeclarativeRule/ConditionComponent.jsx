import { Fragment } from "react";
import CompoundRuleComponent from "./CompoundRuleComponent";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import ConditionConjunctionComponent from "./ConditionConjunctionComponent";

const ConditionComponent = ({
  condition,
  index,
  declarativeRuleIndex,
  ...props
}) => {
  const dispatch = useDeclarativeRuleDispatch();
  const { compoundRule, conjunction } = condition;

  const onConjunctionChange = conjunction => {
    dispatch({
      type: "conditionConjunctionChange",
      payload: { declarativeRuleIndex, conjunction, index }
    });
  };

  return (
    <Fragment>
      <CompoundRuleComponent
        compoundRule={compoundRule}
        conditionIndex={index}
        declarativeRuleIndex={declarativeRuleIndex}
      />
      <ConditionConjunctionComponent
        onConjunctionChange={onConjunctionChange}
        value={conjunction}
      />
    </Fragment>
  );
};

export default ConditionComponent;
