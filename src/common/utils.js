
export const jsonResponse = fetchedResponse => fetchedResponse.json();
export const fetchJson = url => fetch(url).then(jsonResponse);
