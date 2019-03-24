import { assert } from 'chai';
import {
    stringifyPagination,
    FilterProcessor as FP,
    UrlPartsGenerator as UPG } from "./requestUtils";

describe('pagination', () => {
    it('stringifyPagination', () => {
        assert.equal(stringifyPagination({page: 4, perPage: 20}, {field: "name", order: "ASC"}), "page=3&size=20&sort=name%2CASC");
        assert.equal(stringifyPagination({page: 4, perPage: 20}, [{field: "name", order: "ASC"}]), "page=3&size=20&sort=name%2CASC");
        assert.equal(stringifyPagination({page: 4, perPage: 20}, [{field: "name", order: "ASC"}, {field: "id", order: "ASC"}]), "page=3&size=20&sort=name%2CASC&sort=id%2CASC");
        assert.equal(stringifyPagination({page: 4, perPage: 20}, {field: "name"}), "page=3&size=20&sort=name");
        assert.equal(stringifyPagination({page: 4, perPage: 20}, "name"), "page=3&size=20&sort=name");
    });
});

describe('FilterProcessor', () => {
    it('getPath', function () {
        assert.equal(FP.getPath({stateId: 2}), "search/findByState");
        assert.equal(FP.getPath({checklistId: 2}), "search/findByChecklist");
        assert.equal(FP.getPath({stateId: 2, checklistId: 3}), "search/find");
        assert.equal(FP.getPath({}), "");
        assert.equal(FP.getPath({searchURI: 'lastModified', someId: 2}), "search/lastModified");
    });

    it('stringifyFilter', function () {
        assert.equal(FP.stringifyFilter({someId: 2, otherId: 3}), "otherId=3&someId=2");
        assert.equal(FP.stringifyFilter({searchURI: 'lastModified', someId: 2}), "someId=2");
    })
});

describe('UrlPartsGenerator', () => {
    it('forList', function () {
        const params = {
            pagination: {page: 4, perPage: 20},
            sort: {field: "name", order: "ASC"},
            filter: {searchURI: 'byState',  stateId: 2}
        };
        assert.equal(UPG.forList(params), 'search/byState?stateId=2&page=3&size=20&sort=name%2CASC');

        params.pagination = {};
        params.sort = {};
        assert.equal(UPG.forList(params), 'search/byState?stateId=2');

        params.filter = { organisationId: 2 };
        assert.equal(UPG.forList(params), 'search/findByOrganisation?organisationId=2');

        params.filter = { organisationId: 2, stateId: 3 };
        assert.equal(UPG.forList(params), 'search/find?organisationId=2&stateId=3');
    })
});
