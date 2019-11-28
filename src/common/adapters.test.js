import {
  mapConcept,
  mapConceptAnswer,
  mapForm,
  mapFormElement,
  mapFormElementGroup,
  mapOperationalModules
} from "./adapters";
import { assert } from "chai";
import {
  Concept,
  ConceptAnswer,
  EncounterType,
  FormElementGroup,
  Program,
  SubjectType
} from "avni-models";

describe("adapters", () => {
  it("can map concept", () => {
    const concept = mapConcept(sampleConcept);
    assert.equal(concept.name, "Caste Category");
    assert.equal(concept.uuid, "61ab6413-5c6a-4512-ab6e-7d5cd1439569");
    assert.equal(concept.voided, false);
    assert.equal(concept.datatype, "Coded");
    assert.equal(concept.hiAbsolute, null);
    assert.equal(concept.lowAbsolute, null);
    assert.equal(concept.lowNormal, null);
    assert.equal(concept.hiNormal, null);

    assert.equal(concept.answers.length, 3);
    assert.equal(concept.answers[0].constructor, ConceptAnswer);
  });

  it("can create concept's answers from json", () => {
    const conceptAnswer = mapConceptAnswer(sampleConcept.conceptAnswers[0]);

    assert.equal(conceptAnswer.uuid, "fe41d8ec-ae5e-4054-963b-f7a1768fb629");
    assert.equal(conceptAnswer.concept.uuid, "cae99772-b389-4baf-849b-9c7c2b06c951");
    assert.equal(conceptAnswer.answerOrder, 4);
    assert.equal(conceptAnswer.abnormal, false);
    assert.equal(conceptAnswer.unique, false);
    assert.equal(conceptAnswer.voided, false);
  });

  it("can map form element group", () => {
    const form = {};
    const feg = mapFormElementGroup(sampleFormElementGroup, form);

    assert.equal(feg.name, "Individual details");
    assert.equal(feg.uuid, "01ec7a55-3204-4518-bfaf-996e44c44243");
    assert.equal(feg.displayOrder, 2);
    assert.equal(feg.voided, false);
    assert.equal(feg.formElements.length, 3);
  });

  it("can map form element", () => {
    const feg = {};
    const fe = mapFormElement(sampleFormElement, feg);

    assert.equal(fe.mandatory, true);
    assert.equal(fe.uuid, "828e27a6-28f0-4cdb-bc02-972d31389c36");
    assert.equal(fe.voided, false);
    assert.equal(fe.displayOrder, 5);
    assert.equal(fe.keyValues.length, 0);
    assert.equal(fe.validFormat, null);
    assert.equal(fe.name, "Standard upto which schooling completed");
    assert.equal(fe.type, "SingleSelect");
    assert.equal(fe.formElementGroup, feg);

    assert.equal(fe.concept.constructor, Concept);
  });

  it("can map form", () => {
    const form = mapForm(sampleForm);

    assert.equal(form.name, "IHMP Registration Form");
    assert.equal(form.uuid, "36ba19a3-c289-44b7-bf56-eed36e9d7519");
    assert.equal(form.formType, "IndividualProfile");
    assert.equal(form.formElementGroups.length, 2);
    assert.equal(form.formElementGroups[0].constructor, FormElementGroup);
    assert.equal(form.formElementGroups[0].name, "Individual details");
    assert.equal(form.formElementGroups[1].uuid, "0ef62f9b-e52e-4fd9-be85-4c3f08c9a973");
  });

  it("can map operational modules", () => {
    const json = {
      formMappings: [{}],
      encounterTypes: [{ uuid: "abc" }],
      programs: [{ uuid: "xyz" }],
      subjectTypes: [{ uuid: "123" }]
    };
    const operationalModules = mapOperationalModules(json);

    assert.equal(operationalModules.formMappings.length, 1);
    assert.equal(operationalModules.encounterTypes.length, 1);
    assert.equal(operationalModules.programs.length, 1);
    assert.equal(operationalModules.subjectTypes.length, 1);

    assert.equal(operationalModules.formMappings[0].constructor, Object);
    assert.equal(operationalModules.encounterTypes[0].constructor, EncounterType);
    assert.equal(operationalModules.programs[0].constructor, Program);
    assert.equal(operationalModules.subjectTypes[0].constructor, SubjectType);

    assert.equal(operationalModules.formMappings[0], json.formMappings[0]);
    assert.equal(operationalModules.encounterTypes[0].uuid, "abc");
    assert.equal(operationalModules.programs[0].uuid, "xyz");
    assert.equal(operationalModules.subjectTypes[0].uuid, "123");
  });
});

