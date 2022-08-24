import { MenuItem } from "openchs-models";

export default class ApplicationMenuReducer {
  static SET_MENU_ITEM = "setMenuItem";
  static SAVED = "saved";
  static SAVE_FAILED = "saveFailed";

  static ERROR_SAVE = "errorSave";

  static applicationMenuInitialState = {
    menuItem: new MenuItem(),
    errors: new Map(),
    saved: false
  };

  static execute(applicationMenuState, action) {
    switch (action.type) {
      case ApplicationMenuReducer.SET_MENU_ITEM:
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
      default:
        return { ...applicationMenuState };
    }
  }
}
