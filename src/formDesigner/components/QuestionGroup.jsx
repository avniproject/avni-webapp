import { memo, useEffect, Fragment } from "react";
import { getFormState, useSetFormState } from "../views/FormDesignerContext";
import { Draggable } from "react-beautiful-dnd";
import { isEqual, map, isEmpty, get, filter } from "lodash";
import { produce } from "immer";
import { formDesignerGetEmptyFormElement } from "../common/FormDesignerHandlers";
import FormElementWithAddButton from "./FormElementWithAddButton";

function QuestionGroup(props) {
  const { groupIndex, index, formElementData } = props;
  const setState = useSetFormState();
  const state = getFormState();
  const allFormElementsWithIndex = map(
    state.form.formElementGroups[groupIndex].formElements,
    (fe, index) => [fe, index]
  );
  const childFormElementsWithIndex = filter(
    allFormElementsWithIndex,
    ([fe, index]) =>
      get(fe, "parentFormElementUuid") === formElementData.uuid && !fe.voided
  );

  const btnGroupAdd = (groupIndex, elementIndex) => {
    setState(
      produce(draft => {
        const formElements =
          draft.form.formElementGroups[groupIndex].formElements;
        const newFormElement = formDesignerGetEmptyFormElement();
        newFormElement.parentFormElementUuid = formElementData.uuid;
        formElements.splice(elementIndex + 1, 0, newFormElement);
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  useEffect(() => {
    if (isEmpty(childFormElementsWithIndex)) {
      btnGroupAdd(groupIndex, index);
    }
  }, [childFormElementsWithIndex]);

  return (
    <Fragment key={formElementData.uuid}>
      {map(childFormElementsWithIndex, ([formElement, feIndex]) => {
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
                  ignoreDataTypes={["QuestionGroup"]}
                  parentConceptUuid={get(formElementData, "concept.uuid")}
                />
              </div>
            )}
          </Draggable>
        );
      })}
    </Fragment>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(QuestionGroup, areEqual);
