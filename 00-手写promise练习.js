const PROMISE_STATUS_PENDING = "PROMISE_STATUS_PENDING";
const PROMISE_STATUS_FULFILLED = "PROMISE_STATUS_FULFILLED";
const PROMISE_STATUS_REJECTED = "PROMISE_STATUS_REJECTED";

class pePromise {
  constructor(executor) {
    this.value = undefined;
    this.reason = undefined;
    this.status = PROMISE_STATUS_PENDING;
    this.onFulfilledFns = [];
    this.onRejectedFns = [];

    const resolve = (value) => {
      queueMicrotask(() => {
        if (this.status !== PROMISE_STATUS_PENDING) return;
        this.status = PROMISE_STATUS_FULFILLED;
        this.value = value;
        this.onFulfilledFns.forEach((fn) => {
          fn(this.value);
        });
      });
    };
    const reject = (reason) => {
      queueMicrotask(() => {
        if (this.status !== PROMISE_STATUS_PENDING) return;
        this.status = PROMISE_STATUS_REJECTED;
        this.reason = reason;
        this.onRejectedFns.forEach((fn) => {
          fn(this.reason);
        });
      });
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onRejected =
      onRejected ||
      ((err) => {
        throw err;
      });

    return new pePromise((resolve, reject) => {
      if (this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
        try {
          const result = onFulfilled(this.value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === PROMISE_STATUS_REJECTED && onRejected) {
        try {
          const result = onRejected(this.reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
      if (this.status === PROMISE_STATUS_PENDING) {
        this.onFulfilledFns.push(() => {
          try {
            const result = onFulfilled(this.value);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedFns.push(() => {
          try {
            const result = onRejected(this.reason);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onfinally) {
    this.then(
      () => onfinally(),
      () => onfinally()
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
      const values = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            values.push({
              status: PROMISE_STATUS_FULFILLED,
              value: res,
            });
            if (values.length === promises.length) {
              resolve(values);
            }
          },
          (err) => {
            values.push({
              status: PROMISE_STATUS_REJECTED,
              reason: err,
            });
            if (values.length === promises.length) {
              resolve(values);
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

// const promise = new pePromise((resolve, reject) => {
//   // resolve("1111");
//   reject("2222");
//   // console.log("pending");
// });

// promise
//   .then(
//     (res) => {
//       console.log("res1:", res);
//       return "aaa";
//       // throw new Error("error");
//     },
//     (err) => {
//       console.log("err1:", err);
//       // return "bbb";
//       // throw new Error("error");
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

// pePromise.resolve("aaa").then((res) => {
//   console.log(res);
// });

// pePromise.reject("bbb").catch((err) => {
//   console.log(err);
// });

const promise1 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    // resolve("aaa");
    reject("aaa");
  }, 1000);
});

const promise2 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    // resolve("bbb");
    reject("bbb");
  }, 500);
});

const promise3 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    // resolve("ccc");
    reject("ccc");
  }, 3000);
});

// pePromise.all([promise1, promise2, promise3]).then(
//   (res) => {
//     console.log(res);
//   },
//   (err) => {
//     console.log(err);
//   }
// );

// pePromise.allSettled([promise1, promise2, promise3]).then((res) => {
//   console.log(res);
// });

// pePromise.race([promise1, promise2, promise3]).then(
//   (res) => {
//     console.log(res);
//   },
//   (err) => {
//     console.log(err);
//   }
// );

pePromise.any([promise1, promise2, promise3]).then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err.errors);
  }
);
