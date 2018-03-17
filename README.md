# rx-postmessenger [![npm version](https://badge.fury.io/js/rx-postmessenger.svg)](https://badge.fury.io/js/rx-postmessenger)

Minimal RxJS wrapper around the window.postMessage API for both passive (request-response) and active (notification) streams across frame windows.

## In short

An RxPostmessenger class instance establishes one end of a "connection" between 2 window objects, using the `window.postMessage` API. Each instance targets _one single_ `Window` object. It also only accepts incoming messages from that specific window object while it's serving documents from _one single_ origin.

**Typescript users**

_If you're consuming the package in Typescript, see the [Typescript usage guide](https://github.com/JJWesterkamp/rx-postmessenger/tree/master/docs/usage-with-typescript.md) for additional features._

## Installation

```bash
$ npm install rx-postmessenger --save
```

## Contents / API

**Static methods**

|Method|Description|
|:-|:-|
|[`connect()`](#connecting-2-window-objects)|Connect `Window` objects by creating messenger instances.|
|[`useObservable()`](#using-a-different-rxobservable-implementation)|Use a different `Rx.Observable` implementation (Primarily useful for UMD bundle consumers.)|

**`Messenger` Instance methods**

|Method|Description|
|:-|:-|
|[`notify()`](#sending-notifications)|Send notifications to the connected window.|
|[`notifications()`](#listening-for-inbound-notifications:)|Listen for inbound notifications.|
|[`request()`](#sending-requests)|Send requests to the connected window.|
|[`requests()`](#listening-for-inbound-requests)|Listen for inbound requests.|

**`Request` Instance methods**

|Method|Description|
|:-|:-|
|[`respond()`](#sending-request-responses)|Respond to the request with a certain payload.

---

## Usage

```javascript
import RxPostmessenger from 'rx-postmessenger';
```

### Static methods

#### Connecting 2 Window objects

> ```typescript
> RxPostmessenger.connect(otherWindow: Window, origin: string): RxPostmessenger.Messenger
> ```

Both ends of the connection should implement this package. One in a _parent_ project (that implements the iframe), and one in a _child_ project (that's being served by the iframe). Creating a new messenger is straightforward:

```javascript
// At parent window. Origin: http://parent-project.com
const childMessenger = RxPostmessenger.connect(
  someIframe.contentWindow,
  'http://child-project.com'
);

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

// At child window. Origin: http://child-project.com
const parentMessenger = RxPostmessenger.connect(
  window.parent,
  'http://parent-project.com'
);
```

#### Using a different `Rx.Observable` implementation

> ```typescript
> RxPostmessenger.useObservable(impl: typeof Rx.Observable): void
> ```

This package comes with a UMD bundle that packs a minimal RxJS build to create observable objects from. For UMD bundle consumers the static interface provides a method `useObservable` that accepts one argument of `typeof Rx.Observable`:

```javascript
RxPostmessenger.useObservable(MyObservable);
const messenger = RxPostmessenger.connect( /* ... */ );
```
Any messenger created afterwards will have observable object properties constructed from the given observable implementation. This allows you to use your own RxJS build, with your required subset of operators etc. The [RxJS imports file of this package][rxjs-imports] shows what subset of operators is included by default.

Notes:

- `useObservable` does not perform any type validation on the given argument at this point. Failing to provide an actual RxJS Observable implementation when calling `useObservable`will break any `Messenger` instance that is created afterwards.
- Make sure to call `useObservable` before instantiating `Messenger` instances.

---

### `Messenger` Instance methods

#### Sending notifications
> ```typescript
> Messenger.notify(channel: string, payload: any): void;`
> ```

The messenger instances give you a way to send notifications to the other `Window` through the `notify()` method. Consider an example where we want to notify a child window of price changes:

```javascript
childMessenger.notify('price-changed', {
    oldPrice: 12.50,
    newPrice: 14.50,
});
```

The notify method is `void`: notifications are _send_ and forget. Use [`request()`](#sending-requests) instead if you require data back.

#### Listening for inbound notifications
> ```typescript
> Messenger.notifications(channel: string): Observable<any>;
> ```

The child project can request an Observable stream for a certain notification channel. In this case we're interested in `'price-changed'` events, but only the ones where the price increased. The ability to use RxJS operators can help us out:

```javascript
const handlePriceIncrease = (increase) => console.log(`Price increased with €${increase}!`);

parentMessenger.notifications('price-changed')
  .filter(({ oldPrice, newPrice }) => newPrice > oldPrice)
  .map(({ oldPrice, newPrice }) => newPrice - oldPrice)
  .subscribe((increase) => handlePriceIncrease(increase)); // > 'Price increased with €2!'
```

#### Sending requests

> ```typescript
> Messenger.request(channel: string, payload?: any): Observable<any>;
> ```

RxPostmessenger also supports request - response communication. At the requester side a request is initiated by calling the `request()` method with 1 or 2 arguments. The first is a request alias (actually just another channel) of our choice.

_A notification-channel and a request-channel can both have the same channel name without any problem._

An observable is returned that emits the response when arrived, and then completes. Let's request a greeting from our child window, and tell it we only understand `'en'`:

```javascript
const greetingResponse$ = childMessenger.request('greeting', {
    language: 'en',
});
```

We can then subscribe to the greeting response stream. Provided that the greeting says something nice, we'll log it for everyone to see:

```javascript
greetingResponse$
  .filter((greeting) => isNiceGreeting(greeting))
  .subscribe((niceGreeting) => console.log(niceGreeting)); // > 'Hi parent!'
```

#### Listening for inbound requests
> ```typescript
> Messenger.requests(channel: string): Observable<RxPostmessenger.Request>;
> ```

No greeting would ever be received by `parentMessenger` when the child project does not listen for requests to handle and respond to. Let's not be rude and create a request stream for `'greeting'` requests, and subscribing to it. We'll pass the `RxPostmessenger.Request` objects that the subscription receives into a function `handleGreetingRequest()`:

```javascript
parentMessenger
  .requests('greeting')
  .subscribe((request) => handleGreetingRequest(request));
```

---

### `Request` instance methods

#### Sending request responses

> ```typescript
> RxPostmessenger.Request.respond(payload: any): void;
> ```

The `requests` method returns an observable of `RxPostmessenger.Request` objects. They provide a single method `respond` that accepts one argument: the response payload. Let's use the method on the requests we give to `handleGreetingRequest`:

```javascript
const handleGreetingRequest = request => {
  const requestPayload = request.payload;

  // A hypothetical greeting translator:
  const localizedGreeting = translateGreeting(
      'Hi parent!',
      requestPayload.language
  );

  request.respond(localizedGreeting);
};
```

[rxjs-imports]: https://github.com/JJWesterkamp/rx-postmessenger/tree/master/src/vendor/rxjs
