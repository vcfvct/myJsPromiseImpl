    function Promise() {
        this.state = 'pending';
        this.value = null;
        this.thens = [];
        this.then = function(success, error) {
            let deferred = new Deferred();
            if (this.state === 'pending') {
                this.thens.push({
                    deferred: deferred,
                    success: success,
                    error: error
                })
            }

            if (this.state === 'resolved') {
                let returnVal = success(this.value);
                return returnVal instanceof Promise ? returnVal : this;

            } else if (this.state === 'rejected' && error) {
                error(this.value);
                return this;
            }
            return deferred.promise;
        };
    }

    function Deferred() {
        this.promise = new Promise();
        this.resolve = function(data) {
            let then = data && data.then;
            // here when the success returns a new Promise, we attach the current resolve/reject to the new promise's success/error. 
            // so when the new promise(here is the `data`) is resolved, we could execute the resolve/reject of the current deferred. 
            if (typeof then === 'function') {
                then.call(data, val => {
                    this.resolve(val);
                }, val => {
                    this.reject(val);
                });
            } else {
                this.promise.value = data;
                this.promise.state = 'resolved';
                this.promise.thens.forEach(thenWrapper => {
                    thenWrapper.deferred.resolve(thenWrapper.success(data));
                });
            }
        };
        this.reject = function(data) {
            this.promise.value = data;
            this.promise.state = 'rejected';
            this.promise.thens.forEach(thenWrapper => {
                thenWrapper.deferred.error(thenWrapper.success(data));
            });
        }
    }
