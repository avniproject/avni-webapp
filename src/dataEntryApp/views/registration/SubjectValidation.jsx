class SubjectValidation {
  constructor(success, formIdentifier, messageKey, extra) {
    this.success = success;
    this.formIdentifier = formIdentifier;
    this.messageKey = messageKey;
    this.extra = extra;
  }

  static stringvalidation(keyValue, formIdentifier, props) {
    var regex = /^[A-Za-z]+$/;
    var result = regex.test(formIdentifier);
    var errormsg = "";
    if (result === true) {
      errormsg = "";
      return new SubjectValidation(true, formIdentifier, errormsg);
    } else if (formIdentifier.trim() == "") {
      errormsg = "Please enter " + keyValue;
      return new SubjectValidation(false, formIdentifier, errormsg);
    } else {
      errormsg = "Please enter " + keyValue;
      return new SubjectValidation(false, formIdentifier, errormsg);
    }
  }
  static dynamicformstring(keyValue, formIdentifier, props) {
    var regex = /^[A-Za-z]+$/;
    var result = regex.test(formIdentifier);
    var errormsg = "";
    if (result === true) {
      errormsg = "";
      return new SubjectValidation(true, formIdentifier, errormsg);
    } else {
      errormsg = "Please enter valid text";
      return new SubjectValidation(false, formIdentifier, errormsg);
    }
  }

  static numaricvalidation(keyValue, formIdentifier, props) {
    // var regex = /^\d{10}$/;
    var regex = /\d+/;
    // var regex = /[a-z]ear/;
    var result = regex.test(formIdentifier);
    var errormsg = "";
    if (result === true) {
      errormsg = "";
      return new SubjectValidation(true, formIdentifier, errormsg);
    } else {
      errormsg = "Please enter numaric values";
      return new SubjectValidation(false, formIdentifier, errormsg);
    }
  }

  static contactvalidation(keyValue, formIdentifier, props) {
    var regex = /^\d{10}$/;
    // var regex = /\d+/;
    // var regex = /[a-z]ear/;
    var result = regex.test(formIdentifier);
    var errormsg = "";
    if (result === true) {
      errormsg = "";
      return new SubjectValidation(true, formIdentifier, errormsg);
    } else {
      errormsg = "Please enter valid contact number";
      return new SubjectValidation(false, formIdentifier, errormsg);
    }
  }
}

export default SubjectValidation;
