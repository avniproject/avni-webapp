export function getHref(resourcePath, basePath = "") {
  return `#${basePath}/${resourcePath}`;
}

export function getLinkTo(resourcePath) {
  return `/${resourcePath}`;
}

export function getRoutePath(basePath, resourcePath) {
  return `${basePath}/${resourcePath}`;
}
