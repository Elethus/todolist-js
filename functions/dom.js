/**
 * @param {string} tagName
 * @param {object} attributes
 * @return {HTMLElement}
 */
export function createElement(tagName, attributes = {}) {
  const element = document.createElement(tagName)
  for (let [attribut, value] of Object.entries(attributes)) {
    element.setAttribute(attribut, value)
  }
  return element
}