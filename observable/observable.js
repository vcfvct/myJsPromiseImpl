#!/usr/bin/env node

class Observable {
    /**
      * @constructor
      * @param {Function} subscribe is the function that is called when the
      * observable is subscribed to. This function is given a subscriber/observer
      * which provides the three methods on the Observer interface:
      * onNext, onError, and onCompleted
    */
    constructor(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }

    // public api for registering an observer
    subscribe(onNext, onError, onCompleted) {
        if (typeof onNext === 'function') {
            return this._subscribe({
                onNext: onNext,
                onError: onError || (() => { }),
                onCompleted: onCompleted || (() => { })
            });
        } else {
            return this._subscribe(onNext);
        }
    }

    // add as a static method on Observable so it can be used as
    // Observable.of()
    static of(...args) {
        return new Observable((observerOf) => {
            args.forEach(val => observerOf.onNext(val));
            observerOf.onCompleted();

            return {
                unsubscribe: () => {
                    // just make sure none of the original subscriber's methods are never called.
                    observerOf = {
                        onNext: () => { },
                        onError: () => { },
                        onCompleted: () => { }
                    };
                }
            };
        });
    }

    static fromEvent(source, event) {
        return new Observable((observerFromEvent) => {
            const callbackFn = (e) => observerFromEvent.onNext(e);
            source.addEventListener(event, callbackFn);
            return {
                unsubscribe: () => source.removeEventListener(event, callbackFn)
            };
        });
    }

    map(fn) {
        return new Observable((observerMap) => {
            return this.subscribe(
                v => observerMap.onNext(fn(v))
            );
        });
    }

    filter(fn) {
        return new Observable((observerFilter) => {
            return this.subscribe(
                v => fn(v) && observerFilter.onNext(v)
            )
        })
    }

    take(n) {
        return new Observable((observerTake) => {
            let count = 0
            return this.subscribe(
                (v) => {
                    n > count++ ? observerTake.onNext(v) : observerTake.onCompleted();
                }
            )
        });
    }
}

(() => {
    Observable.of(1, 2, 3, 4, 5, 6)
        .take(4)
        .map(x => x * 5)
        .filter(x => x % 2 === 0)
        .subscribe(
            console.log
        )
})();