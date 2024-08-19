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

import { HTTP_METHOD, Fetch } from './types';

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
 * Shared init normalization helper
 *
 * @param init
 */
export const normalizeInit = <T extends Fetch.InitNode = Fetch.InitWeb>(init: T = {} as any): T => {
    init.method ??= HTTP_METHOD.GET;
    init.method = init.method.toUpperCase();
    init.rejectUnauthorized ??= true;

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

    return init;
};
