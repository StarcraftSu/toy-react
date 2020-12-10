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

    element.props.children.forEach(child=>render(child,dom))
    container.appendChild(dom)
}

export default {
    createElement,
    render,
    VERSION
}