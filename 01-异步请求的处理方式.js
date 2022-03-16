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
