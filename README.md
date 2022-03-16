# 深入promise

## 为何引入promise

```javascript
/**
 * 这种回调的方式有很多的弊端:
 *  1> 如果是我们自己封装的requestData,那么我们在封装的时候必须要自己设计好callback名称, 并且使用好
 *  2> 如果我们使用的是别人封装的requestData或者一些第三方库, 那么我们必须去看别人的源码或者文档, 才知道它这个函数需要怎么去获取到结果
 */

function requestData(url, successCallBack, failCallBack) {
  //模拟网络请求
  setTimeout(() => {
    //拿到请求的结果

    //模拟
    // url传递的是kobe就是请求成功否则失败
    if (url === "kobe") {
      //成功
      const names = ["abc", "cba", "nba"];
      //直接return肯定不行，外面拿不到结果
      // return names;
      successCallBack(names);
    } else {
      //失败
      const msg = "request failed";
      // return msg;
      failCallBack(msg);
    }

    //返回结果
  }, 1000);
}

requestData(
  "kobe",
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

// main.js
requestData(
  "kobe",
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

// 更规范/更好的方案 Promise承诺(规范好了所有的代码编写逻辑)
function requestData2() {
  return "承诺";
}

const chengnuo = requestData2();

```

![image-20220208143816604](深入promise.assets/image-20220208143816604.png)

## promise代码结构

![image-20220208143840512](深入promise.assets/image-20220208143840512.png)

```javascript
// 注意: Promise状态一旦确定下来, 那么就是不可更改的(锁定)
new Promise((resolve, reject) => {
  // pending状态: 待定/悬而未决的
  console.log("--------")
  reject() // 处于rejected状态(已拒绝状态)
  resolve() // 处于fulfilled状态(已敲定/兑现状态)
  console.log("++++++++++++")
}).then(res => {
  console.log("res:", res)
}, err => {
  console.log("err:", err)
})

```



## promise的resolve参数

![image-20220208155900745](深入promise.assets/image-20220208155900745.png)

```javascript
/**
 * resolve(参数)
 *  1> 普通的值或者对象  pending -> fulfilled
 *  2> 传入一个Promise
 *    那么当前的Promise的状态会由传入的Promise来决定
 *    相当于状态进行了移交
 *  3> 传入一个对象, 并且这个对象有实现then方法(并且这个对象是实现了thenable接口)
 *    那么也会执行该then方法, 并且又该then方法决定后续状态
 */

// 1.传入Promise的特殊情况
// const newPromise = new Promise((resolve, reject) => {
//   // resolve("aaaaaa")
//   reject("err message")
// })

// new Promise((resolve, reject) => {
//   // pending -> fulfilled
//   resolve(newPromise)
// }).then(res => {
//   console.log("res:", res)
// }, err => {
//   console.log("err:", err)
// })

// 2.传入一个对象, 这个兑现有then方法
new Promise((resolve, reject) => {
  // pending -> fulfilled
  const obj = {
    then: function(resolve, reject) {
      // resolve("resolve message")
      reject("reject message")
    }
  }
  resolve(obj)
}).then(res => {
  console.log("res:", res)
}, err => {
  console.log("err:", err)
})

// eatable/runable
const obj = {
  eat: function() {

  },
  run: function() {

  }
}

```

## then方法接受两个参数

![image-20220208160540833](深入promise.assets/image-20220208160540833.png)

## then方法可以多次调用

![image-20220208160613728](深入promise.assets/image-20220208160613728.png)

## then方法——返回值

![image-20220208164300787](深入promise.assets/image-20220208164300787.png)

```javascript
// Promise有哪些对象方法
// console.log(Object.getOwnPropertyDescriptors(Promise.prototype))

const promise = new Promise((resolve, reject) => {
  resolve("hahaha")
})

// 1.同一个Promise可以被多次调用then方法
// 当我们的resolve方法被回调时, 所有的then方法传入的回调函数都会被调用
// promise.then(res => {
//   console.log("res1:", res)
// })

// promise.then(res => {
//   console.log("res2:", res)
// })

// promise.then(res => {
//   console.log("res3:", res)
// })

// 2.then方法传入的 "回调函数: 可以有返回值
// then方法本身也是有返回值的, 它的返回值是Promise

// 1> 如果我们返回的是一个普通值(数值/字符串/普通对象/undefined), 那么这个普通的值被作为一个新的Promise的resolve值
// promise.then(res => {
//   return "aaaaaa"
// }).then(res => {
//   console.log("res:", res)
//   return "bbbbbb"
// })

// 2> 如果我们返回的是一个Promise
// promise.then(res => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(111111)
//     }, 3000)
//   })
// }).then(res => {
//   console.log("res:", res)
// })

// 3> 如果返回的是一个对象, 并且该对象实现了thenable
promise.then(res => {
  return {
    then: function(resolve, reject) {
      resolve(222222)
    }
  }
}).then(res => {
  console.log("res:", res)
})

```



