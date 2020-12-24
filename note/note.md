### 解析JSX
```javascript
"jsx": "react", /* Specify JSX code generation: 'preserve', 'react-native', or 'react'. */
```

### namespace应用
#### namespace命名空间可以被全局解析，但如果没有declare的话，内部的变量需要export手动导出方能解析

### 处理并发，concurrent mode
为了不阻塞主线程，react采用了并发的方式来解决，在浏览器的空闲时间，见缝插针的进行渲染
参考：[https://github.com/facebook/react/tree/master/packages/scheduler](scheduler)

为了更为形象，就将执行的任务暂时解释成需求
1. 定义需求: workToDo
2. 定义迭代: workLoop函数
    - 在函数中，首先要确认是否有时间去做，剩余时间(idle-time)大于某个阈值
    - 执行任务，并同时确认下一个任务，等同于写迭代同时确认下一个迭代的内容
    - 使用requestIdleCallback来模拟这种见缝插针的调度模式，具体要参考上面的scheduler
参考：SchedulerPostTaskOnly.js

### 新调度结构，Fiber
1. 每个fiber对应对一个element，而每个fiber就是一个unit of work
    - 创建一个root fiber，


Fiber类型-参考：ReactInternalTypes.js