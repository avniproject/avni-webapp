import _ from "lodash/fp";
import React from "react";

//This component is copied from https://github.com/smartprocure/react-freshchat/blob/master/src/react-freshchat.js

class Queue {
  constructor() {
    this.data = [];
    this.index = 0;
  }

  get isEmpty() {
    return this.index >= this.data.length;
  }

  queue(value) {
    this.data.push(value);
  }

  dequeue() {
    if (this.index > -1 && this.index < this.data.length) {
      let result = this.data[this.index++];

      if (this.isEmpty) {
        this.reset();
      }

      return result;
    }
  }

  dequeueAll(cb) {
    if (!_.isFunction(cb)) {
      throw new Error(`Please provide a callback`);
    }

    while (!this.isEmpty) {
      let { method, args } = this.dequeue();
      cb(method, args);
    }
  }

  reset() {
    this.data.length = 0;
    this.index = 0;
  }
}

let fakeWidget;
let earlyCalls = new Queue();

export let widget = (fake = fakeWidget) => {
  if (window.fcWidget) return window.fcWidget;
  if (!fake) fake = mockMethods(availableMethods);
  return fake;
};

let mockMethods = methods => {
  let obj = {};
  methods.forEach(method => {
    obj = _.set(method, queueMethod(method), obj);
  });
  return obj;
};

let queueMethod = method => (...args) => {
  earlyCalls.queue({ method, args });
};

let loadScript = () => {
  let id = "freshchat-lib";
  if (document.getElementById(id) || window.fcWidget) return;
  let script = document.createElement("script");
  script.async = "true";
  script.type = "text/javascript";
  script.src = "https://wchat.freshchat.com/js/widget.js";
  script.id = id;
  document.head.appendChild(script);
};

class FreshChat extends React.Component {
  constructor(props) {
    super(props);

    let { ...moreProps } = props;

    this.init({
      host: "https://wchat.in.freshchat.com",
      token: "774f28b3-1a88-426b-a3f8-42308714f820",
      ...moreProps
    });
  }

  init({ user, ...settings }) {
    if (settings.onInit) {
      let tmp = settings.onInit;
      settings.onInit = () => tmp(widget());
    }

    if (window.fcWidget) {
      window.fcWidget.init(settings);
      if (settings.onInit) {
        settings.onInit();
      }
      this.setUserProperties(user);
    } else {
      this.lazyInit(user, settings);
    }
  }

  lazyInit(user, settings) {
    widget().init(settings); // Can't use window.fcSettings because sometimes it doesn't work

    loadScript();

    let interval = setInterval(() => {
      if (window.fcWidget) {
        clearInterval(interval);
        try {
          earlyCalls.dequeueAll((method, value) => {
            window.fcWidget[method](...value);
          });
        } catch (e) {
          console.error(e);
        }
        if (settings.onInit) {
          settings.onInit();
        }
        this.setUserProperties(user);
      }
    }, 1000);
  }

  setUserProperties(user) {
    window.fcWidget.setExternalId((user && user.username) || "");
    window.fcWidget.user.setFirstName((user && user.username) || "");
    window.fcWidget.user.setEmail((user && user.cognito.attributes.email) || "");
    window.fcWidget.user.setPhone((user && user.cognito.attributes.phone_number) || "");
  }

  render() {
    return false;
  }

  componentWillUnmount() {
    widget().close();
  }
}

let availableMethods = [
  "close",
  "destroy",
  "hide",
  "init",
  "isInitialized",
  "isLoaded",
  "isOpen",
  "off",
  "on",
  "open",
  "setConfig",
  "setExternalId",
  "setFaqTags",
  "setTags",
  "track",
  "user.show",
  "user.track",
  "user.user",
  "user.clear",
  "user.create",
  "user.get",
  "user.isExists",
  "user.setEmail",
  "user.setFirstName",
  "user.setLastName",
  "user.setMeta",
  "user.setPhone",
  "user.setPhoneCountryCode",
  "user.setProperties",
  "user.update"
];

export default FreshChat;