## catch方法

![image-20220208164355165](深入promise.assets/image-20220208164355165.png)

![image-20220208164410367](深入promise.assets/image-20220208164410367.png)

```javascript
// const promise = new Promise((resolve, reject) => {
//   resolve()
//   // reject("rejected status")
//   // throw new Error("rejected status")
// })

// 1.当executor抛出异常时, 也是会调用错误(拒绝)捕获的回调函数的
// promise.then(undefined, err => {
//   console.log("err:", err)
//   console.log("----------")
// })

// 2.通过catch方法来传入错误(拒绝)捕获的回调函数
// promise/a+规范
// promise.catch(err => {
//   console.log("err:", err)
// })
// promise.then(res => {
//   // return new Promise((resolve, reject) => {
//   //   reject("then rejected status")
//   // })
//   throw new Error("error message")
// }).catch(err => {
//   console.log("err:", err)
// })


// 3.拒绝捕获的问题(前面课程)
// promise.then(res => {

// }, err => {
//   console.log("err:", err)
// })
// const promise = new Promise((resolve, reject) => {
//   reject("111111")
//   // resolve()
// })

// promise.then(res => {
// }).then(res => {
//   throw new Error("then error message")
// }).catch(err => {
//   console.log("err:", err)
// })

// promise.catch(err => {

// })

// 4.catch方法的返回值
const promise = new Promise((resolve, reject) => {
  reject("111111")
})

promise.then(res => {
  console.log("res:", res)
}).catch(err => {
  console.log("err:", err)
  return "catch return value"
}).then(res => {
  console.log("res result:", res)
}).catch(err => {
  console.log("err result:", err)
})

```

## finally方法

![image-20220208171817298](深入promise.assets/image-20220208171817298.png)



## Promise类方法——resolve方法

![image-20220208173124134](深入promise.assets/image-20220208173124134.png)

```javascript
// 转成Promise对象
// function foo() {
//   const obj = { name: "why" }
//   return new Promise((resolve) => {
//     resolve(obj)
//   })
// }

// foo().then(res => {
//   console.log("res:", res)
// })

// 类方法Promise.resolve
// 1.普通的值
// const promise = Promise.resolve({ name: "why" })
// 相当于
// const promise2 = new Promise((resolve, reject) => {
//   resolve({ name: "why" })
// })

// 2.传入Promise
const promise = Promise.resolve(new Promise((resolve, reject) => {
  resolve("11111")
}))

promise.then(res => {
  console.log("res:", res)
})

// 3.传入thenable对象


```

## Promise类方法——reject方法

![image-20220208173226647](深入promise.assets/image-20220208173226647.png)

```javascript
// const promise = Promise.reject("rejected message")
// 相当于
// const promise2 = new Promsie((resolve, reject) => {
//   reject("rejected message")
// })

// 注意: 无论传入什么值都是一样的
const promise = Promise.reject(new Promise(() => {}))

promise.then(res => {
  console.log("res:", res)
}).catch(err => {
  console.log("err:", err)
})

```



## Promise类方法——all方法

![image-20220208202009901](深入promise.assets/image-20220208202009901.png)



```javascript
// 创建多个Promise
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(11111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(22222)
  }, 2000);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(33333)
  }, 3000);
})

// 需求: 所有的Promise都变成fulfilled时, 再拿到结果
// 意外: 在拿到所有结果之前, 有一个promise变成了rejected, 那么整个promise是rejected
Promise.all([p2, p1, p3, "aaaa"]).then(res => {
  console.log(res)
}).catch(err => {
  console.log("err:", err)
})

```

Promise类方法——**allSettled方法**

![image-20220208204047000](深入promise.assets/image-20220208204047000.png)

```javascript
// 创建多个Promise
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(11111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(22222)
  }, 2000);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(33333)
  }, 3000);
})

// allSettled
Promise.allSettled([p1, p2, p3]).then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})

```

