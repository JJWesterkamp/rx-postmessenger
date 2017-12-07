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

RxPostmessenger exposes both a default export and a named export:

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

The notify method is `void`: notifications are _send_ and forget. Use [`request()`](#request) instead if you require data back.

### notificationStream
```typescript
notificationStream<T extends Notification>(channel: string): Observable<T>;
```

The child project can request an Observable stream for a certain notification channel. In this case we're interested in `'price-changed'` events, but only the ones where the price increased. The ability to use RxJS operators can help us out:

```javascript
const handlePriceIncrease = (increase) => console.log(`Price increased with €${increase}!`);

parentWindowMessenger.notificationStream('price-changed')
  .filter(({ previous, current}) => current > previous)
  .map(({ previous, current}) => current - previous)
  .subscribe((increase) => handlePriceIncrease(increase)); // > 'Price increased with €2!'
```

------------------------------------------------------------------

### request
```typescript
request<T extends Response>(channel: string, payload?: any): Observable<T>;
```

RxPostmessenger also supports request - response communication. At the requester side a request is initiated by calling the `request()` method with 1 or 2 arguments. The first is a request alias (actually just another channel) of our choice.

_A notification-channel and a request-channel can both have the same channel name without any problem._

An observable is returned that emits the response when arrived, and then completes. Let's request a greeting from our child window, and tell it we only understand `'en'`:

```javascript
const greetingResponse$ = childWindowMessenger.request('greeting', { language: 'en' }) // => Observable<T extends Response>
```

We can then subscribe to the greeting response stream. Provided that the greeting says something nice, we'll log it for everyone to see:

```javascript
greetingResponse$
  .filter((greeting) => isNiceGreeting(greeting))
  .subscribe((niceGreeting) => console.log(niceGreeting)); // > 'Hi parent!'
```

### requestStream
```typescript
requestStream<T extends Request>(channel: string): Observable<T>;
```

Of course no nice greeting would ever be received when the child project does not listen for requests to handle and respond to. Let's not be rude and create a request stream for `'greeting'` requests:

```javascript
const greetingRequests$ = parentWindowMessenger.requestStream('greeting'); // => Observable<T extends Request>
```

Parent window will let us know in what language the greeting is expected, so we'll translate a greeting to given language before sending it as a response:

```javascript
parentWindowMessenger.requestStream('greeting').subscribe((request) => handleGreetingRequest(request));
```

### respond

```typescript
respond(requestId: string, channel: string, payload: any): void;
```

A request can be responded to by any function that accepts the request object, and is able to obtain a reference to `parentWindowMessenger`. In our case `handleGreetingRequest` gets called from the request stream subscription handler:

```javascript
function handleGreetingRequest(request) {
  const { id: requestId, payload: requestPayload } = request;
  
  const responsePayload = translateGreeting('Hi parent!', requestPayload.language);
  
  parentWindowMessenger.respond(requestId, responsePayload);
}
```

The request id must for now be added to the response as first argument, so that the requester side knows what request a response corresponds to. Hence, the `{ id }` extraction out of the request object.

I'm still working on a better API for this where the reference through closure to `parentWindowMessenger` is not a necessity. In the future the response interface will be proxied by a request wrapper object.




