// import React, { ReactNode } from 'react'
import {
    RenderElementProps,
    // useSelected,
    // useFocused
} from 'slate-react'

type Props = RenderElementProps & {
    color: string,
}

// Mention component, this component renders when user selects a value from suggestion dropdown
const Mention = ({ attributes, children, element, color }: Props) => {
    // const selected = useSelected()
    // const focused = useFocused()
    const style: any = {
	  color: color,
      padding: '3px 1px 0px',
      margin: '0 2px',
      verticalAlign: 'baseline',
      display: 'inline-block',
      fontSize: '0.9em',
      // boxShadow: selected && focused ? `0 0 0 2px ${color}` : 'none',
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