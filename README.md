# myJsPromiseImpl
my own js promise implementation just for fun

NOTE: the `han-promise.js` is not 100% Promise/A specification since i passed the child deferred object to the Promise using the then()'s 3rd param which is not part of the spec.

The `promise-impl2-cleaner.js` is more close to **Promise/A+** spec.

Also wrote a blog explaining the way I implement this step by step.  https://vcfvct.wordpress.com/2016/05/25/write-my-own-small-promise/

## Observable
A simple observable implementation to get better understanding.