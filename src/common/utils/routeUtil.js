export function getHref(resourcePath, basePath = "") {
  return `#${basePath}/${resourcePath}`;
}

export function getRoutePath(basePath, resourcePath) {
  return `${basePath}/${resourcePath}`;
}
