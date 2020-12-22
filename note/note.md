### 解析JSX
```javascript
"jsx": "react", /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
```

### namespace应用
#### namespace命名空间可以被全局解析，但如果没有declare的话，内部的变量需要export手动导出方能解析

### 处理并发，concurrent mode
为了不阻塞主线程，react采用了并发的方式来解决，在浏览器的空闲时间，见缝插针的进行渲染
参考：[https://github.com/facebook/react/tree/master/packages/scheduler](scheduler)
