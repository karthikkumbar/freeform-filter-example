import { Editor} from 'slate'

export const withFilterExpressions = (editor: Editor) => {
    const { isInline, isVoid, markableVoid, insertNode, insertText, insertFragment} = editor
  
    editor.isInline = element => {
      return (element.type === 'bracket' || element.type === 'attribute' || element.type === 'operator' || element.type === 'value' || element.type === 'combination_operator') ? true : isInline(element)
    }
  
    editor.isVoid = element => {
      return (element.type === 'bracket' || element.type === 'attribute' || element.type === 'operator' || element.type === 'value' || element.type === 'combination_operator') ? true : isVoid(element)
    }
  
    editor.markableVoid = element => {
      return (element.type === 'bracket' || element.type === 'attribute' || element.type === 'operator' || element.type === 'value' || element.type === 'combination_operator') || markableVoid(element)
    }

	// editor.deleteBackward = (...args) => {
	// 	const { selection } = editor
	
	// 	if (selection && Range.isCollapsed(selection)) {
	// 	  const [match] = Editor.nodes(editor, {
	// 		match: n => {
	// 			if(!Editor.isEditor(n) &&
	// 		  SlateElement.isElement(n)) {
	// 			console.log(n, n.type)
	// 		  }
	// 		}
	// 	  })
	
	// 	  if (match) {
	// 		const [, path] = match
	// 		const start = Editor.start(editor, path)
	
	// 		if (Point.equals(selection.anchor, start)) {
	// 		  const newProperties = {
	// 			type: 'paragraph',
	// 		  }
	// 		  Transforms.setNodes(editor, newProperties, {
	// 			match: n =>
	// 			  !Editor.isEditor(n) &&
	// 			  SlateElement.isElement(n) &&
	// 			  n.type === 'check-list-item',
	// 		  })
	// 		  return
	// 		}
	// 	  }
	// 	}
	
	// 	deleteBackward(...args)
    // }

	  editor.insertNode = (...args) => {
		console.log("inserted", args)
		insertNode(...args)
	  }
  
	  editor.insertText = (...args) => {
		// console.log("insertText")
		insertText(...args)
	  }
	  editor.insertFragment = (...args) => {
		console.log("fragment inserted", args)
		insertFragment(...args)
	  }
    return editor
}