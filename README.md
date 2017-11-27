_Under development_ 

# rx-postmessenger

[![npm version](https://badge.fury.io/js/rx-postmessenger.svg)](https://badge.fury.io/js/rx-postmessenger)
**Module builds** (of otherwise ES5 code): ESM, CommonJS, UMD (bundled)

Minimal RxJS wrapper around the window.postMessage API for both passive (request-response) and active (notification) streams across frame windows.








## In short

An RxPostmessenger class instance establishes one end of a "connection" between 2 window objects, using the `window.postMessage` API. Each instance targets _one single_ `Window` object that's serving documents from _one single_ origin.

Both ends of the connection must implement this package, or otherwise know how to 'listen' for events sent from the other end of the line. One in a _parent_ project (that implements the iframe), and one in a _child_ project (that's being served by the iframe).









## Quickstart

**bash**
```bash
$ npm install rx-postmessenger --save
```

**JS**
```javascript
import RxPostmessenger from 'rx-postmessenger';

// Create:

// ~~ @ http://parent-project.com
const childWindowMessenger = RxPostmessenger.connectWithChild(
  someIframe.contentWindow,
  'http://child-project.com'
);

// ~~ @ http://child-project.com
const parentWindowMessenger = RxPostmessenger.connectWithChild(
  window.parent,
  'http://parent-project.com'
);

// Notify:
childWindowMessenger.notify('price-changed', { previous: 12, current: 10 }); // Price dropped

// Listen:
parentWindowMessenger.notificationStream('price-changed', ({ previous, current }) => {
  processPriceChange(previous, current));
}

// Request:
childWindowMessenger.request('greeting', { language: 'en' }) // => Observable<Response>

  // Handle Response
  .subscribe((niceGreeting) => console.log(niceGreeting)); // > Hi parent!


// Listen to requests...
parentWindowMessenger.requestStream('greeting').subscribe(({ id, { language } }) => {

  // ...and Respond
  const payload = this.translateGreeting('Hi parent!', language);
  parentWindowMessenger.respond(id, payload);
});
```




## Documentation

The `RxPostmessenger` class operates in 1 of 2 strategies because a child window has no access to `window.parent.origin`. Therefore `document.referrer` is used for determining a parent window's host. 

**parent implementation** `@ http://parent-project.com`

```javascript
import RxPostmessenger from 'rx-postmessenger';

// Parent implements the iframe...
const otherWindowUrl = 'http://child-project.com';
const iframe = new HTMLIFrameElement;
iframe.src = otherWindowUrl;
document.body.appendChild(iframe);

// ...and then chats with it
const postMessenger = RxPostmessenger.connectWithChild(iframe.contentWindow, otherWindowUrl);
```

**child implementation** `@ http://child-project.com`

```javascript
import RxPostmessenger from 'rx-postmessenger';

// well, parent is already waiting, so just chat. Note the different method
const postMessenger = RxPostmessenger.connectWithParent(window.parent, document.referrer);
```

_Note: one restriction remains, and that is that both implementations must autonomously have knowledge of the available event channel names, and the format of their payload data. I.e. both projects must have a functional equivalent to `['price-changed', 'some-other-event']`_

## API

### connectWithParent
```typescript
static connectWithParent(otherWindow: Window, origin: string): RxPostmessenger;`
```







```typescript
static connectWithChild(otherWindow: Window, origin: string): RxPostmessenger;
```


```typescript
static connectWithParent(otherWindow: Window, origin: string): RxPostmessenger;
```

```typescript
request<T extends Response>(channel: string, payload?: any): Observable<T>;
```

```typescript
respond(requestId: string, channel: string, payload: any): void;
```

```typescript
notify(channel: string, payload: any): void;
```

```typescript
notificationStream<T extends Notification>(channel: string): Observable<T>;
```







