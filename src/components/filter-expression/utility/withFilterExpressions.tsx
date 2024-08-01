import { Editor } from 'slate'

export const withFilterExpressions = (editor: Editor) => {
    const { isInline, isVoid, markableVoid, insertNode, insertText, insertFragment, deleteFragment} = editor
  
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
	// 	console.log("Delete")
	// 	if (selection && Range.isCollapsed(selection)) {
			
	// 	  const [match] = Editor.nodes(editor, {
	// 		match: n =>{
	// 			for (const [child, childPath] of Node.descendants(n)) {
	// 				// let x = Node.get(child, childPath)
	// 				console.log(SlateElement.isElement(child))
	// 			}
	// 			return !Editor.isEditor(n) &&
	// 			SlateElement.isElement(n) &&
	// 			(n.type === "attribute" || n.type === "operator" || n.type === "bracket" || n.type === "value")
	// 		}
	// 		})
	
	// 	  if (match) {
	// 		for (const [child, childPath] of Node.children(editor, [])) {
	// 			console.log(child)
	// 		}
	// 		setNextSelection((prev) => (prev -1))
	// 		// const [, path] = match
	// 		// const start = Editor.start(editor, path)
			
	// 		// if (Point.equals(selection.anchor, start)) {
	// 		//   const newProperties = {
	// 		// 	type: 'paragraph',
	// 		//   }
	// 		//   Transforms.setNodes(editor, newProperties, {
	// 		// 	match: n =>
	// 		// 	  !Editor.isEditor(n) &&
	// 		// 	  SlateElement.isElement(n) &&
	// 		// 	  n.type === 'check-list-item',
	// 		//   })
	// 		//   return
	// 		// }
	// 	  }
	// 	}
	
	// 	deleteBackward(...args)
    // }

	editor.deleteFragment = (...args) => {
		console.log("delet Fragment")
		deleteFragment(...args)
	}
	  editor.insertNode = (...args) => {
		console.log("inserted", args)
		insertNode(...args)
	  }
  
	  editor.insertText = (...args) => {
		// console.log("insertText", args)
		insertText(...args)
	  }
	  editor.insertFragment = (...args) => {
		console.log("fragment inserted", args)
		insertFragment(...args)
	  }
    return editor
}