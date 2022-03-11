import React from "react";
import { getFormState, useSetFormState } from "../views/FormDesignerContext";
import { Draggable } from "react-beautiful-dnd";
import _, { isEqual } from "lodash";
import produce from "immer";
import { formDesignerGetEmptyFormElement } from "../common/FormDesignerHandlers";
import FormElementWithAddButton from "./FormElementWithAddButton";

function QuestionGroup(props) {
  const { groupIndex, index, formElementData } = props;
  const setState = useSetFormState();
  const state = getFormState();
  const allFormElementsWithIndex = _.map(
    state.form.formElementGroups[groupIndex].formElements,
    (fe, index) => [fe, index]
  );
  const childFormElementsWithIndex = _.filter(
    allFormElementsWithIndex,
    ([fe, index]) => _.get(fe, "parentFormElementUuid") === formElementData.uuid
  );

  const btnGroupAdd = (groupIndex, elementIndex) => {
    setState(
      produce(draft => {
        const formElements = draft.form.formElementGroups[groupIndex].formElements;
        const newFormElement = formDesignerGetEmptyFormElement();
        newFormElement.parentFormElementUuid = formElementData.uuid;
        formElements.splice(elementIndex + 1, 0, newFormElement);
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  React.useEffect(() => {
    if (_.isEmpty(childFormElementsWithIndex)) {
      btnGroupAdd(groupIndex, index);
    }
  }, [childFormElementsWithIndex]);

  return (
    <React.Fragment key={formElementData.uuid}>
      {_.map(childFormElementsWithIndex, ([formElement, feIndex]) => {
        return (
          <Draggable
            key={"Element" + props.groupIndex + "" + feIndex}
            draggableId={"Group" + props.groupIndex + "Element" + feIndex}
            index={feIndex}
            isDragDisabled={props.disableFormElement}
          >
            {provided => (
              <div {...provided.draggableProps} ref={provided.innerRef}>
                <FormElementWithAddButton
                  {...props}
                  key={"Element" + props.groupIndex + "" + feIndex}
                  formElementData={formElement}
                  index={feIndex}
                  btnGroupAdd={btnGroupAdd}
                  dragHandleProps={provided.dragHandleProps}
                />
              </div>
            )}
          </Draggable>
        );
      })}
    </React.Fragment>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(QuestionGroup, areEqual);
