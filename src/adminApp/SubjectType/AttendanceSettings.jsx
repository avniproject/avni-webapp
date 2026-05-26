import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { default as UUID } from "uuid";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { SubjectTypeType } from "./Types";
import EditAttendanceTypeModal from "./EditAttendanceTypeModal";
import ConfirmDialog from "../../dataEntryApp/components/ConfirmDialog";

const StyledContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  border: "1px solid #e1e1e1",
  borderRadius: theme.shape.borderRadius,
  maxWidth: "75%",
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

const StyledList = styled(List)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "isDragging",
})(({ theme, isDragging }) => ({
  backgroundColor: isDragging ? "#f5f5f5" : "#fff",
  marginBottom: theme.spacing(1),
  border: "1px solid #e0e0e0",
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: "#fafafa",
  },
}));

const StyledWarningAlert = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledCaption = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
}));

const isIncomplete = (type) =>
  !type.config?.sessionOutcomeReasonConcept ||
  !type.config?.absenceReasonConcept;

const AttendanceSettings = ({ subjectType, dispatch }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [localError, setLocalError] = useState("");

  if (subjectType.type !== SubjectTypeType.Group) {
    return null;
  }

  const { attendanceEnabled = false, attendanceTypes = [] } = subjectType;
  const activeTypes = attendanceTypes
    .filter((t) => !t.voided)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const incompleteTypes = activeTypes.filter(isIncomplete);

  const handleToggleAttendance = (checked) => {
    setLocalError("");
    dispatch({ type: "attendanceEnabled", payload: checked });
    if (checked && activeTypes.length === 0) {
      dispatch({
        type: "addAttendanceType",
        payload: {
          uuid: UUID.v4(),
          name: "Attendance",
          sortOrder: 1,
          config: {},
          voided: false,
        },
      });
    }
  };

  const handleAddType = () => {
    setEditingType(null);
    setModalOpen(true);
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setModalOpen(true);
  };

  const requestDelete = (type) => {
    setTypeToDelete(type);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!typeToDelete) return;
    if (activeTypes.length === 1 && attendanceEnabled) {
      setLocalError(
        "Cannot delete the last attendance type when attendance is enabled",
      );
      setTypeToDelete(null);
      return;
    }
    dispatch({ type: "removeAttendanceType", payload: typeToDelete.uuid });
    setTypeToDelete(null);
  };

  const handleSaveType = (attendanceType) => {
    const isEditing = !!editingType;
    const payload = {
      ...attendanceType,
      uuid: attendanceType.uuid || UUID.v4(),
      voided: false,
    };
    dispatch({
      type: isEditing ? "updateAttendanceType" : "addAttendanceType",
      payload,
    });
    setModalOpen(false);
    setEditingType(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const activeReordered = Array.from(activeTypes);
    const [moved] = activeReordered.splice(result.source.index, 1);
    activeReordered.splice(result.destination.index, 0, moved);
    const sortOrderByUuid = new Map(
      activeReordered.map((t, i) => [t.uuid, i + 1]),
    );
    const merged = attendanceTypes.map((t) =>
      sortOrderByUuid.has(t.uuid)
        ? { ...t, sortOrder: sortOrderByUuid.get(t.uuid) }
        : t,
    );
    dispatch({ type: "attendanceTypes", payload: merged });
  };

  return (
    <StyledContainer>
      <StyledHeader variant="subtitle1">Attendance</StyledHeader>

      <AvniSwitch
        switchFirst
        checked={attendanceEnabled}
        onChange={(event) => handleToggleAttendance(event.target.checked)}
        name="Enable attendance"
        toolTipKey="APP_DESIGNER_SUBJECT_TYPE_ENABLE_ATTENDANCE"
      />

      {localError && (
        <StyledWarningAlert severity="error" onClose={() => setLocalError("")}>
          {localError}
        </StyledWarningAlert>
      )}

      {attendanceEnabled && (
        <>
          {incompleteTypes.length > 0 && (
            <StyledWarningAlert severity="warning">
              The following attendance types are incomplete and must be
              configured: {incompleteTypes.map((t) => t.name).join(", ")}
            </StyledWarningAlert>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="attendance-types">
              {(provided) => (
                <StyledList
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {activeTypes.map((type, index) => (
                    <Draggable
                      key={type.uuid}
                      draggableId={type.uuid}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <StyledListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          isDragging={snapshot.isDragging}
                        >
                          <IconButton
                            {...provided.dragHandleProps}
                            disableRipple
                            sx={{ mr: 1, cursor: "grab" }}
                          >
                            <DragIndicator />
                          </IconButton>
                          <ListItemText primary={type.name} />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEditType(type)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => requestDelete(type)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </StyledListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </StyledList>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddType}
            sx={{ mt: 2 }}
          >
            Add Attendance Type
          </Button>

          <StyledCaption>
            Calendar is resolved per-class from the class's address-level chain.
            Not configured here.
          </StyledCaption>
          <StyledCaption>
            No meeting-days override — every working day of the resolved
            calendar is an expected session.
          </StyledCaption>
        </>
      )}

      <EditAttendanceTypeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingType(null);
        }}
        onSave={handleSaveType}
        attendanceType={editingType}
        existingTypes={activeTypes}
        subjectType={subjectType}
      />

      <ConfirmDialog
        title="Delete Attendance Type"
        message={`Are you sure you want to delete the attendance type "${typeToDelete?.name}"?`}
        open={deleteConfirmOpen}
        setOpen={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirmed}
      />
    </StyledContainer>
  );
};

export default AttendanceSettings;
