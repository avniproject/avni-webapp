import { isEmpty } from 'lodash';
import { fetchUtils } from 'react-admin';
import { authContext as _authContext } from "../app/authContext";

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

    setHeaders(params) {
        const authParams = this.authContext.get();
        if (!params.headers)
            params.headers = new Headers({ Accept: 'application/json' });
        if (!params.headers.has('Content-Type') &&
            !(params.body && params.body instanceof FormData)) {
                params.headers.set('Content-Type', 'application/json');
        }
        if (!isEmpty(authParams)) {
            params.headers.set('user-name', authParams.username);
            if (authParams.token)
                params.headers.set('Authorization', authParams.token);
        }
    }

    fetchJson(url, params = {}) {
        this.setHeaders(params);
        return fetchUtils.fetchJson(url, params)
            .then(response => response.json)
            .catch(error => alert(error));
    }
}

export const httpClient = new HttpClient();
