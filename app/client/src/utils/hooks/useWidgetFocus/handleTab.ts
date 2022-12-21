import {
  getTabbableDescendants,
  getNextTabbableDescendant,
  getFocussableElementOfWidget,
  JSONFORM_WIDGET,
  WIDGET_SELECTOR,
  getNextTabbableDescendantForJSONForm,
  CHECKBOXGROUP_WIDGET,
  SWITCHGROUP_WIDGET,
} from "./tabbable";

export function handleTab(event: KeyboardEvent) {
  let nextTabbableDescendant;
  const shiftKey = event.shiftKey;
  const currentNode = event.target as HTMLElement;
  const currentWidget = currentNode.closest(WIDGET_SELECTOR) as HTMLElement;

  switch (true) {
    // when the current node is a widget, we want to do tabbing in regular way
    // the elements will be in proper order in dom for thes widgets
    case currentWidget && currentWidget.matches(JSONFORM_WIDGET):
    case currentWidget && currentWidget.matches(CHECKBOXGROUP_WIDGET):
    case currentWidget && currentWidget.matches(SWITCHGROUP_WIDGET):
      nextTabbableDescendant = getNextTabbableDescendantForJSONForm(
        currentWidget,
        shiftKey,
      );
      break;
    default:
      const tabbable = getTabbableDescendants(currentNode, shiftKey);

      nextTabbableDescendant = getNextTabbableDescendant(tabbable, shiftKey);
  }

  // if nextTabbableDescendant is found, focus
  if (nextTabbableDescendant) {
    event.preventDefault();

    const focusableElement = getFocussableElementOfWidget(
      nextTabbableDescendant,
    );

    if (focusableElement) {
      focusableElement.focus();
    }
  }
}
