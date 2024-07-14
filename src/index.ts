// Copyright (c) 2023, Brandon Lehmann <brandonlehmann@gmail.com>
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

import fetch, { Headers, Response, Request } from 'cross-fetch';
import fetchCookie from 'fetch-cookie';
import { CookieJar, Cookie } from 'tough-cookie';
import AbortController from 'abort-controller';
import https from 'https';
import http from 'http';

export { Headers, Response, Request, CookieJar, Cookie };

/** @ignore */
export enum HTTP_METHOD {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    CONNECT = 'CONNECT',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH'
}

/** @ignore */
export type FetchInit = RequestInit & Partial<{
    method: HTTP_METHOD | string;
    cookieJar: CookieJar;
    timeout: number;
    rejectUnauthorized: boolean;
    agent: http.Agent | https.Agent;
    formData: URLSearchParams | {[key: string]: string | number | boolean};
    json: any;
}>;

/** @ignore */
export type FetchCall = (url: string, init?: FetchInit) => Promise<Response>;

/** @ignore */
export interface FetchInterface extends FetchCall {
    get: FetchCall;
    head: FetchCall;
    post: FetchCall;
    put: FetchCall;
    delete: FetchCall;
    connect: FetchCall;
    options: FetchCall;
    trace: FetchCall;
    patch: FetchCall;

    [key: string]: FetchCall;
}

/**
 * Converts the given object into a URLSearchParms object
 *
 * Note: only the top-level structure is handled
 *
 * @param obj
 */
export const toURLSearchParams = (obj: any): URLSearchParams => {
    const data = new URLSearchParams();

    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
            data.set(key, JSON.stringify(obj[key]));
        } else {
            data.set(key, obj[key].toString());
        }
    }

    return data;
};

/**
 * Cross-platform fetch of web resources
 *
 * @param url the requested URL
 * @param init initialization settings
 */
async function gfetch (
    url: string,
    init?: FetchInit
): Promise<Response> {
    init ??= {};
    init.method ??= HTTP_METHOD.GET;
    init.method = init.method.toUpperCase();
    init.rejectUnauthorized ??= true;

    // we cannot specify the agent in a browser
    if (typeof window !== 'undefined') {
        delete init.agent;
    } else {
        let agent: http.Agent | https.Agent;

        if (url.toLowerCase().startsWith('https')) {
            agent = new https.Agent({ rejectUnauthorized: init.rejectUnauthorized });
        } else {
            agent = new http.Agent();
        }

        init.agent ??= agent;
    }

    // assemble the headers into a proper headers class
    if (!(init.headers instanceof Headers)) {
        init.headers ??= [];

        const headers = new Headers();

        if (Array.isArray(init.headers)) {
            for (const [header, value] of init.headers) {
                headers.set(header, value);
            }
        } else {
            for (const header of Object.keys(init.headers)) {
                headers.set(header, init.headers[header]);
            }
        }

        init.headers = headers;
    }

    if (init.formData) {
        init.headers.set('content-type', 'application/x-www-form-urlencoded');

        if (!(init.formData instanceof URLSearchParams)) {
            init.formData = toURLSearchParams(init.formData);
        }

        init.body = init.formData;
    } else if (init.json) {
        init.headers.set('content-type', 'application/json');

        if (typeof init.json !== 'string') {
            init.json = JSON.stringify(init.json);
        }

        init.body = init.json;
    }

    const controller = new AbortController();
    let _timeout: NodeJS.Timeout | undefined;

    if (init.timeout) {
        init.signal ??= controller.signal as any;

        _timeout = setTimeout(() => controller.abort(), init.timeout);
    }

    switch (init.method) {
        case HTTP_METHOD.PUT:
        case HTTP_METHOD.POST:
        case HTTP_METHOD.PATCH:
        case HTTP_METHOD.DELETE:
            break;
        default:
            delete init.body;
            break;
    }

    const response = await (init?.cookieJar
        ? fetchCookie(fetch, init.cookieJar)(url, init)
        : fetch(url as any, init));

    if (_timeout) {
        clearTimeout(_timeout);
    }

    return response;
}

/** @ignore */
const methods = [
    ...Object.keys(HTTP_METHOD),
    ...Object.keys(HTTP_METHOD).map(elem => elem.toLowerCase())
];

// attach our method to UPPERCASE and lowercase methods of the function
for (const method of methods) {
    (gfetch as any)[method] = async (
        url: string,
        init?: FetchInit
    ): Promise<Response> => {
        return gfetch(url, {
            ...init,
            method
        });
    };
}

const exportableFetch: FetchInterface = gfetch as any;

export { exportableFetch as fetch };
export default exportableFetch;
