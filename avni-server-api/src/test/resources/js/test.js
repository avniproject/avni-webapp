var filterTest = function (arr) {
    return arr.filter(function () {
        return true;
    });
};


var Domain = function (val1, val2) {
    this.val1 = val1;
    this.val2 = val2;
    return this;
};

var assignment = function (obj) {
    var domain = new Domain();
    domain.val1 = obj.val1;
    domain.val2 = 1;
};

(function () {
    return {filterTest: filterTest};
}());