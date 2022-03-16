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

    //为了实现finally，保证后面的promise不断(连续调then的时候没事，但是then->catch->finally会有问题)
    //因为如果是then->catch，相当于第二个then传入的是(undefined,onrejected)，相当于没有处理成功的回调函数了，那么后面就会断层了，都不会执行
    //所以相当于要传入一个处理成功的回调函数来占位。
    onfulfilled = onfulfilled || ((value) => value);

    return new pePromise((resolve, reject) => {
      if (this.status === PROMISE_STATUS_FULFILLED && onfulfilled) {
        execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
      }
      if (this.status === PROMISE_STATUS_REJECTED && onrejected) {
        execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
      }

      if (this.status === PROMISE_STATUS_PENDING) {
        this.onfulfilledFns.push(() => {
          execFuncWithCatchErr(onfulfilled, this.value, resolve, reject);
        });
        this.onrejectedFns.push(() => {
          execFuncWithCatchErr(onrejected, this.reason, resolve, reject);
        });
      }
    });
  }

  catch(onrejected) {
    //1.要想在catch后面调finally方法，首先catch必须有返回值
    //在这里catch实现借助了then方法，then方法本身就返回了promise，所以直接把借助的then方法返回即可
    return this.then(undefined, onrejected);
  }

  finally(onfinally) {
    //2.不管成功失败都传入finally的回调函数即可
    this.then(
      () => onfinally(),
      () => onfinally()
    );
  }

  static resolve(value) {
    return new pePromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new pePromise((resolve, reject) => reject(reason));
  }
}

pePromise.resolve("hello world").then((res) => {
  console.log(res);
});

pePromise.reject("hello hell").catch((err) => {
  console.log(err);
});
