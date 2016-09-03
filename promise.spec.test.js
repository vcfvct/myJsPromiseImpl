
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
                logMsg1('in 5th then: ' + data);
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
