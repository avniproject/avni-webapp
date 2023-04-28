class OperationalModulesFactory {
  static create({ subjectTypes = [] }) {
    return {
      subjectTypes: subjectTypes,
      programs: [],
      encounterTypes: []
    };
  }
}

export default OperationalModulesFactory;
