export class Observable {
    /** Internal implementation detail */
    private _subscribe: any;

    /**
      * @constructor
      * @param {Function} subscribe is the function that is called when the
      * observable is subscribed to. This function is given a subscriber/observer
      * which provides the three methods on the Observer interface:
      * onNext, onError, and onCompleted
    */
    constructor(subscribe?: any) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }

    // public api for registering an observer
    subscribe(onNext: any, onError?: any, onCompleted?: any) {
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
    static of(...args): Observable {
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

    static fromEvent(source, event): Observable {
        return new Observable((observer) => {
            const callbackFn = (e) => observer.onNext(e);

            source.addEventListener(event, callbackFn);

            return {
                unsubscribe: () => source.removeEventListener(event, callbackFn)
            };
        });
    }

    map(fn: Function): Observable {
        return new Observable((observer) => {
            return this.subscribe(
                v => observer.onNext(fn(v))
            );
        });
    }

    filter(predicateFn): Observable {
        return new Observable((observer) => {
            return this.subscribe(
                (val) => {
                    // only emit the value if it passes the filter function
                    predicateFn(val) && observer.onNext(val);
                },
                (e) => observer.onError(e),
                () => observer.onCompleted()
            );
        });
    }

    take(count: number): Observable {
        return new Observable((observer) => {
            let currentCount = 0;
            return this.subscribe(
                (val) => {
                    if (currentCount < count) {
                        observer.onNext(val);
                        currentCount++
                    } else if (currentCount === count) {
                        observer.onCompleted();
                        currentCount++
                    }
                },
                (e) => observer.onError(e),
                () => observer.onCompleted()
            );
        });
    }
}

(() => {
    Observable.of(1, 2, 'hi')
        .subscribe(
            console.log
        )
})();