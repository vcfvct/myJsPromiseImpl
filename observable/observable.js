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
        return new Observable((obs) => {
            args.forEach(val => obs.onNext(val));
            obs.onCompleted();

            return {
                unsubscribe: () => {
                    // just make sure none of the original subscriber's methods are never called.
                    obs = {
                        onNext: () => { },
                        onError: () => { },
                        onCompleted: () => { }
                    };
                }
            };
        });
    }

    static fromEvent(source, event) {
        return new Observable((observer) => {
            const callbackFn = (e) => observer.onNext(e);

            source.addEventListener(event, callbackFn);

            return {
                unsubscribe: () => source.removeEventListener(event, callbackFn)
            };
        });
    }
}

(() => {
    Observable.of(1, 2, 'hi')
        .subscribe(
            console.log
        )
})();