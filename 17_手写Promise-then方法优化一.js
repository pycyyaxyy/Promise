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
    //优化2.用数组保存可能存在的多次的promise的调用
    this.onfulfilledFns = [];
    this.onrejectedFns = [];

    const resolve = (value) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        //添加微任务
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_FULFILLED;
          this.value = value;
          this.onfulfilledFns.forEach((fn) => {
            fn(this.value);
          });
        });
      }
    };

    const reject = (reason) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_REJECTED;
          this.reason = reason;
          this.onrejectedFns.forEach((fn) => {
            fn(this.reason);
          });
        });
      }
    };
    executor(resolve, reject);
  }

  then(onfulfilled, onrejected) {
    //优化1.碰到延迟一会再调用then方法后的解决方案（状态已经改变之后再调用then）
    if (this.status === PROMISE_STATUS_FULFILLED && onfulfilled) {
      onfulfilled(this.value);
    }
    if (this.status === PROMISE_STATUS_REJECTED && onrejected) {
      onrejected(this.reason);
    }

    if (this.status === PROMISE_STATUS_PENDING) {
      this.onfulfilledFns.push(onfulfilled);
      this.onrejectedFns.push(onrejected);
    }
  }
}

const promise = new pePromise((resolve, reject) => {
  // console.log("状态pending");
  reject(222);
  resolve(111);
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

//这里不会回调，这是为什么呢，因为这个时候状态已经改变了不再是pending
setTimeout(() => {
  promise.then(
    (res) => {
      console.log("res3:", res);
    },
    (err) => {
      console.log("err3:", err);
    }
  );
}, 1000);

//解决方法 修改then方法
