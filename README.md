# H5lock



## Demo

<img width="375" height="667" src="http://ww1.sinaimg.cn/large/808a542aly1gewe104wrcg20as0j84cp.gif" />

## How to use?

```
<script type="text/javascript" src="src/H5lock.publish.js"></script>
var opt = {
  chooseType: 3, // 3 , 4 , 5,
  width: 300, // lock wrap width
  height: 300, // lock wrap height
  container: 'element', // the id attribute of element
  inputEnd: function(psw){} // when draw end param is password string
}
var lock = new H5lock(opt);
lock.init();
```

## Option method

```
lock.drawStatusPoint('notright') // draw the last notright circle

lock.drawStatusPoint('right') // draw the last right circle

lock.reset() // reset the lock
```
## Support Vue

```
> Address[vue-lock](https://github.com/guntertien/vue-lock)

```

