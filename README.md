_Under development_

# rx-postmessenger

[![npm version](https://badge.fury.io/js/rx-postmessenger.svg)](https://badge.fury.io/js/rx-postmessenger)
**Module builds** (of otherwise ES5 code): ESM, CommonJS, UMD (bundled)

Minimal RxJS wrapper around the window.postMessage API for both passive (request-response) and active (notification) streams across frame windows.

## In short

An RxPostmessenger class instance establishes one end of a "connection" between 2 window objects, using the `window.postMessage` API. Each instance targets _one single_ `Window` object. It also only accepts incoming messages from that specific window object while it's serving documents from _one single_ origin.

## Installation

```bash
$ npm install rx-postmessenger --save
```

## Usage

RxPostmessenger exposes both a `default export` and a named export:

```javascript
// To personal preference, either import default...
import RxPostmessenger from 'rx-postmessenger';

// ...or import named
import { RxPostmessenger } from 'rx-postmessenger';
```

### connect
```typescript
static connect(otherWindow: Window, origin: string): RxPostmessenger;
```
Both ends of the connection should implement this package for the best intercommunication. One in a _parent_ project (that implements the iframe), and one in a _child_ project (that's being served by the iframe). Creating a new messenger is straightforward:

```javascript
// ~~ @ http://parent-project.com
const childWindowMessenger = RxPostmessenger.connect(someIframe.contentWindow, 'http://child-project.com');

// ~~ @ http://child-project.com
const parentWindowMessenger = RxPostmessenger.connect(window.parent, 'http://parent-project.com');
```


### notify
```typescript
notify(channel: string, payload: any): void;
```

The messenger instances give you a way to send notifications to the other `Window` through the `notify()` method. Consider an example where we want to notify a child window of price changes:

```javascript
childWindowMessenger.notify('price-changed', { previous: 12, current: 14 }); // Price increased
```

### notificationStream
```typescript
notificationStream<T extends Notification>(channel: string): Observable<T>;
```

The child project can request an Observable stream for a certain notification channel. In this case we're interested in `'price-changed'` events, but only the ones where the price increased. The ability to use RxJS operators can help us out:

```javascript
const handlePriceIncrease = (increase) => console.log(`Price increased with $${increase}!`);

parentWindowMessenger.notificationStream('price-changed')
  .filter(({ previous, current}) => current > previous)
  .map(({ previous, current}) => current - previous)
  .subscribe((increase) => handlePriceIncrease(increase)); // > 'Price increased with $2!'
```
###
### request

```typescript
request<T extends Response>(channel: string, payload?: any): Observable<T>;
```





```javascript


// Request:
childWindowMessenger.request('greeting', { language: 'en' }) // => Observable<Response>

  // Handle Response
  .subscribe((niceGreeting) => console.log(niceGreeting)); // > 'Hi parent!'


// Listen to requests...
parentWindowMessenger.requestStream('greeting').subscribe((request) => {
  
  const { id: requestId, payload } = request;
  
  // Give payload.language to some translator:
  const responsePayload = translateGreeting('Hi parent!', payload.language);
  
  parentWindowMessenger.respond(requestId, responsePayload);
});
```



### respond

```typescript
respond(requestId: string, channel: string, payload: any): void;
```







