function Promise() {
        this.state = 'pending';
        this.value = null;
        this.thens = [];
        this.then = function(success, error) {
            var deferred = chainedDefer;
            if (this.state === 'pending') {
                this.thens.push({
                    deferred: deferred,
                    success: success,
                    error: error
                })
            }

            if (this.state === 'resolved') {
                var returnVal = success(this.value);
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
            var then = data && data.then;
            if (typeof then === 'function') {
                then.call(data, function(val) {
                    this.resolve(val);
                }.bind(this));
            } else {
                this.promise.value = data;
                this.promise.state = 'resolved';
                this.promise.thens.forEach(function(thenWrapper) {
                    thenWrapper.deferred.resolve(thenWrapper.success(data));
                }.bind(this));
            }
        };
        this.reject = function(data) {
            this.promise.value = data;
            this.promise.state = 'rejected';
            this.promise.thens.forEach(function(thenWrapper) {
                thenWrapper.deferred.error(thenWrapper.success(data));
            }.bind(this));
        }
    }




    //----------------------   TEST code -------------------------------

    function createPromise(msg, delay) {
        var deferred = new Deferred();
        setTimeout(function() {
            deferred.resolve(msg);
        }, delay ? delay : 0);
        return deferred.promise;
    };

    var p = createPromise('1st promise', 500);

    function logMsg1(input) {
        console.log(input);
    }

    setTimeout(function() {
        p.then(function(data) {
                logMsg1('in 1st then: ' + data);
                return createPromise('2nd chained promise')
            }, logMsg1)
            .then(function(data) {
                logMsg1('in 2nd then: ' + data);
                return createPromise('3rd chain with immediate return');
            }, logMsg1)
            .then(function(data) {
                logMsg1('in 3rd then: ' + data);
                return createPromise('4th chain with immediate return');
            }, logMsg1)
            .then(function(data) {
                logMsg1('in 4th then: ' + data);
                return createPromise('5th chain after immediate return');
            }, logMsg1)
            .then(logMsg1, logMsg1);
    }, 2000);

    p.then(function(data) {
            logMsg1('no dealy - in 1st then no dealy: ' + data);
            return createPromise('no dealy - 2nd chained promise')
        }, logMsg1)
        .then(function(data) {
            logMsg1('no dealy - in 2nd then : ' + data);
            return 'no dealy - 3rd chain with immediate return';
        }, logMsg1)
        .then(logMsg1, logMsg1);

    setTimeout(function() {
        p.then(logMsg1, logMsg1);
    }, 1000);
    p.then(logMsg1, logMsg1);
