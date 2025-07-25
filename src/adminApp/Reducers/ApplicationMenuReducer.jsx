import AdminMenuItem from "../ApplicationMenu/AdminMenuItem";

export default class ApplicationMenuReducer {
  static INITIAL_MENU_ITEM = "initialMenuItem";
  static SAVED = "saved";
  static SAVE_FAILED = "saveFailed";
  static ERROR_SAVE = "errorSave";
  static MENU_ITEM = "menuItem";
  static SUBMITTED = "submitted";

  static createApplicationMenuInitialState() {
    return {
      menuItem: new AdminMenuItem(),
      errors: new Map(),
      saved: false
    };
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
        return {
          ...applicationMenuState,
          menuItem: applicationMenuState.menuItem.clone()
        };
      case ApplicationMenuReducer.SUBMITTED:
        const errors = applicationMenuState.menuItem.validate();
        if (errors.size > 0) return { ...applicationMenuState, errors: errors };

        action.payload.cb();
        return { ...applicationMenuState, errors: new Map() };
      default:
        return { ...applicationMenuState };
    }
  }
}

ApplicationMenuReducer.execute.bind(ApplicationMenuReducer);
