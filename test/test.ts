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

import { describe, it, before } from 'mocha';
import * as assert from 'assert';
import fetch, { HTTP_METHOD, toURLSearchParams } from '../src';

describe('Unit Tests', async () => {
    const base_url = 'https://webhook.site';
    let token = '';
    const headers = {
        accept: 'application/json',
        'content-type': 'application/json'
    };

    const sleep = async (ms: number) => new Promise(
        resolve => setTimeout(resolve, ms));

    const fetchRequests = async (formData = false): Promise<{
        method: string,
        body: any
    } | undefined> => {
        const response = await fetch(`${base_url}/token/${token}/requests?sorting=newest`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`[${response.status}] ${response.url}: ${response.statusText}`);
        }

        const json: {
            data: {
                method: string;
                content: string;
            }[]
        } = await response.json();

        const value = json.data.shift();

        if (value) {
            let body: any | undefined;

            if (value.content.length !== 0) {
                if (!formData) {
                    body = JSON.parse(value.content);
                } else {
                    body = new URLSearchParams(value.content);
                }
            }

            return {
                method: value.method,
                body
            };
        }
    };

    before(async () => {
        const response = await fetch(`${base_url}/token`, {
            method: HTTP_METHOD.POST,
            headers
        });

        if (!response.ok) {
            throw new Error(`[${response.status}] ${response.url}: ${response.statusText}`);
        }

        token = (await response.json()).uuid;

        console.log('%s/#!/%s', base_url, token);

        await sleep(2000);
    });

    describe('JSON Tests', async () => {
        for (const method of Object.keys(HTTP_METHOD)) {
            it(method, async function () {
                if (method === 'CONNECT' || method === 'TRACE') {
                    return this.skip();
                }

                const body = { test: true, test_string: 'test', test_number: 3.9 };

                const response = await fetch[method.toLowerCase()](`${base_url}/${token}`, {
                    json: body,
                    timeout: 5_000
                });

                assert.ok(response.ok);

                await sleep(2000);

                const validation = await fetchRequests();

                assert.ok(validation);

                assert.equal(method, validation.method);

                switch (method) {
                    case 'PUT':
                    case 'POST':
                    case 'PATCH':
                    case 'DELETE':
                        assert.deepEqual(body, validation.body);
                        break;
                }
            });
        }
    });

    describe('Form Data Tests', async () => {
        for (const method of Object.keys(HTTP_METHOD)) {
            it(method, async function () {
                if (method === 'CONNECT' || method === 'TRACE') {
                    return this.skip();
                }

                const body = { test: true, test_string: 'test', test_number: 3.9 };

                const response = await fetch[method.toLowerCase()](`${base_url}/${token}`, {
                    formData: body,
                    timeout: 5_000
                });

                assert.ok(response.ok);

                await sleep(2000);

                const validation = await fetchRequests(true);

                assert.ok(validation);

                assert.equal(method, validation.method);

                switch (method) {
                    case 'PUT':
                    case 'POST':
                    case 'PATCH':
                    case 'DELETE':
                        assert.deepEqual(toURLSearchParams(body), validation.body);
                        break;
                }
            });
        }
    });
});
