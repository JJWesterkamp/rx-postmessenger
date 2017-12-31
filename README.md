_This package is currently under heavy development. Expect breaking changes to the public API within minor releases until **v1.0.0** is released._

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
### 2 Windows connecting to one another

```typescript
static connect(otherWindow: Window, origin: string): RxPostmessenger;
```
Both ends of the connection should implement this package for the best intercommunication. One in a _parent_ project (that implements the iframe), and one in a _child_ project (that's being served by the iframe). Creating a new messenger is straightforward:

```javascript
// ~~ @ http://parent-project.com
const childWindowMessenger = RxPostmessenger.connect(
  someIframe.contentWindow,
  'http://child-project.com'
);

// ~~ @ http://child-project.com
const parentWindowMessenger = RxPostmessenger.connect(
  window.parent,
  'http://parent-project.com'
);
```


### Notify the other window
```typescript
notify(channel: string, payload: any): void;
```

The messenger instances give you a way to send notifications to the other `Window` through the `notify()` method. Consider an example where we want to notify a child window of price changes:

```javascript
childWindowMessenger.notify('price-changed', { previous: 12, current: 14 }); // Price increased
```

The notify method is `void`: notifications are _send_ and forget. Use [`request()`](#request) instead if you require data back.

### Listening for notifications
```typescript
notifications(channel: string): Observable<any>;
```

The child project can request an Observable stream for a certain notification channel. In this case we're interested in `'price-changed'` events, but only the ones where the price increased. The ability to use RxJS operators can help us out:

```javascript
const handlePriceIncrease = (increase) => console.log(`Price increased with €${increase}!`);

parentWindowMessenger.notifications('price-changed')
  .filter(({ previous, current }) => current > previous)
  .map(({ previous, current }) => current - previous)
  .subscribe((increase) => handlePriceIncrease(increase)); // > 'Price increased with €2!'
```

### Perform a request

```typescript
request(channel: string, payload?: any): Observable<any>;
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

### Subscribing to incoming requests of a single type
```typescript
requests(channel: string): Observable<RxPostmessenger.Request>;
```

Of course no nice greeting would ever be received when the child project does not listen for requests to handle and respond to. Let's not be rude and create a request stream for `'greeting'` requests, and subscribing to it. We'll pass the `RxPostmessenger.Request` objects that the subscription receives into a function `handleGreetingRequest()`:

```javascript
parentWindowMessenger
  .requests('greeting')
  .subscribe((request) => handleGreetingRequest(request));
```

### Sending request responses

```typescript
RxPostmessenger.Request.respond(payload: any): void;
```




```javascript
function handleGreetingRequest(request) {
  const { payload: requestPayload } = request;
  const responsePayload = translateGreeting('Hi parent!', requestPayload.language);
  request.respond(responsePayload);
}
```



## Usage with typescript

When RxPostmessenger is consumed in a typescript environment, some additional features become available.

### Event mapping

It can become quite tedious to keep information about event names and the format of event payloads in sync between projects. Consider the example below:

```typescript
// [Bad] This is fine by TS, since the channel argument may be of any type:
const myStream = messenger.notifications('some-non-existing-channel');

// [Bad] Implementations should accept any type as arguments when these arguments
// are message payloads:
myStream.subscribe((someImplicitAnyType) => doSomethingWith(someImplicitAnyType));
```

Event mapping allows for type checking event channel names and provides mapping functionality of the event names to their corresponding payload types. When event mapping is configured properly, the typescript compiler will throw errors if a non-existing event channel name is being used where an existing one is required.

#### Example usage

```typescript
import { EventMap, RequestContract, NotificationContract } from 'rx-postmessenger';

interface MyEventMap extends EventMap {

  in: {
    notifications: {
      'price-changed': NotificationContract<{ previous: number, current: number }>;
    };
    requests: {
      'greeting': RequestContract<{ language: string }, string>
    };
  };

  out: {
    notifications: {
      // ...
    };
    requests: {
      // ...
    };
  };
}
```
The event map is now our source of truth as to which events are supported, and what payloads we can expect inside our event handlers. 3 interfaces are imported from the package to ease construction of the event map. The event map has 2 properties `in` and `out`, representing incoming messages and outgoing messages, respectively. Assinging a map to an `RxPostmessenger` instance is done by giving the map as a type parameter to the static `create` call:

```typescript
const messenger = RxPostmessenger.connect<MyEventMap>(iframe.contentWindow, 'http://some-site.com');
```

_Note: Usage of an `EventMap` interface is an all or nothing consideration. All requests and notifications you intend to use must be defined, for both the `in` and `out` event directions._


#### Notification contracts

Notification contracts define the payload that is expected to come with a certain notification message. With a `'price-changed'` event we expect the payload to be an object with 2 properties `previous` and `current`, both of type number, representing the prices before and after the change:

```typescript
type PriceChangeContract = NotificationContract<{ previous: number; current: number }>;
```

When assigned to a key `'price-changed'` within the `MyEventMap.in.notifications` interface object, handling notifications is fully type-completed:

```typescript
// For incoming notifications, channel names are validated against the
// MyEventMap.in.notifications keys. 'price-changed' exists, so it's okay.
const priceChanges$ = messenger.notifications('price-changed');

const nonExistingEvents$ = messenger.notifications('non-existing');
// > [ts] Type '"non-existing"' is not assignable to type '"price-changed" | "other-defined-channel"'

// TS knows that property current exists, and that it's of type number.
priceChanges$.subscribe(({ current }) => displayPrice(current));
```

#### Request contracts

Request contracts define the types of the request-payload, and the type of the response-payload expected in return. Consider the greeting request again. As request payload we expect an options object with property `language` of type `string`. A response of type `string` is expected: the greeting text itself. The types can be given as type parameters for a `RequestContract` type declaration:

```typescript
type GreetingContract = RequestContract<{ language: string }, string>;
```

When assigned to a key `'greeting'` within the `MyEventMap.in.requests` interface object, the entire request-response flow is fully type-completed:

```typescript
messenger.requests('greeting').subscribe((request) => {

  // Typescript now knows request.payload to have a property
  // language of type string, as is defined by the first type parameter
  // of the request contract.
  const { language = 'en' } = request.payload; // OK
  const { iDontExist } = request.payload; // [ts] Type '{ language: string; }' has no property 'iDontExist'

  const response: string = translateGreeting('Hi there!', language);

  // request.respond() only accepts a string, as is defined by the second
  // type parameter of the request contract:
  request.respond(response); // OK
  request.respond(1); // [ts] Type '1' is not assignable to type 'string'
});
```

![Type completion of mapped RxPostmessenger instances](https://i.imgur.com/q15ig5W.gif)
