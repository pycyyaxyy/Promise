const PROMISE_STATUS_PENDING = "PROMISE_STATUS_PENDING";
const PROMISE_STATUS_FULFILLED = "PROMISE_STATUS_FULFILLED";
const PROMISE_STATUS_REJECTED = "PROMISE_STATUS_REJECTED";

//工具函数
function execFuncWithCatchErr(execFn, val, resolve, reject) {
  try {
    const result = execFn(val);
    resolve(result);
  } catch (err) {
    reject(err);
  }
}

class pePromise {
  constructor(excecutor) {
    this.status = PROMISE_STATUS_PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledFns = [];
    this.onRejectedFns = [];

    const resolve = (value) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          //这里加上这个判断为进行隔离，保证状态确定后不再改变，不加的话那么两个微任务都全部执行了
          if (this.status !== PROMISE_STATUS_PENDING) return;
          this.status = PROMISE_STATUS_FULFILLED;
          this.value = value;
          this.onFulfilledFns.forEach((fn) => {
            fn();
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
          this.onRejectedFns.forEach((fn) => {
            fn(this.reason);
          });
        });
      }
    };

    try {
      excecutor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    //为了能够实现catch方法，如果onRejected没有传值，那么给他再这里传递一个抛出异常的函数
    onRejected =
      onRejected ||
      ((err) => {
        throw err;
      });

    //为了实现resovle之后的finally方法，如果onFulfilled没有传值，这里要给他返回出去,使得链连续
    onFulfilled =
      onFulfilled ||
      ((value) => {
        return value;
      });

    return new pePromise((resolve, reject) => {
      //如果状态已经确定了就直接执行
      if (this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
        execFuncWithCatchErr(onFulfilled, this.value, resolve, reject);
      }

      if (this.status === PROMISE_STATUS_REJECTED && onRejected) {
        execFuncWithCatchErr(onRejected, this.reason, resolve, reject);
      }

      //状态还未确定的时候加入到数组中
      if (this.status === PROMISE_STATUS_PENDING) {
        this.onFulfilledFns.push(() => {
          onFulfilled &&
            execFuncWithCatchErr(onFulfilled, this.value, resolve, reject);
        });
        this.onRejectedFns.push(() => {
          onRejected &&
            execFuncWithCatchErr(onRejected, this.reason, resolve, reject);
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    this.then(
      () => {
        onFinally();
      },
      () => {
        onFinally();
      }
    );
  }

  static resolve(value) {
    return new pePromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new pePromise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(promises) {
    return new pePromise((resolve, reject) => {
      const values = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            values.push(res);
            if (values.length === promises.length) {
              resolve(values);
            }
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  static allSettled(promises) {
    return new pePromise((resolve, reject) => {
      const results = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            results.push({
              status: PROMISE_STATUS_FULFILLED,
              value: res,
            });
            if (results.length === promises.length) {
              resolve(results);
            }
          },
          (err) => {
            results.push({
              status: PROMISE_STATUS_REJECTED,
              value: err,
            });
            if (results.length === promises.length) {
              resolve(results);
            }
          }
        );
      });
    });
  }

  static race(promises) {
    return new pePromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  static any(promises) {
    return new pePromise((resolve, reject) => {
      const reasons = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reasons.push(err);
            // console.log(reasons);
            if (reasons.length === promises.length) {
              reject(new AggregateError(reasons));
            }
          }
        );
      });
    });
  }
}

const promise = new pePromise((resolve, reject) => {
  // console.log("excecutor被执行了");
  resolve("aaa");
  reject("bbb");

  // throw new Error("eee");
});

// promise
//   .then(
//     (res) => {
//       console.log("res1:", res);
//       // return "ccc";
//       // throw new Error("ddd");
//     },
//     (err) => {
//       console.log("err1:", err);
//       // return "ccc";
//       // throw new Error("ddd");
//     }
//   )
//   .then(
//     (res) => {
//       console.log("res2:", res);
//     },
//     (err) => {
//       console.log("err2:", err);
//     }
//   );

// promise.then(
//   (res) => {
//     console.log("res2:", res);
//   },
//   (err) => {
//     console.log("err2:", err);
//   }
// );

// setTimeout(() => {
//   promise.then(
//     (res) => {
//       console.log("res3:", res);
//     },
//     (err) => {
//       console.log("err3:", err);
//     }
//   );
// }, 1000);

// promise
//   .then((res) => {
//     console.log("res:", res);
//   })
//   .catch((err) => {
//     console.log("err:", err);
//   })
//   .finally(() => {
//     console.log("finally");
//   });

const promise1 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    reject(111);
  }, 1000);
});

const promise2 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    reject(222);
  }, 2000);
});

const promise3 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    reject(333);
  }, 3000);
});

// pePromise
//   .all([promise1, promise2, promise3])
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// pePromise.allSettled([promise1, promise2, promise3]).then((res) => {
//   console.log(res);
// });

// pePromise
//   .race([promise1, promise2, promise3])
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

pePromise
  .any([promise1, promise2, promise3])
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
