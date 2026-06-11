import { memo, useEffect } from "react";
import { getFormState, useSetFormState } from "../views/FormDesignerContext";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { isEqual, map, isEmpty, get, filter } from "lodash";
import { produce } from "immer";
import { formDesignerGetEmptyFormElement } from "../common/FormDesignerHandlers";
import FormElementWithAddButton from "./FormElementWithAddButton";

export const QUESTION_GROUP_CHILDREN_DROPPABLE_TYPE_PREFIX =
  "QuestionGroupChildren";
export const QUESTION_GROUP_CHILD_DRAGGABLE_ID_PREFIX = "QuestionGroupChild";

function QuestionGroup(props) {
  const { groupIndex, index, formElementData } = props;
  const setState = useSetFormState();
  const state = getFormState();
  const allFormElementsWithIndex = map(
    state.form.formElementGroups[groupIndex].formElements,
    (fe, index) => [fe, index],
  );
  const childFormElementsWithIndex = filter(
    allFormElementsWithIndex,
    ([fe]) =>
      get(fe, "parentFormElementUuid") === formElementData.uuid && !fe.voided,
  );

  const btnGroupAdd = (groupIndex, elementIndex) => {
    setState(
      produce((draft) => {
        const formElements =
          draft.form.formElementGroups[groupIndex].formElements;
        const newFormElement = formDesignerGetEmptyFormElement();
        newFormElement.parentFormElementUuid = formElementData.uuid;
        formElements.splice(elementIndex + 1, 0, newFormElement);
        draft.detectBrowserCloseEvent = true;
      }),
    );
  };

  useEffect(() => {
    if (isEmpty(childFormElementsWithIndex)) {
      btnGroupAdd(groupIndex, index);
    }
  }, [childFormElementsWithIndex]);

  return (
    <Droppable
      droppableId={
        QUESTION_GROUP_CHILDREN_DROPPABLE_TYPE_PREFIX + formElementData.uuid
      }
      type={
        QUESTION_GROUP_CHILDREN_DROPPABLE_TYPE_PREFIX + formElementData.uuid
      }
    >
      {(droppableProvided) => (
        <div
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          {map(
            childFormElementsWithIndex,
            ([formElement, feIndex], childIndex) => {
              return (
                <Draggable
                  key={formElement.uuid}
                  draggableId={
                    QUESTION_GROUP_CHILD_DRAGGABLE_ID_PREFIX + formElement.uuid
                  }
                  index={childIndex}
                  isDragDisabled={props.disableFormElement}
                >
                  {(provided) => (
                    <div {...provided.draggableProps} ref={provided.innerRef}>
                      <FormElementWithAddButton
                        {...props}
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
            },
          )}
          {droppableProvided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(QuestionGroup, areEqual);
