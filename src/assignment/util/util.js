export const labelValue = (label, value = label) => ({ label, value });
export const labelValueObject = (label, value, object) => ({ label, value, object });

export const refreshTable = ref => {
  if (ref.current && typeof ref.current.refresh === "function") {
    ref.current.refresh();
  } else {
    console.warn("refreshTable: refresh method not found on tableRef");
  }
};
