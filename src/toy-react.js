const element = {
    type:'h1',
    props:{
        title:'cool',
        children: 'start'
    },
}
const root = document.getElementById('root')

const node = document.createElement(element.type)
node['title'] = element.props.title
const textNode = document.createTextNode(element.props.children)

node.appendChild(textNode)
root.appendChild(node)