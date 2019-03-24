import { assert } from 'chai';

import { httpClient } from "./httpClient";

it('initialise auth context', () => {
    const userInfo = { username: 'abcd', idToken: 'deui3rehd32ouih23iou34o82ud' };
    httpClient.initAuthContext(userInfo);
    assert.deepEqual(httpClient.authContext.get(), { username: 'abcd', token: 'deui3rehd32ouih23iou34o82ud' })
});

it('set headers', () => {
    const params = {};
    const userInfo = { username: 'abcd', idToken: 'deui3rehd32ouih23iou34o82ud' };
    httpClient.initAuthContext(userInfo);
    params.headers = httpClient.setHeaders(params);
    assert.deepEqual(params.headers, new Headers({
                                            accept: 'application/json',
                                            'content-type': 'application/json',
                                            'user-name': 'abcd',
                                            authorization: 'deui3rehd32ouih23iou34o82ud' })
                    );
});
