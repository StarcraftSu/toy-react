import React from "./toy-react"
import Foo from './components/foo'

// const Page = (
//     <div className='king'>
//         <Foo/>
//     </div>
// )

const container = document.getElementById('root')

React.render(Foo,container)
export { React }