export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, monthIndex) {
  if (monthIndex === 1) return isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
}

export function monthName(monthIndex) {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][
    monthIndex
  ];
}

// 0 = Mon, 6 = Sun. JS Date.getDay() is 0=Sun..6=Sat.
export function mondayFirstDayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export const MON_FIRST_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
