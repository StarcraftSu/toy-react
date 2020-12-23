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
function render(element,container:HTMLElement){
    // 创建dom
    const dom = element.type === TEXT_ELEMENT
    ? document.createTextNode(element.props.nodeValue)
    : document.createElement(element.type)
    // 一般的属性赋值到dom上
    const isProperty = key => key!=='children'
    Reflect.ownKeys(element.props) // 基本等于Object.keys
    .filter(isProperty)
    .forEach(prop=>{
        dom[prop] = element.props[prop]
    })
    // 后序遍历 从最下层组件开始挂载
    element.props.children.forEach(child=>render(child,dom))
    // if(element.props.className){
    //     console.log('append:'+ element.props.className)
    // }
    container.appendChild(dom)
}

// Fiber
// 这里用了简称，应该为任务单元，unitOfWork
let workToDo = null
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
    requestIdleCallback(workLoop)
}
// 空余时间执行任务循环
requestIdleCallback(workLoop)
// 执行任务
function work(workToDo){
    // DO WORK
}

export default {
    createElement,
    render,
    VERSION
}