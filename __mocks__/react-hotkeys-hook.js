module.exports = {
  useHotkeys: jest.fn(),
  useRecordHotkeys: jest.fn(() => []),
  isHotkeyPressed: jest.fn(() => false),
  parseHotkey: jest.fn(),
  parseKeys: jest.fn()
};
