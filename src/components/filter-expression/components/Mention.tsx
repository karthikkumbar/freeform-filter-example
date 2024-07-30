import React, { ReactNode } from 'react'
import {
    RenderElementProps,
    useSelected,
    useFocused
} from 'slate-react'

type Props = RenderElementProps & {
    color: string,
}

// Mention component, this component renders when user selects a value from suggestion dropdown
const Mention = ({ attributes, children, element, color }: Props) => {
    const selected = useSelected()
    const focused = useFocused()
    const style: any = {
	  color: color,
      padding: '3px 3px 2px',
      margin: '0 5px',
      verticalAlign: 'baseline',
      display: 'inline-block',
      borderRadius: '4px',
      backgroundColor: '#eee',
      fontSize: '0.9em',
      boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
    }
    // See if our empty text child has any styling marks applied and apply those
    if (element.children[0].bold) {
      style.fontWeight = 'bold'
    }
    if (element.children[0].italic) {
      style.fontStyle = 'italic'
    }
    return (
      <span
        {...attributes}
        contentEditable={false}
        data-cy={`mention-${element.character && element.character.replace(' ', '-')}`}
        style={style}
      >
        {element.character}
        {children}
      </span>
    )
}

export default Mention