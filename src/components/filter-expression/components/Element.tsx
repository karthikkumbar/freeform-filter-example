import React from "react"
import Mention from "./Mention"

import {
    RenderElementProps,
} from 'slate-react'

function Element(props: RenderElementProps) {
    const { attributes, children, element } = props
    switch (element.type) {
		case 'bracket': 
			return <Mention {...props} color={'black'}/>
		case 'attribute': 
			return <Mention {...props} color={'red'}/>
		case 'operator': 
		return <Mention {...props} color={'green'}/>
		case 'value': 
			return <Mention {...props} color={'blue'}/>
		case 'combination_operator':
			return <Mention {...props} color={'black'} />
		default:
        	return <p {...attributes}>{children}</p>
    }
}

export default Element