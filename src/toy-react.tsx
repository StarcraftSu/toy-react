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
    const isProperty = key => key!=='children'
    Reflect.ownKeys(fiber.props) // 基本等于Object.keys
    .filter(isProperty)
    .forEach(prop=>{
        dom[prop] = fiber.props[prop]
    })
    return dom
}

function commitRoot(){
    // TODO add nodes to dom
    commitWork(wipRoot.child)
    wipRoot = null
}

// wipRoot的dom就是容器，所以不需要append
function commitWork(fiber){
    if(!fiber){
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

// ① 给予了第一份工作
function render(element,container:HTMLElement){
   // 初始化根节点
   wipRoot = {
       dom:container,
       props:{
           children:[element]
       }
   }

   workToDo = wipRoot
}

// Fiber
// 这里用了简称，应该为任务单元，unitOfWork
let workToDo = null
let wipRoot = null
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
    // 添加dom节点
    if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }
    // 如果fiber有父节点，就把自己的dom节点挂载到父节点上
    // if(fiber.parent){
    //     fiber.parent.dom.appendChild(fiber.dom)
    // }

    // 创建新的fibers
    const children = fiber.props.children
    let index = 0
    let prevSibling = null
    while(index<children.length){
        const child = children[index]
        // 根据child构建新的fiber
        const newFiber = {
            type: child.type,
            props: child.props,
            parent: fiber,
            dom: null
        }
        // 挂载第一个child节点
        if(index === 0){
            fiber.child = newFiber
        }else{
            prevSibling.sibling = newFiber
        }

        // prevSibling指向当前节点，同级之间用sibling链接
        prevSibling = newFiber
        index++
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

export default {
    createElement,
    render,
    VERSION
}