import { isEmpty } from 'lodash';
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
        let headers = params.headers || new Headers({ Accept: 'application/json' });
        if (!headers.has('Content-Type') &&
            !(params && params.body && params.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }
        if (!isEmpty(authParams)) {
            headers.set('user-name', authParams.username);
            if (authParams.token)
                headers.set('Authorization', authParams.token);
        }
        return headers;
    }

    fetchJson(url, params = {}) {
        params.headers = this.setHeaders(params);
        return fetch(url, params)
                .then(response => response.json());
    }
}

export const httpClient = new HttpClient();