const sampleConcept = {
  uuid: "61ab6413-5c6a-4512-ab6e-7d5cd1439569",
  dataType: "Coded",
  conceptAnswers: [
    {
      uuid: "fe41d8ec-ae5e-4054-963b-f7a1768fb629",
      unique: false,
      order: 4,
      answerConcept: {
        uuid: "cae99772-b389-4baf-849b-9c7c2b06c951",
        dataType: "NA",
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "General"
      },
      abnormal: false
    },
    {
      unique: false,
      order: 1,
      answerConcept: {
        uuid: "dd076e03-68ae-4b53-adf6-641c69b9a518",
        dataType: "NA",
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "ST"
      },
      abnormal: false
    },
    {
      unique: false,
      order: 2,
      answerConcept: {
        uuid: "a3519a96-350e-4da4-90d9-827c0ff15538",
        dataType: "NA",
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "SC"
      },
      abnormal: false
    }
  ],
  voided: false,
  highAbsolute: null,
  lowAbsolute: null,
  highNormal: null,
  lowNormal: null,
  name: "Caste Category"
};

const sampleFormElementGroup = {
  uuid: "01ec7a55-3204-4518-bfaf-996e44c44243",
  applicableFormElements: [
    {
      mandatory: true,
      uuid: "828e27a6-28f0-4cdb-bc02-972d31389c36",
      concept: {
        uuid: "38eaf459-4316-4da3-acfd-3c9c71334041",
        dataType: "Numeric",
        conceptAnswers: [],
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "Standard upto which schooling completed"
      },
      voided: false,
      displayOrder: 5,
      keyValues: [],
      validFormat: null,
      name: "Standard upto which schooling completed",
      type: "SingleSelect"
    },
    {
      mandatory: true,
      uuid: "e0cbda04-4ee4-49e5-bdc5-85efdfd3640c",
      concept: {
        uuid: "60c44aa2-3635-487d-8962-43000e77d382",
        dataType: "Text",
        conceptAnswers: [],
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "Caste (Free Text)"
      },
      voided: false,
      displayOrder: 2.5,
      keyValues: [],
      validFormat: null,
      name: "Caste",
      type: "SingleSelect"
    },
    {
      mandatory: false,
      uuid: "14f3babd-1e75-432a-ad42-f5a94eac2059",
      concept: {
        uuid: "61ab6413-5c6a-4512-ab6e-7d5cd1439569",
        dataType: "Coded",
        conceptAnswers: [
          {
            unique: false,
            order: 4,
            answerConcept: {
              uuid: "cae99772-b389-4baf-849b-9c7c2b06c951",
              dataType: "NA",
              voided: false,
              highAbsolute: null,
              lowAbsolute: null,
              highNormal: null,
              lowNormal: null,
              name: "General"
            },
            abnormal: false
          },
          {
            unique: false,
            order: 1,
            answerConcept: {
              uuid: "dd076e03-68ae-4b53-adf6-641c69b9a518",
              dataType: "NA",
              voided: false,
              highAbsolute: null,
              lowAbsolute: null,
              highNormal: null,
              lowNormal: null,
              name: "ST"
            },
            abnormal: false
          },
          {
            unique: false,
            order: 2,
            answerConcept: {
              uuid: "a3519a96-350e-4da4-90d9-827c0ff15538",
              dataType: "NA",
              voided: false,
              highAbsolute: null,
              lowAbsolute: null,
              highNormal: null,
              lowNormal: null,
              name: "SC"
            },
            abnormal: false
          },
          {
            unique: false,
            order: 3,
            answerConcept: {
              uuid: "e92925ed-4a15-40c0-a0a7-a21c965dad48",
              dataType: "NA",
              voided: false,
              highAbsolute: null,
              lowAbsolute: null,
              highNormal: null,
              lowNormal: null,
              name: "OBC"
            },
            abnormal: false
          }
        ],
        voided: false,
        highAbsolute: null,
        lowAbsolute: null,
        highNormal: null,
        lowNormal: null,
        name: "Caste Category"
      },
      voided: false,
      displayOrder: 3,
      keyValues: [],
      validFormat: null,
      name: "Caste category",
      type: "SingleSelect"
    }
  ],
  voided: false,
  displayOrder: 2,
  name: "Individual details"
};

