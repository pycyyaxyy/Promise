// ES6 ES2015
// https://promisesaplus.com/
const PROMISE_STATUS_FULFILLED = "fulfilled";
const PROMISE_STATUS_PENDING = "pending";
const PROMISE_STATUS_REJECTED = "rejected";

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
            // fn(this.value);这里由于then方法里进行了重写，fn本身就是一个函数且没有传递参数，不过不改也没什么影响
            //为了和下面的代码保持一致还是进行了修改
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
          this.onrejectedFns.forEach((fn) => {
            // fn(this.reason);
            fn();
          });
        });
      }
    };
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onfulfilled, onrejected) {
    //为了实现catch，如果onrejected传递的是undefined，将其赋值为抛出异常的回调函数
    onrejected =
      onrejected ||
      ((err) => {
        throw err;
      });
    return new pePromise((resolve, reject) => {
      if (this.status === PROMISE_STATUS_FULFILLED && onfulfilled) {
        execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
      }
      if (this.status === PROMISE_STATUS_REJECTED && onrejected) {
        execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
      }

      if (this.status === PROMISE_STATUS_PENDING) {
        this.onfulfilledFns.push(() => {
          onfulfilled &&
            execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
        });
        this.onrejectedFns.push(() => {
          onrejected &&
            execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
        });
      }
    });
  }

  catch(onrejected) {
    this.then(undefined, onrejected);
  }
}

const promise = new pePromise((resolve, reject) => {
  // resolve(222);
  reject(111);
});

promise
  .then(
    (res) => {
      console.log("res:", res);
    }
    // (err) => {
    //   console.log("err0:", err);
    // }
  )
  .catch((err) => {
    console.log("err:", err);
  });
