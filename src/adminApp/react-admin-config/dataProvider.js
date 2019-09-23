import _ from "lodash";
import {
  CREATE,
  UPDATE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE_MANY,
  DELETE
} from "react-admin";
import { UrlPartsGenerator } from "./requestUtils";
import SpringResponse from "./SpringResponse";
import { httpClient } from "../../common/utils/httpClient";

/**
 * Maps react-admin queries to a simple REST API
 *
 * The REST dialect is similar to the one of FakeRest
 * @see https://github.com/marmelab/FakeRest
 * @example
 * GET_LIST     => GET http://my.api.url/posts?sort=['title','ASC']&range=[0, 24]
 * GET_ONE      => GET http://my.api.url/posts/123
 * GET_MANY     => GET http://my.api.url/posts?filter={ids:[123,456,789]}
 * UPDATE       => PUT http://my.api.url/posts/123
 * CREATE       => POST http://my.api.url/posts
 * DELETE       => DELETE http://my.api.url/posts/123
 */

const urlMapping = {
  user: "user",
  catchment: "catchment",
  addressLevelType: "addressLevelType",
  locations: "locations",
  program: "web/program",
  subjectType: "web/subjectType",
  encounterType: "web/encounterType",
  organisationConfig: "organisationConfig"
};
export default apiUrl => {
  /**
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} { url, options } The HTTP request parameters
   */
  const convertDataRequestToHTTP = (type, resource, params) => {
    let url = `${apiUrl}/${urlMapping[resource]}`;
    const options = {};
    switch (type) {
      case GET_LIST:
        url = `${url}/${UrlPartsGenerator.forList(params)}`;
        break;
      case GET_ONE:
        url = `${url}/${params.id}`;
        break;
      case GET_MANY:
        url = `${url}/search/findAllById?ids=${_.join(params["ids"])}`;
        break;
      case GET_MANY_REFERENCE:
        url = `${url}/${UrlPartsGenerator.forManyReference(params)}`;
        break;
      case CREATE:
        url = `${url}`;
        options.method = "POST";
        options.body = JSON.stringify(params.data);
        break;
      case UPDATE:
        url = `${url}/${params.id}`;
        options.method = "PUT";
        options.body = JSON.stringify(params.data);
        break;
      case DELETE:
        url = `${url}/${params.id}`;
        options.method = "DELETE";
        break;
      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
    console.log(
      `Data Provider Action ${type} | Url ${url} | Resource ${resource} | Params ${JSON.stringify(
        params
      )}`
    );
    return { url, options };
  };

  /**
   * @param {Object} response HTTP response from fetch()
   * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
   * @param {String} resource Name of the resource to fetch, e.g. 'posts'
   * @param {Object} params The data request params, depending on the type
   * @returns {Object} Data response
   */
  const convertHTTPResponse = (response, type, resource, params) => {
    const { json } = response;
    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        return SpringResponse.toReactAdminResourceListResponse(json, resource);
      case GET_MANY:
        return SpringResponse.toReactAdminResourceListResponse(json, resource);
      case CREATE:
        return { data: { ...params.data, id: json.id } };
      case DELETE:
        return { data: json || { id: null } };
      default:
        return { data: json };
    }
  };

  /**
   * @param {string} type Request type, e.g GET_LIST
   * @param {string} resource Resource name, e.g. "posts"
   * @param {Object} payload Request parameters. Depends on the request type
   * @returns {Promise} the Promise for a data response
   */
  return (type, resource, params) => {
    // simple-rest doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
    if (type === UPDATE_MANY) {
      return Promise.all(
        params.ids.map(id =>
          httpClient.fetchJson(`${apiUrl}/${resource}/${id}`, {
            method: "PUT",
            body: JSON.stringify(params.data)
          })
        )
      ).then(responses => ({
        data: responses.map(response => response.json)
      }));
    }
    // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    if (type === DELETE_MANY) {
      return Promise.all(
        params.ids.map(id =>
          httpClient.fetchJson(`${apiUrl}/${resource}/${id}`, {
            method: "DELETE"
          })
        )
      ).then(responses => ({
        data: responses.map(response => response.json)
      }));
    }

    const { url, options } = convertDataRequestToHTTP(type, resource, params);
    return httpClient
      .fetchJson(url, options)
      .then(response => convertHTTPResponse(response, type, resource, params));
  };
};
