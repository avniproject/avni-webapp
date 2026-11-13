const subjectTypeOf = (filter) => filter?.subjectTypeUUID || null;

export const isSameFilter = (a, b) => !!a && !!b && a.titleKey === b.titleKey && subjectTypeOf(a) === subjectTypeOf(b);

export const withoutFilter = (filters, filter) => (filters || []).filter((f) => !isSameFilter(f, filter));
