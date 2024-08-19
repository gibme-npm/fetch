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

import type { Response } from 'cross-fetch';
import type { CookieJar } from 'tough-cookie';
import type { Agent as HttpAgent } from 'http';
import type { Agent as HttpsAgent } from 'https';

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

export namespace Fetch {
    export type Agent = HttpAgent | HttpsAgent;

    export interface InitWeb extends RequestInit {
        method?: HTTP_METHOD | string;
        timeout?: number;
        formData?: URLSearchParams | Record<string, string | number | boolean>;
        json?: any;
    }

    export interface InitNode extends InitWeb {
        cookieJar?: CookieJar;
        rejectUnauthorized?: boolean;
        agent?: Agent;
    }

    export interface WebInterface {
        (url: string, init?: InitWeb): Promise<Response>;
        get: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        head: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        post: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        put: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        delete: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        connect: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        options: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        trace: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
        patch: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;

        [key: string]: (url: string, init?: Omit<InitWeb, 'method'>) => Promise<Response>;
    }

    export interface NodeInterface {
        (url: string, init?: InitNode): Promise<Response>;
        get: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        head: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        post: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        put: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        delete: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        connect: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        options: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        trace: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
        patch: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;

        [key: string]: (url: string, init?: Omit<InitNode, 'method'>) => Promise<Response>;
    }
}
