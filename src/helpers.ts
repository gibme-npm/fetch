// Copyright (c) 2023-2025, Brandon Lehmann <brandonlehmann@gmail.com>
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

import type { fetch as FetchWeb } from './web';
import type { fetch as FetchNode } from './node';

/**
 * Converts the given object into a URLSearchParms object
 *
 * Note: only the top-level structure is handled
 * @param obj
 */
export const toURLSearchParams = (
    obj: Record<string, any>
): URLSearchParams => {
    const params = new URLSearchParams();

    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'undefined') {
            params.set(key, '');
        } else if (typeof obj[key] === 'object') {
            params.set(key, JSON.stringify(obj[key]));
        } else {
            params.set(key, obj[key].toString());
        }
    }

    return params;
};

/**
 * Shared init normalization helper
 * @param init
 */
export const normalizeInit =
    <T extends FetchNode.Init = FetchWeb.Init>(
        init: T = {} as any
    ): T => {
        init.method ??= 'GET';
        init.method = init.method.toUpperCase();
        init.rejectUnauthorized ??= true;
        init.headers ??= new Headers(); // default to empty headers

        if (!['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'].includes(init.method)) {
            throw new Error(`Invalid method: ${init.method}`);
        }

        // if the headers are NOT an instance of Headers, then we need to convert them
        if (!(init.headers instanceof Headers)) {
            const headers = new Headers();

            if (Array.isArray(init.headers)) {
                for (const [header, value] of init.headers) {
                    headers.set(header, value);
                }
            } else if (typeof init.headers === 'object') {
                for (const header of Object.keys(init.headers)) {
                    headers.set(header, init.headers[header]);
                }
            } else {
                throw new Error('headers must be an array, object, or instance of Headers');
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
            case 'PUT':
            case 'POST':
            case 'PATCH':
            case 'DELETE':
                break;
            default:
                delete init.body;
                break;
        }

        return init;
    };
