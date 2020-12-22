import React from '../toy-react'
// 应用了
const Element = ({myWord})=>{
    return (
        <div id="foo" className='root'>
            <a className='uncle'>{myWord}</a>
            <b className='aunt'/>
            <div className='father'>
                父元素
                <span className='son'>子元素</span>
                <span className='sibling'>兄弟元素</span>
            </div>
        </div>
    )
}
  
export default Element