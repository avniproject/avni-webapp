export const labelValue = (label, value) => ({ label, value });

export const refreshTable = ref => ref.current && ref.current.onQueryChange({ page: 0 });
