import React, { useMemo, useCallback, useState } from 'react'
import { Element as SlateElement, Editor, Node, Transforms, Range, createEditor, Descendant, before } from 'slate'
import { withHistory } from 'slate-history'
import {
  withReact
} from 'slate-react'

import { ATTRIBUTES, CLOSE_BRACKET, OPEN_BRACKET, OPERATORS, SuggestionTypes, valueOptions  } from './utility/operators'
import { COMBINATION_OPTIONS } from './utility/operators'

// import { withFilterExpressions } from './utility/withFilterExpressions'
import SuggestDropDown from './components/SuggestDropDown'
import { suggestionsType, queryNodeType, QueryType } from './types'
import { CustomElement } from './custom-types'
import SlateTextField from '.'

// type QueryType = "attribute" | "operator" | "value" | "combination_operator" | "bracket" | "empty";
type DropdownContentType = {
    type: QueryType,
    options: Array<suggestionsType>,
    enableSuggestions?: boolean
    combo: string
}
// combo 1
const OPEN_BRACKET_AND_ATTRIBUTES = {
    combo: "combo1",
    type: SuggestionTypes.attribute,
    options: [...OPEN_BRACKET , ...ATTRIBUTES]
}
// combo 2
const ONLY_OPERATORS = {
    combo: "combo2",
    type: SuggestionTypes.operator,
    options: [...OPERATORS]
}

// combo 3
const ONLY_VALUES = {
    combo: "combo3",
    type: SuggestionTypes.value,
    enableSuggestions: false,
    options: [...valueOptions]
}

// combo 4
const CLOSE_BRACKET_AND_OR_COMBINATION = {
    combo: "combo4",
    type: SuggestionTypes.combinations,
    options: [...CLOSE_BRACKET, COMBINATION_OPTIONS[0]]
}
// combo 5
const OR_AND_COMBINATIONS = {
    combo: "combo5",
    type: SuggestionTypes.combinations,
    options: [...COMBINATION_OPTIONS]
}

const getPreviousDropDownContent = (node: Node): DropdownContentType => {
    if(SlateElement.isElement(node)) {
        const {combo, type, character } = node;
        if (combo === "combo1" && type === "bracket" && character === "(") {
            return OPEN_BRACKET_AND_ATTRIBUTES
        } else if(combo === "combo1" && type === 'attribute') {
            return OPEN_BRACKET_AND_ATTRIBUTES
        } else if( combo === "combo2" && type === "operator") {
            return ONLY_OPERATORS
        } else if( combo ==="combo3" && type === "value") {
            return ONLY_VALUES
        } else if( combo === "combo4" && type === "bracket") {
            return CLOSE_BRACKET_AND_OR_COMBINATION
        } else if( combo === "combo4" && type === "combination_operator") {
            return CLOSE_BRACKET_AND_OR_COMBINATION
        } else if( combo === "combo5") {
            return OR_AND_COMBINATIONS
        } else {
            return OPEN_BRACKET_AND_ATTRIBUTES
        }
    } else {
        // added to avoid typescript error
        return OPEN_BRACKET_AND_ATTRIBUTES
    }
}

