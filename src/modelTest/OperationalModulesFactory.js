class OperationalModulesFactory {
  static create({ subjectTypes = [], programs = [], formMappings = [] }) {
    return {
      subjectTypes: subjectTypes,
      programs: programs,
      encounterTypes: [],
      formMappings: formMappings,
    };
  }
}

export default OperationalModulesFactory;
