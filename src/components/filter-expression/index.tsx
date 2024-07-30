import React, { ReactElement, useCallback} from 'react'
import { Descendant } from 'slate'
import {
  Slate,
  Editable,
  RenderElementProps
} from 'slate-react'
import { CustomEditor, CustomRenderLeafProps } from './custom-types'
import Element from './components/Element'
import Leaf from './components/Leaf'
type SlateTextFieldType = {
    initialValue: Descendant[],
    editor: CustomEditor,
    onKeyDown: (event: React.KeyboardEvent) => void,
    onChange: (value: Descendant[]) => void
    onClick: (event: React.MouseEvent) => void
    SuggestDropDown?: ReactElement
}

const SlateTextField = (props: SlateTextFieldType) => {
	const { initialValue, editor, onKeyDown, onChange, SuggestDropDown, onClick} = props;
  const renderElement = useCallback((props:RenderElementProps) => <Element {...props} />, [])
  const renderLeaf = useCallback((props: CustomRenderLeafProps) => <Leaf {...props} />, [])

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={onChange}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={onKeyDown}
        placeholder="Enter some text..."
        onClick={onClick}
      />
		{SuggestDropDown && SuggestDropDown}
    </Slate>
  )
}

export default SlateTextField