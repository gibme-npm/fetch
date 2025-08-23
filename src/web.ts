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

import crossFetch, { Headers, Request, Response } from 'cross-fetch';
import AbortController from 'abort-controller';
import { normalizeInit } from './helpers';

export { Headers, Response, Request };

/**
 * Performs a fetch request with the given options
 * @param url
 * @param init
 */
export async function fetch (
    url: string | URL,
    init: fetch.Init = {}
): Promise<Response> {
    init = normalizeInit(init);
    url = url.toString();

    const controller = new AbortController();
    let _timeout: NodeJS.Timeout | undefined;

    if (init.timeout) {
        init.signal ??= controller.signal as any;

        _timeout = setTimeout(() => controller.abort(), init.timeout);
    }

    const response = await crossFetch(url, init);

    if (_timeout) {
        clearTimeout(_timeout);
    }

    return response;
}

export namespace fetch {
    export type Init = RequestInit & {
        timeout?: number;
        formData?: URLSearchParams | Record<string, string | number | boolean>;
        json?: any;
        username?: string;
        password?: string;
        bearer?: string;
        jwt?: string;
    }

    export function get (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'GET' });
    }

    export function head (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'HEAD' });
    }

    export function post (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'POST' });
    }

    export function put (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'PUT' });
    }

    export function del (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'DELETE' });
    }

    export function connect (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'CONNECT' });
    }

    export function options (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'OPTIONS' });
    }

    export function trace (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'TRACE' });
    }

    export function patch (url: string | URL, init: Omit<fetch.Init, 'method'> = {}): Promise<Response> {
        return fetch(url, { ...init, method: 'PATCH' });
    }
}

export default fetch;
export { fetch as Fetch };
