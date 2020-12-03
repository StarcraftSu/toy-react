const TEXT_ELEMENT = 'TEXT_ELEMENT'
/**
 * 
 * @param {*} type 
 * @param {*} props 
 * @param  {...any} children 
 */
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

function createTextElement(text){
    return {
        type: TEXT_ELEMENT,
        props:{
            nodeValue: text,
            children:[]
        }
    }
}

const VERSION = '1.0'

export {
    createElement,
    createTextElement,
    VERSION
}