输出结果：（allSettled其实不会来到catch里面）

<img src="深入promise.assets/image-20220208204231103.png" alt="image-20220208204231103" style="zoom: 50%;" />



## Promise类方法——race方法

![image-20220208205213080](深入promise.assets/image-20220208205213080.png)

```javascript
// 创建多个Promise
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(11111)
  }, 3000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(22222)
  }, 500);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(33333)
  }, 1000);
})

// race: 竞技/竞赛
// 只要有一个Promise变成fulfilled状态, 那么就结束
// 意外: 
Promise.race([p1, p2, p3]).then(res => {
  console.log("res:", res)
}).catch(err => {
  console.log("err:", err)
})

```



## Promise类方法——any方法

![image-20220208205548999](深入promise.assets/image-20220208205548999.png)



```javascript
// 创建多个Promise
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    // resolve(11111)
    reject(1111)
  }, 1000);
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(22222)
  }, 500);
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    // resolve(33333)
    reject(3333)
  }, 3000);
})

// any方法
Promise.any([p1, p2, p3]).then(res => {
  console.log("res:", res)
}).catch(err => {
  console.log("err:", err.errors)//如果全部都是rejected，可以通过err.errors拿到错误信息
})


```



## 手写Promise

### Promise结构的搭建

```javascript
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

```

总结:封装一个Promise类，构造函数需要传递一个参数，参数为一个函数，这个函数就相当于executor，这个函数是立即会被执行的，对应promise里面的pending状态，同时executor又接受两个参数resolve和rejcet，这两个参数也是函数对应其余两个状态，通过定义全局变量来定义三个状态，来实现状态转移不可逆转的效果。

同时类中还需要保存value，对应resolve里的参数以及reason对应reject里面的参数。



### Promise——then方法的设计

```java
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

```

总结：then方法需要传递两个回调函数，这两个回调函数事实上是在外界传入的时候初始化的，所以这里需要注意，在类中调用这两个回调函数的地方需要在之前对其进行微任务处理，要不然初始化之前在转移状态的时候拿不到值，会报错。还有一点就是必须先要搞懂then中传入的回调函数是在哪里被调用，事实上是在相应的状态转移函数里面被执行，因为比如resolve(xxx),会转移状态到fulfilled，但是在回调函数里面要拿到对应的xxx，所以是在resolve函数内部调用，reject的情况是同理。

弊端：当前实现的then方法不能调用多次，定义多个promise.then代码快的化只会执行最后一次的回调，因为主线程运行完之后才会到微任务，相当于最后一次的promise.then的代码块中的回调函数把Promise类中then方法的前一次保存的onfulfilled, onrejected覆盖掉了。解决方法：可以在类中定义两个数组分别保存fulfilled的回调函数和rejected的回调函数。



### Promise——then方法的优化（一）



```javascript
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
  // resolve(111);
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

```

总结：优化1.使用两种数组保存可能多次调用then中的两种回调函数，优化2.碰到延迟一会再调用then方法后的解决方案（状态已经改变之后再调用then），修改then方法。

### Promise——then方法的优化（二）（难）

(有点难 记得多回来看看)

```javascript
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
            // fn(this.value);这里由于then方法里进行了重写，fn本身就是一个函数且没有传递参数，不过不该也没什么影响
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
        try {
          const result = onfulfilled(this.value);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }
      if (this.status === PROMISE_STATUS_REJECTED && onrejected) {
        try {
          const result = onrejected(this.reason);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }

      if (this.status === PROMISE_STATUS_PENDING) {
        this.onfulfilledFns.push(() => {
          try {
            const result = onfulfilled(this.value);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
        this.onrejectedFns.push(() => {
          try {
            const result = onrejected(this.reason);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      }
    });
  }
}

const promise = new pePromise((resolve, reject) => {
  // console.log("状态pending");
  resolve(111);
  // reject(222);
  // throw new Error("newError");
});

promise
  .then(
    (res) => {
      console.log(res);
      // return "aaa";
      throw new Error("error message");
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

```

总结：这里的目的是优化了链式调用的功能，之前是不可以进行链式调用的。

要想实现链式调用，首先要知道原版promise的机制，then方法要有返回值才可以进行链式调用，返回值会默认包裹上resolve后续链式调用，所以后续链式调用是默认进入then中的第一个参数（resolve的回调），除非在第一步就抛出了异常，才会进入后续链式调用里面then中的第二个参数（reject的回调）



