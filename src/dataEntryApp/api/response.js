const subjectDashboardData = {
    data: {
        uuid: '1111',
        firstName: 'Shilpa',
        lastName: 'Ingle',
        dateOfBirth: '2019-01-28T00:00:00.000',
        gender: 'Female',
        address: 'Bokkapuram',
        full_address: 'Pune, Hinjawadi, Phase 1',
        relationships: [
            {
                uuid: '2222',
                relationshipTypeUUID: '2222-11',
                individualBIsToARelation: 'Brother',
                individualBUUID: '2222-22',
                enterDateTime: '2019-02-28T00:00:00.000',
                exitDateTime: null,
                exitObservations: [],
            },
        ],
        observations: [
            {
                concept: {
                    uuid: '3333',
                    name: 'Household Number',
                },
                value: 102,
                abnormal: false
            },
            {
                concept: {
                    uuid: '4444',
                    name: 'Blood Group',
                },
                value: [
                    {
                        uuid: '4444-11',
                        name: 'AB+'
                    }
                ],
                abnormal: false
            },
            {
                concept: {
                    uuid: '5555',
                    name: 'Medical History',
                },
                value: [
                    {
                        uuid: '5555-11',
                        name: 'Fever'
                    },
                    {
                        uuid: '5555-22',
                        name: 'maleria'
                    },
                    {
                        uuid: '5555-33',
                        name: 'HIV'
                    }
                ],
                abnormal: true
            },
        ],
        enrolments: [
        ]
    }
}

export default subjectDashboardData;