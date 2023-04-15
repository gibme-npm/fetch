# [cross-fetch](https://npmjs.org/package/cross-fetch) wrapper

* Supports `timeout` option
* Supports the use of CookieJars via `cookieJar` option
  * Pass in a cookie jar and have your cookies persistent between calls

### Sample Code

```typescript
import fetch from '@gibme/fetch';

(async () => {
    console.log(await fetch('https://google.com', { timeout: 5000 }));
    
    console.log(await fetch.get('https://google.com'));
})();
```

#### Using a CookieJar

```typescript
import fetch, {CookieJar } from "@gibme/fetch";

(async () => {
    const cookieJar = new CookeJar();
    
    console.log(await fetch('https://google.com', { cookieJar }));
    console.log(cookieJar);
})();
```
