import _ from "lodash";
import { stringify } from 'query-string';


const stringifyPagination = (paginationObj, sortObj) => {
    const query = {};
    if (!_.isEmpty(paginationObj)) {
        const { page, perPage } = paginationObj;
        query.page = page - 1;
        query.size = perPage;
    }

    if (!_.isEmpty(sortObj)) {
        if (sortObj instanceof Array) {
            query.sort = sortObj.map((sortItem) => _.join(_.values(sortItem), ","));
        } else if (sortObj instanceof Object) {
            query.sort = _.join(_.values(sortObj), ",");
        } else {
            query.sort = sortObj;
        }
    }
    return stringify(query);
};

class FilterProcessor {
    static getPath(filter) {
        if (_.isEmpty(filter)) return '';

        let basePath = 'search';
        const endingIdPattern = /Id$/;
        const extractEntityName = str => _.upperFirst(str.replace(endingIdPattern, ''));

        if (filter.hasOwnProperty('searchURI'))
            return `${basePath}/${filter.searchURI}`;
        if (_.keys(filter).length === 1 && _.keys(filter)[0].match(endingIdPattern))
            return `${basePath}/findBy${extractEntityName(_.keys(filter)[0])}`;

        return `${basePath}/find`;
    }

    static stringifyFilter(filter) {
        let _filter = Object.assign({}, filter);
        if (_filter.hasOwnProperty('searchURI'))
            delete _filter.searchURI;
        return stringify(_filter);
    }
}

class UrlPartsGenerator {
    static forList(params) {
        let paginationPart = stringifyPagination(params.pagination, params.sort);
        let filter = params.filter;
        let path = FilterProcessor.getPath(filter);
        let queryString = _.trim([FilterProcessor.stringifyFilter(filter), paginationPart].join('&'), '&');
        return `${path}?${queryString}`;
    }

    static forManyReference(params) {
        let paginationPart = stringifyPagination(params.pagination, params.sort);
        let constructedFilter = {};
        constructedFilter[params.target] = params.id;
        let path = FilterProcessor.getPath(constructedFilter);
        path += `?${params.target}=${params.id}`;
        path +=  `&${paginationPart}`;
        return path;
    }
}

export { stringifyPagination, FilterProcessor, UrlPartsGenerator }
