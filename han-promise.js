function Promise() {
        this.state = 'pending';
        this.value = null;
        this.thens = [];
        this.then = function(success, error, chainedDefer) {
            var deferred = chainedDefer || new Deferred();
            if (this.state === 'pending') {
                this.thens.push({
                    deferred: deferred,
                    success: success,
                    error: error
                });
            } else if (this.state === 'resolved') {
                var returnVal = success(this.value);
                return returnVal instanceof Promise ? returnVal : deferred.resolve(returnVal);
            } else if (this.state === 'rejected' && error) {
                return error(this.value);
            }
            return deferred.promise;
        };
    }

    function Deferred() {
        this.promise = new Promise();
        this.resolve = function(data) {
            this.promise.value = data;
            this.promise.state = 'resolved';
            if (this.promise.thens.length > 0) {
                this.promise.thens.forEach(function(thenWrapper) {
                    let rs = thenWrapper.success(data);
                    if (rs) {
                        thenWrapper.deferred.promise.thens.forEach((childWrapper) => {
                            if (rs instanceof Promise) {
                                rs.then(childWrapper.success, childWrapper.error, childWrapper.deferred);
                            } else {
                                childWrapper.success(rs);
                            }
                        });
                    }
                });
            }
        };
        this.reject = function(data) {
            this.promise.value = data;
            this.promise.state = 'rejected';
            if (this.promise.thens.length > 0) {
                this.promise.thens.forEach(function(thenWrapper) {
                    let rs = thenWrapper.success(data);
                    if (rs) {
                        thenWrapper.deferred.promise.thens.forEach((childWrapper) => {
                            childWrapper.error(rs);
                        });
                    }
                });
            }
        }
    }
    }, 1000);
    p.then(logMsg1, logMsg1);
