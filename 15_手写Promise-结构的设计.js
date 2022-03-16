// ES6 ES2015
// https://promisesaplus.com/
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_REJECTED = "rejected";

class pePromise {
  constructor(executor) {
    this.status = PROMISE_STATUS_PENDING;
    this.value = undefined;
    this.reason = undefined;

    const resolve = (value) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_FULFILLED;
        this.value = value;
        console.log("resolve被调用了");
      }
    };

    const reject = (reason) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        this.status = PROMISE_STATUS_REJECTED;
        this.reason = reason;
        console.log("reject被调用了");
      }
    };
    executor(resolve, reject);
  }
}

const promise = new pePromise((resolve, reject) => {
  resolve();
  reject();
});
