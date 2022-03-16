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
        // this.status = PROMISE_STATUS_FULFILLED;这里是为了微任务只加一个进行的处理
        //为了避免resolve和reject操作同时加两个微任务，为了达到状态改变不可逆进行的操作
        //不过也可以让他们加两个微任务，在里面进行逻辑判断也行，正如下面的代码
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return; //这个操作也可以完成状态改变不可逆
          this.status = PROMISE_STATUS_FULFILLED;
          this.value = value;
          this.onfulfilled(this.value);
        });
      }
    };

    const reject = (reason) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_REJECTED;
          this.reason = reason;
          this.onrejected(this.reason);
        });
      }
    };
    executor(resolve, reject);
  }

  then(onfulfilled, onrejected) {
    this.onfulfilled = onfulfilled;
    this.onrejected = onrejected;
  }
}

const promise = new pePromise((resolve, reject) => {
  // console.log("状态pending");
  resolve(111);
  reject(222);
});

promise.then(
  (res) => {
    console.log("res:", res);
  },
  (err) => {
    console.log("err:", err);
  }
);

promise.then(
  (res) => {
    console.log("res1:", res);
  },
  (err) => {
    console.log("err1:", err);
  }
);
