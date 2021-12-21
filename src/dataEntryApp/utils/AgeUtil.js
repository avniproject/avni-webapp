export const getDisplayAge = (dob, t) => {
  const ageInYears = new Date().getFullYear() - new Date(dob).getFullYear();
  const ageInMonths = new Date().getMonth() - new Date(dob).getMonth();
  if (ageInYears) {
    return `${ageInYears} ${t("years")}`;
  } else if (ageInMonths) {
    return `${ageInMonths} ${t("months")}`;
  }
  const days = new Date().getDate() - new Date(dob).getDate();
  return `${days} ${t("days")}`;
};
