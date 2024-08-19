// Copyright (c) 2023-2024, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import crossFetch, { Headers, Request, Response } from 'cross-fetch';
import fetchCookie from 'fetch-cookie';
import AbortController from 'abort-controller';
import https from 'https';
import http from 'http';
import { normalizeInit, toURLSearchParams } from './helpers';
import { HTTP_METHOD, Fetch } from './types';

export * from './types';
export { Cookie, CookieJar } from 'tough-cookie';
export { Headers, Response, Request, toURLSearchParams };

async function inner (url: string, init: Fetch.InitNode = {}): Promise<Response> {
    init = normalizeInit(init);

    init.agent ??= url.toLowerCase().startsWith('https')
        ? new https.Agent({ rejectUnauthorized: init.rejectUnauthorized })
        : new http.Agent();

    const controller = new AbortController();
    let _timeout: NodeJS.Timeout | undefined;

    if (init.timeout) {
        init.signal ??= controller.signal as any;

        _timeout = setTimeout(() => controller.abort(), init.timeout);
    }

    const response = await (init?.cookieJar
        ? fetchCookie(crossFetch, init.cookieJar)(url, init)
        : crossFetch(url as any, init));

    if (_timeout) {
        clearTimeout(_timeout);
    }

    return response;
};

Object.keys(HTTP_METHOD).map(key => key.toLowerCase()).forEach(method => {
    (inner as any)[method] = async (url: string, init: Fetch.InitNode = {}): Promise<Response> => {
        return inner(url, { ...init, method: method.toUpperCase() });
    };
});

export const fetch: Fetch.NodeInterface = inner as any;
export default fetch;
