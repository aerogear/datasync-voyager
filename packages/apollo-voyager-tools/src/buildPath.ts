/**
 * builds path for a GraphQL operation
 * examples:
 - top level resolver : allMemes
 - nested resolver    : allMemes.0.owner
 * @param path - GraphQL path object
 * @returns {string} the path built
 */
export function buildPath (path: any): String {
  let pathItems = []
  let currPath = path
  while (currPath) {
    // currPath.key could be "0", so can't use falsy test
    if (currPath.key === undefined || currPath.key === null) {
      break
    }
    pathItems.unshift(currPath.key) // prepend
    currPath = currPath.prev
  }

  return pathItems.join('.')
}