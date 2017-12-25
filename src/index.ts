import { RxPostmessenger } from "./rx-postmessenger";
export { RxPostmessenger };
export default RxPostmessenger;
import { ScalarRequest } from './private';

// Public interface
import {
    EventMap as EventMapInterface,
    RequestContract,
    NotificationContract,
    Messenger,
    EventMap,
} from '../rx-postmessenger';


export interface RequestWrapper<T extends ScalarRequest> {
    readonly data: T;
    validate(validator: (payload: T['payload']) => payload is T): boolean;
}


// Test drive!

export interface SomeEventMap extends EventMap {

    IN: {

        requests: {
            'configuration-hash': RequestContract<{ someData: string }, string>;
        };

        notifications: {
            'price-changed': NotificationContract<{ previous: number, current: number }>;
        };
    };

    // OUT: {
    //     requests: {

    //     };

    //     notifications: {
    //         'done': NotificationContract<string>
    //     };
    // };
}

// ReceivableRequest<'price-changed', null, { previous: number, current: number }>,
// ReceivableRequest<'configuration-hash', null, string>

const messenger: RxPostmessenger<SomeEventMap> = RxPostmessenger.connect(window, '*');
const myStream = messenger.notifications('price-changed').subscribe((report) => report.previous);
const myStream2 = messenger.requests('configuration-hash').subscribe((test) => test.payload);
messenger.notify('done', 1);