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
    return new pePromise((resolve, reject) => {
      if (this.status === PROMISE_STATUS_FULFILLED && onfulfilled) {
        // try {
        //   const result = onfulfilled(this.value);
        //   resolve(result);
        // } catch (err) {
        //   reject(err);
        // }
        execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
      }
      if (this.status === PROMISE_STATUS_REJECTED && onrejected) {
        // try {
        //   const result = onrejected(this.reason);
        //   resolve(result);
        // } catch (err) {
        //   reject(err);
        // }
        execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
      }

      if (this.status === PROMISE_STATUS_PENDING) {
        this.onfulfilledFns.push(() => {
          // try {
          //   const result = onfulfilled(this.value);
          //   resolve(result);
          // } catch (err) {
          //   reject(err);
          // }
          execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
        });
        this.onrejectedFns.push(() => {
          // try {
          //   const result = onrejected(this.reason);
          //   resolve(result);
          // } catch (err) {
          //   reject(err);
          // }
          execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
        });
      }
    });
  }
}

const promise = new pePromise((resolve, reject) => {
  // console.log("状态pending");
  // resolve(111);
  reject(222);
  // throw new Error("newError");
});

promise
  .then(
    (res) => {
      console.log(res);
      return "aaa";
      // throw new Error("error message");
    },
    (err) => {
      console.log(err);
      return "bbb";
      // throw new Error("error message");
    }
  )
  .then(
    (res) => {
      console.log("res1:", res);
    },
    (err) => {
      console.log("err1:", err);
    }
  );
