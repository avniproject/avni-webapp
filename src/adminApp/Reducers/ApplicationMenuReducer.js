import { MenuItem } from "openchs-models";

export default class ApplicationMenuReducer {
  static INITIAL_MENU_ITEM = "setMenuItem";
  static SAVED = "saved";
  static SAVE_FAILED = "saveFailed";
  static ERROR_SAVE = "errorSave";
  static MENU_ITEM = "menuItem";

  static createApplicationMenuInitialState() {
    return {
      menuItem: new MenuItem(),
      errors: new Map(),
      saved: false
    };
  }

  static getReducer() {
    return (applicationMenuState, action) => this.execute(applicationMenuState, action);
  }

  static execute(applicationMenuState, action) {
    switch (action.type) {
      case ApplicationMenuReducer.INITIAL_MENU_ITEM:
        return { menuItem: action.payload, errors: new Map(), saved: false };
      case ApplicationMenuReducer.SAVED:
        return { ...applicationMenuState, saved: true };
      case ApplicationMenuReducer.SAVE_FAILED:
        applicationMenuState.errors.set(this.ERROR_SAVE, action.payload);
        return {
          ...applicationMenuState,
          saved: false,
          errors: new Map(applicationMenuState.errors)
        };
      case ApplicationMenuReducer.MENU_ITEM:
        Object.assign(applicationMenuState.menuItem, action.payload);
        return { ...applicationMenuState, menuItem: applicationMenuState.menuItem.clone() };
      default:
        return { ...applicationMenuState };
    }
  }
}