const getNextDropDownContent = (node: Node):DropdownContentType => {
    console.log(node)
    if(SlateElement.isElement(node)) {
        const {combo, type, character } = node;
        if (combo === "combo1" && type === "bracket" && character === "(") {
            return OPEN_BRACKET_AND_ATTRIBUTES
        } else if(combo === "combo1" && type === 'attribute') {
            return ONLY_OPERATORS
        } else if( combo === "combo2" && type === "operator") {
            return ONLY_VALUES
        } else if( combo ==="combo3" && type === "value") {
            return CLOSE_BRACKET_AND_OR_COMBINATION
        } else if( combo === "combo4" && type === "bracket") {
            return OR_AND_COMBINATIONS
        } else if( combo === "combo4" && type === "combination_operator") {
            return ONLY_VALUES
        } else if( combo === "combo5") {
            return OPEN_BRACKET_AND_ATTRIBUTES
        } else {
            return OPEN_BRACKET_AND_ATTRIBUTES
        }
    } else {
        // added to avoid typescript error
        return OPEN_BRACKET_AND_ATTRIBUTES
    }
}

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
        const { isInline, isVoid, markableVoid, insertNode, insertText, insertFragment, deleteFragment, deleteBackward} = editor
      
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
                
        	  const [match] = Editor.nodes(editor, {
                    match: n =>{
                        if(SlateElement.isElement(n)) {
                            return !!n.children.filter(node => SlateElement.isElement(node) && node.type).length
                        }
                        return false;
                    }
        		})
        
        	  if (match) {
        		if(SlateElement.isElement(match[0])) {
                    console.log(match[0].children.filter(node => SlateElement.isElement(node) && node.type))
                    let queryNodes = match[0].children.filter(node => SlateElement.isElement(node) && node.type)
                    let lastNode = queryNodes[queryNodes.length-1]
                    console.log(getPreviousDropDownContent(lastNode))
                    setDropDownContent(getPreviousDropDownContent(lastNode))
                }
        	  }
        	}
        
        	deleteBackward(...args)

            let { selection: selection2 } = editor
            
            if (selection2 && Range.isCollapsed(selection2)) {
                const [start] = Range.edges(selection2)
    
                // undefined when there's no text before i.e when text box is empty
                const wordBefore = Editor.before(editor, start, { unit: 'word' })
                let beforeRange;
                if(wordBefore) {
                    const before = wordBefore && Editor.before(editor, wordBefore)
                    beforeRange = before && Editor.range(editor, before, start)
                } else {
                    beforeRange = selection2
                }
                setTarget(beforeRange)
            }
        }
    
        editor.deleteFragment = (...args) => {
            console.log("delet Fragment")
            deleteFragment(...args)
        }
          editor.insertNode = (node) => {
            console.log("node inserted", node)
            setDropDownContent(getNextDropDownContent(node))
            insertNode(node)
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
            let x = Array.from(Node.descendants(value[0]));
            let queryTypeNodes = x.filter(n => {
                if(SlateElement.isElement(n[0])) {
                    return n
                }
            }).map((n: any) :queryNodeType => {
                return {type: n[0].type, text: n[0].character, value: n[0].value, fields: n[0].fields}
            })

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
                console.log("groupSetCount: ", groupSetCount, "Group % 3", groupSetCount%3)
                console.log("combinationOperatorCount: ", combinationOperatorCount)

                if((groupSetCount % 3 === 0) && (combinationOperatorCount + 1 === groupSetCount / 3)) {
                    console.log("valid expression")
                    setIsInputValid(true)
                } else {
                    console.log("Invalid expression")
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
		if(suggestion.text === "(" || suggestion.text === ")") {
            type = 'bracket'
        }
		const mention: CustomElement= {
			type: type,
			character: suggestion.text,
            value: suggestion.value,
            fields: suggestion.fields || [],
			children: [{ text: '' }],
            combo: dropdownContent.combo
		}

        editor.insertNode(mention)
		// Transforms.insertNodes(editor, mention)
		Transforms.move(editor)
	}, [ editor, dropdownContent])

    const onKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (target && suggestions.length > 0) {
            // eslint-disable-next-line default-case
            switch (event.key) {
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
                        // const wordBefore = Editor.before(editor, start, { unit: 'line' })
                        // const before = wordBefore && Editor.before(editor, wordBefore)
                        // const beforeRange = before && Editor.range(editor, before, start)
                        // const beforeText = beforeRange && Editor.string(editor, beforeRange)
            
                        // setTarget(beforeRange)
                        const after = Editor.after(editor, start)
                        const afterRange = Editor.range(editor, start, after)
                        setTarget(afterRange)
                    }
                    //   setTarget(null)
                    //   setNextSelection(prev => (prev + 1) % (queryProps.length))
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
            if(event.key === 'Enter' || event.key === ' ') {
                if(target){
                    event.preventDefault()
                    //Get previous typed text to remove it when user selects something from the suggestion dropdown				
                    const selectedNode = editor.selection && Editor.node(editor, editor.selection.focus);
                    let inputText = selectedNode && Node.string(selectedNode[0]);
                    if(inputText && selectedNode) {
                        Transforms.select(editor, selectedNode[1]);
                    }

                    if(inputText && dropdownContent.type === "value" && !dropdownContent.enableSuggestions) {
                        insertQueryData({text: inputText, value: inputText})
                        let { selection } = editor

                        if (selection && Range.isCollapsed(selection)) {
                            const [start] = Range.edges(selection)
                            // const wordBefore = Editor.before(editor, start, { unit: 'line' })
                            // const before = wordBefore && Editor.before(editor, wordBefore)
                            // const beforeRange = before && Editor.range(editor, before, start)
                            // const beforeText = beforeRange && Editor.string(editor, beforeRange)

                            // setTarget(beforeRange)
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


            if (afterMatch) {
                setTarget(beforeRange)
                setSearch(beforeText && beforeText.trim())
                setIndex(0)
            }else {
				setTarget(undefined);
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