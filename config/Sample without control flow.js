var getDecision = function (questionnaireAnswers) {
    var decision = {};
    decision.name = "Treatment";
    decision.code = "ABC001";
    decision.value = "The patient should be referred to the hospital immediately as he may having tuberculosis";
    decision.alert = "ALERT MESSAGE";
    return [decision];
};