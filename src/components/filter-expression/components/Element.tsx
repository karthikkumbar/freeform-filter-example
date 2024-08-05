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
			return <Mention {...props} color={'#6929c4'}/>
		case 'operator': 
		return <Mention {...props} color={'#1192e8'}/>
		case 'value': 
			return <Mention {...props} color={'#005d5d'}/>
		case 'combination_operator':
			return <Mention {...props} color={'black'} />
		default:
        	return <p {...attributes}>{children}</p>
    }
}

export default Element