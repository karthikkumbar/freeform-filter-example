import React, { useMemo, useCallback, useState } from 'react'
import { Element as SlateElement, Editor, Node, Transforms, Range, createEditor, Descendant } from 'slate'
import { withHistory } from 'slate-history'
import {
  withReact
} from 'slate-react'
import SuggestDropDown from './components/SuggestDropDown'
import { suggestionsType } from './types'
import { CustomElement, CustomText } from './custom-types'
import SlateTextField from '.'
import { getQueryTypeNodesFromEditor, getQueryTypeNodesFromNode, getSlateTypeNodesFromEditor } from './utility'
import { OPEN_BRACKET_AND_ATTRIBUTES } from './utility/operators'
import { DropdownContentType } from './types'
import { getPreviousDropDownContent, getNextDropDownContent } from './utility'
const initialValue: Descendant[] = [
    {    
      type: 'empty',
      combo:'',
      children: [
        { text: '' }
      ],
    },
]

function Consumer() {
	const [openBracketCount, setOpenBracketCount] = useState<number>(0)
    const [target, setTarget] = useState<Range | undefined>()
    const [index, setIndex] = useState<number>(0)
    const [search, setSearch] = useState<string | undefined>('')
    const [isInputValid, setIsInputValid] = useState<boolean>(false)
    const [dropdownContent, setDropDownContent] = useState<DropdownContentType>(OPEN_BRACKET_AND_ATTRIBUTES)
    const [operatorFields, setOperatorFields] = useState<Array<any>>([])
    const suggestions = useMemo<Array<suggestionsType>>(() => {
      if(search) {
        return dropdownContent.options.filter(c =>
            c.value.toLowerCase().includes(search.toLowerCase())
            ).slice(0, 10)
        }else {
        return dropdownContent.options;
        }
    }, [dropdownContent, search])

    const withFilterExpressions = (editor: Editor) => {
        const { isInline, isVoid, markableVoid, insertNode, insertText, insertFragment, deleteFragment, deleteBackward, insertData} = editor
      
        editor.isInline = element => {
            return ["attribute" , "operator" , "value" , "combination_operator" , "bracket"].includes(element.type) || isInline(element);
        }
      
        editor.isVoid = element => {
          return ["attribute" , "operator" , "value" , "combination_operator" , "bracket"].includes(element.type) || isVoid(element)
        }
      
        editor.markableVoid = element => {
          return ["attribute" , "operator" , "value" , "combination_operator" , "bracket"].includes(element.type) || markableVoid(element)
        }
    
        editor.deleteBackward = (...args) => {
        	const { selection } = editor
        	if (selection && Range.isCollapsed(selection)) {
                const [nodeEntry] = Editor.nodes(editor);
                if(Node.isNode(nodeEntry[0])) {
                    const x = Array.from(Node.descendants(nodeEntry[0]))
                    if(!SlateElement.isElement(x[x.length-1][0])){
                        let lastElement = x[x.length-1][0] as CustomText
                        /**
                         * When user type something and clears that will be at the last node in below format
                         * {text: ""}
                         * will wait for user to clear all the text then update the dropDownContent accordingly
                         */
                        if(lastElement.text.length === 0) {
                            const queryNodes = getQueryTypeNodesFromEditor(editor)
                            const lastNode = queryNodes[queryNodes.length-1]
                            const lastButOneNode = queryNodes[queryNodes.length-2]

                            /**
                             * When we have expression like ( Application Port Is in between (From ,To) OR (From ,To))
                             * And when user deletes ) we should update the operatorFields with proper fields to show to the user
                             */
                            if(lastNode.combo === "combo4" && lastNode.type === "bracket" && lastNode.text === ")"){
                                if(lastButOneNode.fields.length > 0) {
                                    setOperatorFields(lastButOneNode.fields)
                                }
                            }

                            setDropDownContent(getPreviousDropDownContent(lastNode))
                        }
                    }
                }
        	}
        
        	deleteBackward(...args)
            /**
             * Update target
             */
            let { selection: selection2 } = editor
            
            if (selection2 && Range.isCollapsed(selection2)) {
                const [start] = Range.edges(selection2)
                const after = Editor.after(editor, start)
                const range = Editor.range(editor, start, after)
                setTarget(range)
            }
        }
    
        editor.deleteFragment = (...args) => {
            console.log("delet Fragment")
            deleteFragment(...args)
        }

        editor.insertNode = (node) => {
            setDropDownContent(getNextDropDownContent(node))

            /**
             * Merge multiplve value node
             */
            const slateNodes = getSlateTypeNodesFromEditor(editor)
            const queryTypeNodes = getQueryTypeNodesFromEditor(editor)

            if((SlateElement.isElement(node) && node.type === "value" ) && (SlateElement.isElement(slateNodes[slateNodes.length-1][0]) && slateNodes[slateNodes.length-1][0].type === "value")) {
                const {text, value} = queryTypeNodes[queryTypeNodes.length-1]
                const operatorNode = queryTypeNodes[queryTypeNodes.length-2]

                Transforms.removeNodes(editor, {at: slateNodes[slateNodes.length-1][1]})    
                if(SlateElement.isElement(node) && value && typeof node.value === "string") {
                    // convert "(400 ," to 400
                    const lower = text?.split("(")[1]?.replace(",", "").trim()
                    // convert "500)" to 500
                    const upper = node.character.split(")")[0]
                    node.character = `${text} ${node.character}`
                    node.value = [
                        {
                            [value]: lower,
                            [node.value]: upper
                        }
                    ]
                    node.fields = operatorNode.fields
                }
                insertNode(node)
            }else {
                insertNode(node)
            }
        
        }
        
        editor.insertData = (data) => {
            console.log("insertData", data)
            const textPlainData = data.getData("text/plain")
            console.log(typeof textPlainData, textPlainData)
            const regex = /"[^"]+"|[^\s]+/g
            if(typeof textPlainData === "string" && textPlainData) {
                const matchArray = textPlainData.match(regex);
                const newData = matchArray && matchArray.map(e => e.replace(/"(.+)"/, "$1"))
                console.log(newData)
            }
            insertData(data)
        }
        editor.insertText = (...args) => {
            console.log("insertText", args)
            insertText(...args)
        }
        editor.insertFragment = (...args) => {
            console.log("fragment inserted", args)
            insertFragment(...args)
        }
        return editor
    }
    const editor = useMemo(
        () => withFilterExpressions(withReact(withHistory(createEditor()))),
        []
    )

    const validateQuery = useCallback((value: Descendant[]) => {
        if(Node.isNode(value[0] )) {
            let queryTypeNodes = getQueryTypeNodesFromNode(value[0])
            if(queryTypeNodes.length !== 0) {
                // Get last query node
                let {type: lastQueryType, text: lastQueryText } = queryTypeNodes[queryTypeNodes.length-1];
                // validate the input
                // if bracketcount is not zero then its invalid expression
                if(openBracketCount !== 0) {
                    console.log("invalid bracket count: ", openBracketCount)
                    setIsInputValid(false)
                }
                /**
                 * For any combination of expression, for every AND/OR operator we will have 2 set of attribute, operator and value
                 * Similarly if I have n combination_operator, we will have n+1 set of attribute, operator and value
                 */

                let groupSetCount = queryTypeNodes.filter(node => (node.type === "attribute" || node.type === "operator" || node.type === "value")).length;
                let combinationOperatorCount = queryTypeNodes.filter(node => node.type === "combination_operator").length;

                if((groupSetCount % 3 === 0) && (combinationOperatorCount + 1 === groupSetCount / 3)) {
                    setIsInputValid(true)
                } else {
                    setIsInputValid(false)
                }
                // validateExpression(queryTypeNodes)
            } else {
                // text field is empty reset all
                setDropDownContent(OPEN_BRACKET_AND_ATTRIBUTES)
                setOpenBracketCount(0)
            }
        }
    }, [openBracketCount])

	const insertQueryData = useCallback((suggestion: suggestionsType) => {
		let type = dropdownContent.type
        let character = suggestion.text
        let fields = suggestion.fields
		if(character === "(" || character === ")") {
            type = 'bracket'
        }

        /**
         * Check if new node to be inserted is of type attribute and previous 
         * node is of type not bracket and text is not equal "(""
         * then insert open bracket node
         */

        if(type === "attribute" ) {
            const queryNodes = getQueryTypeNodesFromEditor(editor);
            if(queryNodes.length > 0) {
                let lastNode = queryNodes[queryNodes.length-1]
                if(lastNode.type !== "bracket" && lastNode.value !== "(") {
                    const newNode: CustomElement = {
                        type: "bracket",
                        character: "(",
                        value: "(",
                        children:[{text: ''}],
                        combo: ""
                    }
                    // This method does not invoke editor.insertNode
                    Transforms.insertNodes(editor, newNode)
                }
            }
        }
        /**
         * When the operator expects multiple values
         */
        if(type === "operator" && fields && fields?.length > 0) {
            setOperatorFields(fields)
        }

        if(operatorFields.length) {
            const index = operatorFields.findIndex(field => field.value === suggestion.value)
            if( index === 0) {
                character = `(${suggestion.text} ,`
            } else if(index === 1) {
                character = `${suggestion.text})`
            }
            if(type === "bracket" && character === ")") {
                setOperatorFields([])
            } else if( dropdownContent.combo === "combo4" && type === "combination_operator" && character === "OR") {
                // add fields to OR to show multiple values after this.
                fields = operatorFields
            }
        }

		const mention: CustomElement= {
			type: type,
			character: character,
            value: suggestion.value,
            fields: fields || [],
			children: [{ text: '' }],
            combo: dropdownContent.combo
		}

        editor.insertNode(mention)
		// Transforms.insertNodes(editor, mention)
		Transforms.move(editor)
	}, [ editor, dropdownContent, operatorFields])

    const onKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (target && suggestions.length > 0) {
            // eslint-disable-next-line default-case
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault()
                    Transforms.move(editor, { unit: 'offset', reverse: true })
                    break
                case 'ArrowRight':
                    // Restricting user from using Arrowleft and ArrowRight keys
                    // event.preventDefault()
                    // event.stopPropagation()
                    // Transforms.move(editor, { unit: 'line', edge: 'focus' })

                    event.preventDefault()
                    Transforms.move(editor, { unit: 'offset' })
                    break;
                case 'ArrowDown':
                    event.preventDefault()
                    const prevIndex = index >= suggestions.length - 1 ? 0 : index + 1
                    setIndex(prevIndex)
                    break
                case 'ArrowUp':
                    event.preventDefault()
                    const nextIndex = index <= 0 ? suggestions.length - 1 : index - 1
                    setIndex(nextIndex)
                    break
                case 'Tab':
                case 'Enter':
                    event.preventDefault()
                    //Get previous typed text to remove it when user selects something from the suggestion dropdown				
                    const selectedNode = editor.selection && Editor.node(editor, editor.selection.focus);
                    let inputText = selectedNode && Node.string(selectedNode[0])
                    if(inputText) {
                        Transforms.select(editor, target);
                    }

                    if(inputText && dropdownContent.type === "value" && !dropdownContent.enableSuggestions) {
                        insertQueryData({text: inputText, value: inputText})
                    } else {
                        insertQueryData(suggestions[index])
                    }

                    let { selection } = editor
            
                    if (selection && Range.isCollapsed(selection)) {
                        const [start] = Range.edges(selection)
                        const after = Editor.after(editor, start)
                        const afterRange = Editor.range(editor, start, after)
                        setTarget(afterRange)
                    }
                    setIndex(0)
                    break
                case 'Escape':
                    event.preventDefault()
                    setTarget(undefined)
                    break
                case 'Backspace':
                    //   const selectedNode2 = editor.selection && Editor.node(editor, editor.selection.focus);
                    // Should we update the nextSelection here??
                    break;
                default:
                    //   console.log("default case", event.key)
            }
        }else {
            if(event.key === "ArrowLeft") {
                // event.preventDefault()
                // event.stopPropagation()
                // Transforms.move(editor, { unit: 'line', edge: 'focus' })
                event.preventDefault()
                Transforms.move(editor, { unit: 'offset', reverse: true })
                return
            } else if (event.key === "ArrowRight") {
                event.preventDefault()
                Transforms.move(editor, { unit: 'offset' })
            } 
            if(event.key === 'Enter' || event.key === ' ') {
                if(target){
                    event.preventDefault()
                    // Select typed text to remove it, after user presses Enter or Space
                    const selectedNode = editor.selection && Editor.node(editor, editor.selection.focus);
                    let inputText = selectedNode && Node.string(selectedNode[0]);
                    if(inputText && selectedNode) {
                        Transforms.select(editor, selectedNode[1]);
                    }

                    if(inputText && dropdownContent.type === "value" && !dropdownContent.enableSuggestions) {
                        insertQueryData({text: inputText, value: dropdownContent.options[0].value, fields: dropdownContent.options[0].fields})
                        let { selection } = editor

                        if (selection && Range.isCollapsed(selection)) {
                            const [start] = Range.edges(selection)
                            const after = Editor.after(editor, start)
                            const afterRange = Editor.range(editor, start, after)
                            setTarget(afterRange)
                        }
                    }
                }
            }
        }
      },
      [suggestions, editor, index, target, insertQueryData, dropdownContent]
    )

	const onClick = useCallback((event: React.MouseEvent) => {
		const { selection } = editor

		if (selection && Range.isCollapsed(selection)) {
			const [start] = Range.edges(selection)
            const queryNodes = getQueryTypeNodesFromEditor(editor)

            if(queryNodes.length === 1 && queryNodes[0].type === "empty") {
                // undefined when there's no text before i.e when text box is empty
                const wordBefore = Editor.before(editor, start, { unit: 'word' })
                let beforeText;
                let beforeRange;
                if(wordBefore) {
                    const before = wordBefore && Editor.before(editor, wordBefore)
                    beforeRange = before && Editor.range(editor, before, start)
                    beforeText = beforeRange && Editor.string(editor, beforeRange)
                } else {
                    beforeRange = selection
                }

                const after = Editor.after(editor, start)
                const afterRange = Editor.range(editor, start, after)
                const afterText = Editor.string(editor, afterRange)
                const afterMatch = afterText.match(/^(\s|$)/)

                if (afterMatch) {
                    setTarget(beforeRange)
                    setSearch(beforeText && beforeText.trim())
                    setIndex(0)
                    return
                }
            } else {
                const slateNodes = getSlateTypeNodesFromEditor(editor)
                // move the focus to the end when user clicks anywjere in the text field
                const n = slateNodes[slateNodes.length-1][1][1]
                event.preventDefault()
                event.stopPropagation()
                Transforms.move(editor, { distance: n })
            }
		}
	}, [editor])

    const onChange = useCallback((value: Descendant[])  => {
      const { selection } = editor
        if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection)


			const wordBefore = Editor.before(editor, start)
			const before = wordBefore && Editor.before(editor, start, { unit: 'word' })

			const beforeRange = before && Editor.range(editor, before, start)
			
			const beforeText = beforeRange && Editor.string(editor, beforeRange)
			// const beforeMatch = beforeText && beforeText.match(/(\w+)$/)
			
			const after = Editor.after(editor, start)
			const afterRange = Editor.range(editor, start, after)
			const afterText = Editor.string(editor, afterRange)
			const afterMatch = afterText.match(/^(\s|$)/)


            if (afterMatch && beforeText) {
                setTarget(beforeRange)
                setSearch(beforeText.trim())
                setIndex(0)
            }else {
                // Moving the focus to the last node when user does not type anything on the text field
                const slateNodes = getSlateTypeNodesFromEditor(editor)
				const n = slateNodes[slateNodes.length-1][1][1]
                Transforms.move(editor, { distance: n })
                setSearch('')
			}
        }
  
        // setTarget(null)
        const isAstChange = editor.operations.some(
          	(op) => 'set_selection' !== op.type
        )
        if (isAstChange) {
            console.log("value: ", value)
			validateQuery(value)
        }
    // }, [editor, setTarget, validateQuery])
    }, [editor, setTarget, validateQuery])
    return <SlateTextField 
        initialValue={initialValue}
        isValid={isInputValid}
        editor={editor}
        onKeyDown={onKeyDown}
        onChange={onChange}
		onClick={onClick}
        SuggestDropDown = {
          <SuggestDropDown 
            target={target} 
            suggestions={suggestions}
            insertQueryData={insertQueryData}
            editor={editor}
            setTarget={setTarget}
            index={index}
		  />
        }
        
    />
}

export default Consumer;