首先为了满足then方法的返回值，需要再then方法中返回一个自己定义的promise类，但是，需要拿到第一步的

onfulfilled, onrejected的返回值才能包裹resolve ，上面一段提到过，所以不能随便返回，需要将之前的代码块作为需要返回的promise的executor（这样做的目的：1.之前的代码块可以不受影响，因为executor会默认执行一次，2.可以拿到之前的onfulfilled, onrejected的返回值，从而对其用resolve包裹，实现链式调用），为了解决抛出异常后在后续链式调用中需要进入rejected状态，还需要在包裹resolve的代码块中用trycatch包裹。



此外还有一个技巧，怎么拿到状态确定之前的分支语句中的返回值呢，之前是将onfulfilled，onrejected来传递给数组，在微任务中进行调用，现在为了拿到返回值，可以将原本需要传递给数组的函数直接包裹一个函数，在函数中直接调用onfulfilled，onrejected方法进行调用从而拿到返回值，这里也要用trycatch包裹。



还需要在执行executor的时候包裹一个trycatch，从而能在第一个reject中接住。



//如果把逻辑复用可以更简洁

复用逻辑之后的版本

```javascript
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

```



### Promise——catch方法的设计

```javascript
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
  .then((res) => {
    console.log("res:", res);
  })
  .catch((err) => {
    console.log("err:", err);
  });

```



总结：实现此时不难，就是很难想，首先catch中只用传递一个回调函数作为参数这是显而易见的，其次，实现的时候可以简单的借用then来实现，then的第二个参数传递undefined即可，但是这里会出现一个问题，因为在then之后调用catch，而catch本质上是调then，相当于我要在第二个promise的reject中处理第一个rejected状态，怎么可以做到呢，可以参考链式调用的代码（如下图所示），当我在第一个promise中的reject参数代表的回调函数中抛出异常，那么就是由第二个promise的reject回调函数来处理。

```javascript
promise
  .then(
    (res) => {
      console.log(res);
      return "aaa";
      // throw new Error("error message");
    },
    (err) => {
      // console.log(err);
      // return "bbb";
      // throw new Error("error message");
      throw err;//************在这里抛出异常
    }
  )
  .then(
    (res) => {
      console.log("res1:", res);
    },
    (err) => {
      console.log("err1:", err);//**************会在这里处理
    }
  );
```



### Promise——finally方法的设计

```javascript
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
}

const promise = new pePromise((resolve, reject) => {
  resolve(222);
  reject(111);
});

promise
  .then((res) => {
    console.log("res:", res);
    return "aaa";
  })
  .catch((err) => {
    console.log("err:", err);
  })
  .finally(() => {
    console.log("finally");
  });

```



### Promise——类方法resolve和reject方法

```javascript
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

```



### Promise——类方法all方法和allSettled方法

```javascript
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
}

const promise1 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    resolve(111);
  }, 1000);
});

const promise2 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    // resolve(222);
    reject(222);
  }, 2000);
});

const promise3 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    resolve(333);
  }, 3000);
});

// pePromise.all([promise1, promise2, promise3]).then(
//   (res) => {
//     console.log("res:", res);
//   },
//   (err) => {
//     console.log("err:", err);
//   }
// );

pePromise.allSettled([promise1, promise2, promise3]).then(
  (res) => {
    console.log("res:", res);
  },
  (err) => {
    console.log("err:", err);
  }
);

```



### Promise——类方法race和any方法

```javascript
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
    //resolve必须等到有一个成功
    //reject 所有的都执行失败了
    return new pePromise((resolve, reject) => {
      const reasons = [];
      promises.forEach((promise) => {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => {
            reasons.push(err);
            if (reasons.length === promises.length) {
              reject(new AggregateError(reasons));
            }
          }
        );
      });
    });
  }
}

const promise1 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    reject(111);
  }, 1000);
});

const promise2 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    // resolve(222);
    reject(222);
  }, 500);
});

const promise3 = new pePromise((resolve, reject) => {
  setTimeout(() => {
    reject(333);
  }, 3000);
});

// pePromise.race([promise1, promise2, promise3]).then(
//   (res) => {
//     console.log("res:", res);
//   },
//   (err) => {
//     console.log("err:", err);
//   }
// );

pePromise.any([promise1, promise2, promise3]).then(
  (res) => {
    console.log("res:", res);
  },
  (err) => {
    console.log("err:", err.errors);
  }
);

```