const sampleFormElement = {
  mandatory: true,
  uuid: "828e27a6-28f0-4cdb-bc02-972d31389c36",
  concept: {
    uuid: "38eaf459-4316-4da3-acfd-3c9c71334041",
    dataType: "Numeric",
    conceptAnswers: [],
    voided: false,
    highAbsolute: null,
    lowAbsolute: null,
    highNormal: null,
    lowNormal: null,
    name: "Standard upto which schooling completed"
  },
  voided: false,
  displayOrder: 5,
  keyValues: [],
  validFormat: null,
  name: "Standard upto which schooling completed",
  type: "SingleSelect"
};

const sampleForm = {
  name: "IHMP Registration Form",
  uuid: "36ba19a3-c289-44b7-bf56-eed36e9d7519",
  formType: "IndividualProfile",
  voided: false,
  formElementGroups: [
    {
      uuid: "01ec7a55-3204-4518-bfaf-996e44c44243",
      applicableFormElements: [
        {
          mandatory: true,
          uuid: "828e27a6-28f0-4cdb-bc02-972d31389c36",
          concept: {
            uuid: "38eaf459-4316-4da3-acfd-3c9c71334041",
            dataType: "Numeric",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Standard upto which schooling completed"
          },
          voided: false,
          displayOrder: 5,
          keyValues: [],
          validFormat: null,
          name: "Standard upto which schooling completed",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "e0cbda04-4ee4-49e5-bdc5-85efdfd3640c",
          concept: {
            uuid: "60c44aa2-3635-487d-8962-43000e77d382",
            dataType: "Text",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Caste (Free Text)"
          },
          voided: false,
          displayOrder: 2.5,
          keyValues: [],
          validFormat: null,
          name: "Caste",
          type: "SingleSelect"
        },
        {
          mandatory: false,
          uuid: "14f3babd-1e75-432a-ad42-f5a94eac2059",
          concept: {
            uuid: "61ab6413-5c6a-4512-ab6e-7d5cd1439569",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "cae99772-b389-4baf-849b-9c7c2b06c951",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "General"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "dd076e03-68ae-4b53-adf6-641c69b9a518",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "ST"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "a3519a96-350e-4da4-90d9-827c0ff15538",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "SC"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "e92925ed-4a15-40c0-a0a7-a21c965dad48",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "OBC"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Caste Category"
          },
          voided: false,
          displayOrder: 3,
          keyValues: [],
          validFormat: null,
          name: "Caste category",
          type: "SingleSelect"
        },
        {
          mandatory: false,
          uuid: "55d85d94-02d2-4ebb-9421-e607f26be3cd",
          concept: {
            uuid: "43c4860f-fccf-48c9-818a-191bc0f8d0cf",
            dataType: "Numeric",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Aadhaar ID"
          },
          voided: false,
          displayOrder: 12,
          keyValues: [],
          validFormat: {
            regex: "^[0-9]{12}$",
            descriptionKey: "Required12Digits"
          },
          name: "Aadhaar Number",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "eee22068-4eb8-4b51-9a98-13d48289d761",
          concept: {
            uuid: "6617408e-b89e-4f2f-ab10-d818c5d7f1bd",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "ed1e7397-01cc-47aa-a0ea-3e8af78b09d2",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Female marriage"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "5f23fa43-2e4b-45df-8ca5-5e1ea81f6e2d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Out migrant"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "c3ac52e1-da4d-4ba9-baf9-7b5f6297c2c1",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "In migrant"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "6a85071d-201a-414d-8f25-4e9957053634",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Resident"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "4458026d-eb1a-4d22-9768-0e7741329f9f",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Dead"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Status of the individual"
          },
          voided: false,
          displayOrder: 11,
          keyValues: [],
          validFormat: null,
          name: "Status of the individual",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "c452c6d7-fe30-4e8f-abff-457817b8da2f",
          concept: {
            uuid: "1b6ae290-1823-4aab-91a5-b1d8a1b3b837",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 13,
                answerConcept: {
                  uuid: "05ea583c-51d2-412d-ad00-06c432ffe538",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Other"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 7,
                answerConcept: {
                  uuid: "1a7e9c3e-8b71-46c0-acd5-3d547655116b",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Sister"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "28b6b4bb-63c8-478a-93d3-a340ec13364c",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Daughter"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 8,
                answerConcept: {
                  uuid: "0e78aef9-dabd-49a5-8e21-8889f3b1df19",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Brother"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "4ab468c6-edca-44ae-8158-e98baac08fab",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Son"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 11,
                answerConcept: {
                  uuid: "136a7882-31af-4174-9d7d-2f02f2cc6e7d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Grandmother"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 12,
                answerConcept: {
                  uuid: "6f6ff411-5f62-467b-9e91-6f978aaf0e5d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Grandfather"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "77e9a994-23b5-4d88-bb16-c36dd3c3f58e",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Wife"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 6,
                answerConcept: {
                  uuid: "7699c9e0-aad0-4e20-840f-2012dd220dfc",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Daughter-in-law"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 9,
                answerConcept: {
                  uuid: "d5990426-a36c-4b56-a234-432ad34c69ec",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Sister in law"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "74466f64-3f7c-4046-aaae-57803cee46b1",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Self"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "3305a303-be7f-4270-9f52-055a037b1f1f",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Husband"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 10,
                answerConcept: {
                  uuid: "dbf1d3cc-beca-48d0-90c7-cfeab5df685f",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Brother in law"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Relation to head of the family"
          },
          voided: false,
          displayOrder: 1,
          keyValues: [],
          validFormat: null,
          name: "Relation with head of the family",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "f4ac388b-daab-4e0b-9887-d14fea683f0d",
          concept: {
            uuid: "f27e9504-81a3-48d9-b7cc-4bc90dbd4a30",
            dataType: "Text",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Disability"
          },
          voided: false,
          displayOrder: 10,
          keyValues: [],
          validFormat: null,
          name: "Disability",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "fa28a1ea-1e58-4d8d-8d2a-96380f2b2b9c",
          concept: {
            uuid: "92475d77-7cdd-4976-98f0-3847939a95d1",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "No"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "04bb1773-c353-44a1-a68c-9b448e07ff70",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Yes"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Whether sterilized"
          },
          voided: false,
          displayOrder: 9,
          keyValues: [],
          validFormat: null,
          name: "Whether sterilized",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "d86f03ac-a679-4c70-a861-d331a2e9183f",
          concept: {
            uuid: "cd83afec-d147-42b2-bd50-0ca460dbd55f",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "06aff130-47ec-48d5-b2b9-b9d6e301c0a6",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Skilled manual"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 6,
                answerConcept: {
                  uuid: "28513d88-2fb0-4502-b56d-8eab62dfad15",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Contractor"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "a66d91e3-6d21-40cb-a7e9-43438a635a79",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Housewife"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "e3c6b515-b308-4a23-9067-7cd00f27bb29",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Daily wage labourer"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 8,
                answerConcept: {
                  uuid: "ea26d0d8-3291-4d97-b41d-59cca21bde29",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Health worker"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "0c885b5e-3e4d-4a10-89e4-41011bede03b",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Labourer"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "98bce8ac-e741-4e9f-a660-d935983da335",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Agricultural labourer"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 10,
                answerConcept: {
                  uuid: "a6db1aca-3eb7-4670-a5ff-4aa6c31b597b",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Student"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 9,
                answerConcept: {
                  uuid: "b8129d49-d953-407c-b26a-4d8e3c0a2355",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Priest"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "3ce1383a-0c1f-429c-88d0-cb16470ecdf7",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Skilled worker"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 7,
                answerConcept: {
                  uuid: "95a11c12-8b59-40ff-99c4-e01ad134aa33",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Government Job"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 6,
                answerConcept: {
                  uuid: "4c4435af-33be-4c9f-b86e-067da3081a06",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Shopkeeper"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 9,
                answerConcept: {
                  uuid: "05ea583c-51d2-412d-ad00-06c432ffe538",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Other"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "114c7f99-add9-492b-affc-f30265fdc433",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Farmer"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 8,
                answerConcept: {
                  uuid: "ccb99e5b-d75c-40a3-881d-dc27cdc154ed",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Private Job"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "5cf0393d-940d-4d48-ad6e-4be7034ebc85",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Petty business"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "71137918-fad5-4e42-98b0-c0475e4a8258",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Unemployed"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "aab5a52c-38b9-472b-a90e-3e63022c5a96",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Professional/Technical"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 7,
                answerConcept: {
                  uuid: "45425b1e-53c9-48d3-b4e8-ffdf677da0d7",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Political leader"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Occupation"
          },
          voided: false,
          displayOrder: 6,
          keyValues: [],
          validFormat: null,
          name: "Occupation",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "325bf163-b778-49a0-8dd6-47f499dacb95",
          concept: {
            uuid: "aa6687c9-ba4d-49a3-9b3e-bba266eb6f32",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "327563ae-47b5-46bf-9bcb-640ff6cfc52d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Unmarried"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "9832ccec-edd6-4fa2-96b1-f81832df3996",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Currently married"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 7,
                answerConcept: {
                  uuid: "05ea583c-51d2-412d-ad00-06c432ffe538",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Other"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "a5e367b3-48c6-4b6e-860c-89a1e4ab4b89",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Widow(er)"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 6,
                answerConcept: {
                  uuid: "bbbcef7d-45d4-4dee-b04f-3a954a3bb768",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Remarried"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "00f2eb9a-94c6-48eb-bfad-0b93784d3cb9",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Separated"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "bad132b2-16d1-4fa5-a396-d864d666ac5d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Divorced"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Marital status"
          },
          voided: false,
          displayOrder: 7,
          keyValues: [],
          validFormat: null,
          name: "Marital status",
          type: "SingleSelect"
        },
        {
          mandatory: false,
          uuid: "f913d0db-4b57-4ffa-8e3d-b08666acf4ab",
          concept: {
            uuid: "82fa0dbb-92f9-4ec2-9263-49054e64d909",
            dataType: "Text",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Contact Number"
          },
          voided: false,
          displayOrder: 13,
          keyValues: [],
          validFormat: null,
          name: "Contact Number",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "d3eb6a95-da06-4193-89a9-c1bc0fa18d79",
          concept: {
            uuid: "476a0b71-485b-4a0a-ba6f-4f3cf13568ca",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "eace7aa2-8444-4c43-b5aa-8b5ec0b19a20",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Antyodaya"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "36008c2c-7748-426d-9784-ffc5a267db07",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "APL"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "5c9f10e3-3e20-4a3b-a971-f43b40dd017c",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "BPL"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "No"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Ration Card"
          },
          voided: false,
          displayOrder: 4,
          keyValues: [],
          validFormat: null,
          name: "Ration card",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "8a2895cf-2a61-4864-8ff3-a9f98525a670",
          concept: {
            uuid: "c922c13c-1fa2-42dd-a7e8-d234b0324870",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 6,
                answerConcept: {
                  uuid: "05ea583c-51d2-412d-ad00-06c432ffe538",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Other"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 4,
                answerConcept: {
                  uuid: "9e791139-2d68-45b3-81b6-78e8c3ba9662",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Sikh"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 3,
                answerConcept: {
                  uuid: "48daa405-dcdb-4706-9dbd-a54562012331",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Christian"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 5,
                answerConcept: {
                  uuid: "1819bf5a-775c-4f28-af9e-650dbc5e0570",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Jain"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "2e41ff7c-13ad-4bb3-964a-29f098691a7d",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Muslim"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "5f1f8a86-478b-4e7b-ae5e-ac7b207e65b8",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Hindu"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Religion"
          },
          voided: false,
          displayOrder: 2,
          keyValues: [],
          validFormat: null,
          name: "Religion",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "1550e69c-858a-4723-a010-0ad34047c24e",
          concept: {
            uuid: "1eb73895-ddba-4ddb-992c-03225f93775c",
            dataType: "Coded",
            conceptAnswers: [
              {
                unique: false,
                order: 2,
                answerConcept: {
                  uuid: "e7b50c78-3d90-484d-a224-9887887780dc",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "No"
                },
                abnormal: false
              },
              {
                unique: false,
                order: 1,
                answerConcept: {
                  uuid: "04bb1773-c353-44a1-a68c-9b448e07ff70",
                  dataType: "NA",
                  voided: false,
                  highAbsolute: null,
                  lowAbsolute: null,
                  highNormal: null,
                  lowNormal: null,
                  name: "Yes"
                },
                abnormal: false
              }
            ],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Whether any disability"
          },
          voided: false,
          displayOrder: 9.5,
          keyValues: [],
          validFormat: null,
          name: "Whether any disability",
          type: "SingleSelect"
        },
        {
          mandatory: false,
          uuid: "bb140f85-fe8d-427b-bfec-3995a2542d45",
          concept: {
            uuid: "d685d229-e06e-42f3-90c7-ca06d2fefe17",
            dataType: "Date",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Date of marriage"
          },
          voided: false,
          displayOrder: 8,
          keyValues: [],
          validFormat: null,
          name: "Date of marriage",
          type: "SingleSelect"
        }
      ],
      voided: false,
      displayOrder: 2,
      name: "Individual details"
    },
    {
      uuid: "0ef62f9b-e52e-4fd9-be85-4c3f08c9a973",
      applicableFormElements: [
        {
          mandatory: false,
          uuid: "0e4be1aa-fd10-4c7f-b437-c2134717a094",
          concept: {
            uuid: "24dabc3a-6562-4521-bd42-5fff11ea5c46",
            dataType: "Text",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Household number"
          },
          voided: false,
          displayOrder: 1,
          keyValues: [],
          validFormat: null,
          name: "Household Number",
          type: "SingleSelect"
        },
        {
          mandatory: true,
          uuid: "7c545356-60bb-47f4-9b89-5571644b716b",
          concept: {
            uuid: "25b73ca1-e268-452f-ba05-2595af28ac04",
            dataType: "Numeric",
            conceptAnswers: [],
            voided: false,
            highAbsolute: null,
            lowAbsolute: null,
            highNormal: null,
            lowNormal: null,
            name: "Number of household members (eating together)"
          },
          voided: false,
          displayOrder: 2,
          keyValues: [],
          validFormat: null,
          name: "Number of household members (eating together)",
          type: "SingleSelect"
        }
      ],
      voided: false,
      displayOrder: 1,
      name: "Household Details"
    }
  ]
};

const sampleOperationalModules = {
  formMappings: [
    {
      id: 127,
      uuid: "c2c56a70-23c7-4384-94e4-f5e9d47ce4db",
      encounterTypeId: null,
      programId: null,
      subjectTypeId: 2,
      formId: 66,
      formUuid: "8d1f4548-e327-4416-be33-46b027cc4b59"
    },
    {
      id: 128,
      uuid: "a248c8b3-c963-4280-9409-f2cac4b6a16e",
      encounterTypeId: null,
      programId: 7,
      subjectTypeId: 2,
      formId: 67,
      formUuid: "b768992d-2d6b-48e3-830a-e3029fb08f8e"
    },
    {
      id: 129,
      uuid: "54831de2-0723-4352-921f-94340501149b",
      encounterTypeId: 53,
      programId: 7,
      subjectTypeId: 2,
      formId: 71,
      formUuid: "ac7158bb-1ca9-4a75-b003-f10816830fb0"
    },
    {
      id: 130,
      uuid: "059f7227-30ea-4b0c-be75-4086af3dd133",
      encounterTypeId: 48,
      programId: 7,
      subjectTypeId: 2,
      formId: 68,
      formUuid: "8cd7f4c4-dc56-4e64-89d3-7327900f51f1"
    },
    {
      id: 131,
      uuid: "b672513d-015e-49ca-b4d5-2e258b46a5c4",
      encounterTypeId: 49,
      programId: 7,
      subjectTypeId: 2,
      formId: 69,
      formUuid: "63a064fa-8efe-4ad4-978c-4b973f90afe5"
    },
    {
      id: 132,
      uuid: "dac084bc-0704-42bf-8cd9-e3f5021bcfd9",
      encounterTypeId: 50,
      programId: 7,
      subjectTypeId: 2,
      formId: 69,
      formUuid: "63a064fa-8efe-4ad4-978c-4b973f90afe5"
    },
    {
      id: 133,
      uuid: "20dccc0e-2f1e-4373-b9c1-b42e1bf08b99",
      encounterTypeId: 51,
      programId: 7,
      subjectTypeId: 2,
      formId: 70,
      formUuid: "45b4fd50-0b2d-4aba-8a88-a746d917c1fe"
    },
    {
      id: 134,
      uuid: "d8bf8e51-7f12-4194-a4f1-04cf4f4f12cb",
      encounterTypeId: 52,
      programId: 7,
      subjectTypeId: 2,
      formId: 72,
      formUuid: "4f4539ab-3fe7-44cc-850f-92deac61b767"
    }
  ],
  encounterTypes: [
    {
      name: "Record issues",
      id: 48,
      uuid: "92f1696f-6a7e-4256-a2bf-9780888bbe80",
      operationalEncounterTypeName: "Record issues"
    },
    {
      name: "Record JCB details",
      id: 49,
      uuid: "a8ed0b01-4acc-41c6-8a51-c8c16f2cade7",
      operationalEncounterTypeName: "Record JCB details"
    },
    {
      name: "Record poclain details",
      id: 50,
      uuid: "b7c306d7-b252-4562-8f6e-321643955117",
      operationalEncounterTypeName: "Record poclain details"
    },
    {
      name: "Record beneficiary data",
      id: 51,
      uuid: "f6a89f2f-4aec-44c1-a33e-305f50855e96",
      operationalEncounterTypeName: "Record beneficiary data"
    },
    {
      name: "Endline survey",
      id: 52,
      uuid: "647522f5-a872-44c0-aa51-e82c47a006ee",
      operationalEncounterTypeName: "Endline survey"
    },
    {
      name: "Baseline survey",
      id: 53,
      uuid: "7082bfff-59a4-4c2b-ad28-ca4abe7480c8",
      operationalEncounterTypeName: "Baseline survey"
    }
  ],
  programs: [
    {
      name: "GDGS 2019",
      id: 7,
      uuid: "082180d6-c4ef-4695-a137-f14c3b651736",
      colour: "deepskyblue",
      operationalProgramName: "GDGS 2019",
      programSubjectLabel: "GDGS 2019"
    }
  ],
  subjectTypes: [
    {
      name: "Waterbody",
      id: 2,
      uuid: "8a9b0ef8-325b-4f75-8453-daeaf59df29d",
      operationalSubjectTypeName: "Waterbody"
    }
  ]
};
