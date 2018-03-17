# Usage with typescript

When RxPostmessenger is consumed in a typescript environment, some additional features become available.

## Event mapping

It can become quite tedious to keep information about event names and the format of event payloads in sync between projects. Consider the example below:

```typescript
// [Bad] This is fine by TS, since the channel argument may be of any type:
const myStream = messenger.notifications('some-non-existing-channel');

// [Bad] Implementations should accept any type as arguments when these arguments
// are message payloads:
myStream.subscribe((someImplicitAnyType) => doSomethingWith(someImplicitAnyType));
```


Event mapping allows for type checking event channel names and provides mapping functionality of the event names to their corresponding payload types. When event mapping is configured properly, the typescript compiler will throw errors if a non-existing event channel name is being used where an existing one is required.

### Example usage

```typescript
import RxPostmessenger from "rx-postmessenger";

// You may import TS interfaces from RxPostmessenger namespace:
import IEventMap = RxPostmessenger.EventMap;
import RequestContract = RxPostmessenger.RequestContract;
import NotificationContract = RxPostmessenger.NotificationContract;

// Create your event map:
interface MyEventMap extends IEventMap {

  in: {
    notifications: {
      'price-changed': NotificationContract<{ oldPrice: number, newPrice: number }>;
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
const messenger = RxPostmessenger.connect<MyEventMap>(
    iframe.contentWindow,
    'http://some-site.com'
);
```

_Note: Usage of an `EventMap` interface is an all or nothing consideration. All requests and notifications you intend to use must be defined, for both the `in` and `out` event directions._


### Notification contracts

Notification contracts define the payload that is expected to come with a certain notification message. With a `'price-changed'` event we expect the payload to be an object with 2 properties `oldPrice` and `newPrice`, both of type number, representing the prices before and after the change:

```typescript
type PriceChangeContract = NotificationContract<{ oldPrice: number; newPrice: number }>;
```

When assigned to a key `'price-changed'` within the `MyEventMap.in.notifications` interface object, handling notifications is fully type-completed:

```typescript
// For incoming notifications, channel names are validated against the
// MyEventMap.in.notifications keys. 'price-changed' exists, so it's okay.
const priceChanges$ = messenger.notifications('price-changed');

const nonExistingEvents$ = messenger.notifications('non-existing');
// > [ts] Type '"non-existing"' is not assignable to type '"price-changed" | "other-defined-channel"'

// TS knows that property newPrice exists, and that it's of type number.
priceChanges$.subscribe(({ newPrice }) => displayPrice(newPrice));
```

### Request contracts

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

### Live example
_with some slightly different contracts than the examples above._



![Type completion of mapped RxPostmessenger instances](https://i.imgur.com/q15ig5W.gif)