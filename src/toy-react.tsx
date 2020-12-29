const VERSION = '1.0'

const TEXT_ELEMENT = 'TEXT_ELEMENT'
/**
 * 
 * @param {*} type 
 * @param {*} props 
 * @param  {...any} children 
 */
// 递归创建虚拟dom
function createElement(type:string,props, ...children){
    return {
        type,
        props:{
            ...props,
            children: children.map(child => 
                typeof child === 'object'
                ? child
                : createTextElement(child)    
            )
        }
    }
}

function createTextElement(text:string){
    return {
        type: TEXT_ELEMENT,
        props:{
            nodeValue: text,
            children:[]
        }
    }
}

/**
 * render function 会自动接收到一个解析好的element-tree并进行渲染
 * @param element 
 * @param container 
 */
function createDom(fiber){
    // 创建dom
    const dom = fiber.type === TEXT_ELEMENT
    ? document.createTextNode(fiber.props.nodeValue)
    : document.createElement(fiber.type)
    // 一般的属性赋值到dom上
    Reflect.ownKeys(fiber.props) // 基本等于Object.keys
    .filter(isProperty)
    .forEach(prop=>{
        dom[prop] = fiber.props[prop]
    })
    return dom
}
// 是不是事件
const isEvent = key => key.startsWith('on')
// 是不是属性
const isProperty = key => key!=='children' && !isEvent(key)
// 是不是新的属性
const isNew = (prev,next)=>key=>prev[key]!==next[key]
// 是不是属性被移除了
const isGone = (prev, next) => key => !(key in next)


function updateDom(dom,prevProps,nextProps){
    // Remove old or changed event listeners
    Object.keys(prevProps)
    .filter(isEvent)
    .filter(
        key =>
        !(key in nextProps) || 
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name=>{
        const eventType = name
        .toLowerCase()
        .substring(2)

        dom.removeEventListener(
            eventType,
            prevProps[name]
        )
    })

    Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps,nextProps))
    .forEach(name=>{
        dom[name] = ""
    })

    // Set new or changed properties
    Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps)) // 老哥太秀了，利用filter悄咪咪的注入了key
    .forEach(name => {
        dom[name] = nextProps[name]
    })

    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps,nextProps))
      .forEach(name=>{
        const eventType = name
        .toLowerCase()
        .substring(2)

        dom.addEventListener(
            eventType,
            prevProps[name]
        )
      })
}

// Fiber
// 这里用了简称，应该为任务单元，unitOfWork
let workToDo = null
let wipRoot = null
let currentRoot = null
let deletions = []

function commitRoot(){
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

// wipRoot的dom就是容器，所以不需要append
function commitWork(fiber){
    if(!fiber){
        return
    }
    // 如果是function component fiber.parent是不存在dom这个属性的
    let fiberParent = fiber.parent
    if(!fiberParent.dom){
        fiberParent = fiberParent.parent
    }
    const domParent = fiberParent.dom
    if(fiber.effectTag === 'PLACEMENT' && fiber.dom!==null){
        domParent.appendChild(fiber.dom)
    }else if(
        fiber.effectTag === 'UPDATE' && 
        fiber.dom!=null
    ){
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }else if(fiber.effectTag === 'DELETION'){
        commitDeletion(fiber, domParent)
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

    function commitDeletion(fiber, domParent) {
        if (fiber.dom) {
            domParent.removeChild(fiber.dom)
        } else {
            commitDeletion(fiber.child, domParent)
        }
    }

// ① 给予了第一份工作
function render(element,container:HTMLElement){
   // 初始化根节点
   wipRoot = {
       dom:container,
       props:{
           children:[element]
       },
       alternate: currentRoot
   }
   deletions = []
   workToDo = wipRoot
}

const requestIdleCallback = window.requestIdleCallback
// 工作流
function workLoop (deadline){
    // 是否应该停止执行任务
    let shouldStop = false
    // 是否可以执行工作
    while(workToDo && !shouldStop){
        workToDo = work(workToDo)
        // 如果没剩余时间，跳出循环
        shouldStop = deadline.timeRemaining()<1
    }
    // 如果没有下一个任务，并且有初始化的节点，就提交整个fiber tree
    if(!workToDo && wipRoot){
        commitRoot()
    }

    requestIdleCallback(workLoop)
}
// 空余时间执行任务循环，第一次注册，第一次render之后开始调用
requestIdleCallback(workLoop)

// 执行任务
// work in  progress root aka.wipRoot
function work(fiber){
    const isFunctionComponent = fiber.type instanceof Function
    if(isFunctionComponent){
        updateFunctionComponent(fiber)
    }else{
        updateHostComponent(fiber)
    }

    // 返回下一个任务
    if(fiber.child){
        return fiber.child
    }
    let nextFiber = fiber
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function updateFunctionComponent(fiber){
    // fiber.type === function
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber,children)
}

function updateHostComponent(fiber){
    // 添加dom节点
    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }

    const children = fiber.props.children
    reconcileChildren(fiber,children)
}

function  reconcileChildren(wipFiber,children){
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    while(
        index<children.length 
        || oldFiber!=null
    ){
        const child = children[index]
        let newFiber = null
        const sameType = oldFiber && child && child.type === oldFiber.type
        if(sameType) {
           newFiber = {
               type: oldFiber.type,
               props: child.props,
               dom: oldFiber.dom,
               parent: wipFiber,
               alternate: oldFiber,
               effectTag: 'UPDATE'
           }
        }

        if(child && !sameType){
           newFiber = {
            type: child.type,
            props: child.props,
            dom: null,
            parent: wipFiber,
            alternate: null,
            effectTag: 'PLACEMENT'
           }
           console.log(newFiber)
        }

        if(oldFiber && !sameType){
           oldFiber.effectTag = 'DELETION'
           deletions.push(oldFiber)
        }

        if(oldFiber){
            oldFiber = oldFiber.sibling
        }
        // 挂载第一个child节点
        if(index === 0){
            wipFiber.child = newFiber
        }else{
            prevSibling.sibling = newFiber
        }

        // prevSibling指向当前节点，同级之间用sibling链接
        prevSibling = newFiber
        index++
    }
}

export default {
    createElement,
    render,
    VERSION
}