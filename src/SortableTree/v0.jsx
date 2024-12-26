





export default function SortableTree ({tree}){
    console.log(tree)
    return (
       <div>
       <TreeRender tree={tree} />
       </div>
    )
}


const TreeRender = ({tree})=>{

    return (
        <ul >
            {tree.map((node, key, index)=>(
                <>
                <li draggable>
                    <span >{node.title}</span>

                    {node.children && <TreeRender tree={node.children}/> }
                </li>

                </>
            ))}
        </ul>
    )

}