import { KeyValue } from "openchs-models";

class TestKeyValueFactory {
  static create({ key, value }) {
    const keyValue = new KeyValue();
    keyValue.key = key;
    keyValue.value = value;
    return keyValue;
  }
}

export default TestKeyValueFactory;
