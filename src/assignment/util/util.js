export const labelValue = (label, value = label) => ({ label, value });
export const labelValueObject = (label, value, object) => ({ label, value, object });
export const refreshTable = ref => ref.current && ref.current.onQueryChange({ page: 0 });
