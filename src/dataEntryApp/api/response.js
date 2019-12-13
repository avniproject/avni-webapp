const subjectDashboardData = {
  data: {
    uuid: "1111",
    firstName: "Shilpa",
    lastName: "Ingle",
    dateOfBirth: "2019-01-28T00:00:00.000",
    gender: "Female",
    address: "Bokkapuram",
    full_address: "Pune, Hinjawadi, Phase 1",
    relationships: [
      {
        uuid: "2222",
        relationshipTypeUUID: "2222-11",
        individualBIsToARelation: "Brother",
        individualBUUID: "2222-22",
        enterDateTime: "2019-02-28T00:00:00.000",
        exitDateTime: null,
        exitObservations: []
      }
    ],
    observations: [
      {
        concept: {
          uuid: "3333",
          name: "Household Number",
          dataType: "Numeric"
        },
        value: 102
      },
      {
        concept: {
          uuid: "87787876678",
          name: "Ph no",
          dataType: "Text"
        },
        value: "+91 9876543210"
      },
      {
        concept: {
          uuid: "4444",
          name: "Blood Group",
          dataType: "Coded"
        },
        value: [
          {
            uuid: "4444-11",
            name: "AB+"
          }
        ]
      },
      {
        concept: {
          uuid: "5555",
          name: "Medical History",
          dataType: "Coded"
        },
        value: [
          {
            uuid: "5555-11",
            name: "Fever",
            abnormal: false
          },
          {
            uuid: "5555-22",
            name: "maleria",
            abnormal: true
          },
          {
            uuid: "5555-33",
            name: "HIV",
            abnormal: true
          }
        ],
        abnormal: true
      }
    ],
    enrolments: []
  }
};

export default subjectDashboardData;
