import { isEmpty, forEach } from 'lodash';
import { fetchUtils } from 'react-admin';
import { authContext as _authContext } from "../app/authContext";
import { stringify } from 'query-string';

class HttpClient {
    static instance;
    constructor() {
        if (HttpClient.instance)
            return HttpClient.instance;
        this.authContext = _authContext;
        this.initAuthContext = this.initAuthContext.bind(this);
        this.setHeaders = this.setHeaders.bind(this);
        this.fetchJson = this.fetchJson.bind(this);
        HttpClient.instance = this;
    }

    initAuthContext(userInfo) {
        this.authContext.init(userInfo);
    }

    setHeaders(options) {
        const authParams = this.authContext.get();
        if (!options.headers)
            options.headers = new Headers({ Accept: 'application/json' });
        if (!options.headers.has('Content-Type') &&
            !(options.body && options.body instanceof FormData)) {
                options.headers.set('Content-Type', 'application/json');
        }
        if (!isEmpty(authParams)) {
            options.headers.set('user-name', authParams.username);
            if (authParams.token)
                options.headers.set('AUTH-TOKEN', authParams.token);
        }
    }

    fetchJson(url, options = {}) {
        this.setHeaders(options);
        return fetchUtils.fetchJson(url, options);
    }

    withParams(url, params) {
        return url + '?' + stringify(params);
    }
}

export const httpClient = new HttpClient();
