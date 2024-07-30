import React, { useMemo, useCallback, useState } from 'react'
import { Editor, Node, Transforms, Range, createEditor, Descendant } from 'slate'
import { withHistory } from 'slate-history'
import {
  withReact
} from 'slate-react'

import { ATTRIBUTES, CLOSE_BRACKET, OPEN_BRACKET, OPERATORS, SuggestionTypes, valueOptions  } from './utility/operators'
import { COMBINATION_OPTIONS } from './utility/operators'

import MentionExample from "."
import { withFilterExpressions } from './utility/withFilterExpressions'
import SuggestDropDown from './components/SuggestDropDown'
import { suggestionsType, queryPropsType } from './types'
import { CustomElement } from './custom-types'

const validateQuery = (value: Descendant[]) => {
	// console.log(value[0].children.filter(data => !!data.type))
	// console.log(value[0])
}


const queryProps: Array<queryPropsType> = [
	{
		type: SuggestionTypes.attribute,
		enableSuggestions: true,
		suggestionOptions: [...OPEN_BRACKET , ...ATTRIBUTES],
		nextProp: SuggestionTypes.operator,
    },
    {
		type: SuggestionTypes.operator,
		enableSuggestions: true,
		suggestionOptions: OPERATORS,
		nextProp: SuggestionTypes.value,
    },
    {
		type: SuggestionTypes.value,
		enableSuggestions: false,
		suggestionOptions: valueOptions,
		nextProp: SuggestionTypes.combinations
    },
	{
		type: SuggestionTypes.combinations,
		enableSuggestions: true,
		suggestionOptions: COMBINATION_OPTIONS,
	},
  ];

const initialValue: Descendant[] = [
    {    
      type: 'paragraph',
      children: [
        { text: '' },
      ],
    },
]

function Consumer() {
	const [openBracketCount, setOpenBracketCount] = useState<number>(0)
    const [nextSelection, setNextSelection] = useState<number>(0)
    const [target, setTarget] = useState<Range | undefined>()
    const [index, setIndex] = useState<number>(0)
    const [search, setSearch] = useState<string | undefined>('')
    const editor = useMemo(
        () => withFilterExpressions(withReact(withHistory(createEditor()))),
        []
    )

    const suggestions = useMemo<Array<suggestionsType>>(() => {
      if(search) {
      return queryProps[nextSelection].suggestionOptions.filter(c =>
        c.value.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 10)
    }else {
      return queryProps[nextSelection].suggestionOptions;
    }
    }, [nextSelection, search])

	const insertQueryData = useCallback((suggestion: suggestionsType) => {
		let type = queryProps[nextSelection].type
		if(suggestion.text === "(") {
			type = 'bracket'
			// remove open bracket from the queryProps's attribute type of data and add close bracket into the queryProp's combination_options type of data
			// and do not update nextSelection index
			// queryProps[0].suggestionOptions.shift();

			if(queryProps[3].suggestionOptions[0].text !== ")") {
				queryProps[3].suggestionOptions.unshift(...CLOSE_BRACKET);
			}
			setOpenBracketCount(prev => prev+1)
		} else if (suggestion.text === ")") {
			// If there's already an additional open bracket in the textfield then do not remove close bracket from the queryProps's combination_options type of data
			// else remove the close bracket from the queryProps's combination_options type of data
			// and do not update nextSelection index

			type = 'bracket';
			if(openBracketCount <= 1) {
				queryProps[3].suggestionOptions.shift();
			}
			setOpenBracketCount(prev => prev-1)
		} else {
			setNextSelection(prev => (prev + 1) % (queryProps.length))
		}
		const mention: CustomElement= {
			type: type,
			character: suggestion.text,
			children: [{ text: '' }],
		}
		// How to handle free text value? 
		Transforms.insertNodes(editor, mention)
		Transforms.move(editor)
	}, [nextSelection, editor, openBracketCount])

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
                        console.log("Enter key ")
                    //Get previous typed text to remove it when user selects something from the suggestion dropdown				
                    const selectedNode = editor.selection && Editor.node(editor, editor.selection.focus);
                    let inputText;
                    if(selectedNode && Node.string(selectedNode[0])) {
                        inputText = Node.string(selectedNode[0]);
                        Transforms.select(editor, target);
                    }
            
                    if(inputText && queryProps[nextSelection].type === "value" && !queryProps[nextSelection].enableSuggestions) {
                        insertQueryData({text: inputText, value: inputText})
                    }
                    insertQueryData(suggestions[index])
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
                    let inputText;
                    if(selectedNode && Node.string(selectedNode[0])) {
                        inputText = Node.string(selectedNode[0]);
                        Transforms.select(editor, target);
                    }

                    if(inputText && queryProps[nextSelection].type === "value" && !queryProps[nextSelection].enableSuggestions) {
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
      [suggestions, editor, index, target, insertQueryData, nextSelection]
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

		// setTarget(null)
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
          // Save the value to Local Storage.
        //   const content = JSON.stringify(value)
        //   localStorage.setItem('content', content)
        }
    }, [editor, setTarget])
    return <MentionExample 
        initialValue={initialValue}
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