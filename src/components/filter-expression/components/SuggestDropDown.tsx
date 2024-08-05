import React, { useRef, useEffect } from "react";
import Portal from "./portal";
import { Editor,  Range } from 'slate'
import { ReactEditor } from 'slate-react'
import { suggestionsType } from "../types";
type Props = {
    target: Range | undefined,
    suggestions: Array<suggestionsType>,
    insertQueryData: (suggestion: suggestionsType) => void,
    editor: Editor,
    setTarget: (value: Range | undefined) => void
    index: number
}
export default function SuggestDropDown (props: Props) {
    const {target, suggestions, insertQueryData, editor, setTarget, index} = props
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (target && suggestions.length > 0 && ref.current) {
          const el = ref.current
          try {
            const domRange = ReactEditor.toDOMRange(editor, target)
            const rect = domRange.getBoundingClientRect()
            el.style.top = `${rect.top + window.pageYOffset + 24}px`
            el.style.left = `${rect.left + window.pageXOffset}px`
          } catch (error) {
            console.log(error)
          }
        }
      }, [suggestions.length, editor, index, target])

    // eslint-disable-next-line no-lone-blocks
    return (
        ( target && suggestions.length > 0 ? (
            <Portal>
                <div
                    ref={ref}
                    style={{
                        top: '-9999px',
                        left: '-9999px',
                        position: 'absolute',
                        zIndex: 1,
                        padding: '3px',
                        background: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 1px 5px rgba(0,0,0,.2)',
                    }}
                    data-cy="mentions-portal"
                >
                    {suggestions.map((char, i) => (
                        <div
                            key={char.value}
                            onClick={() => {
                            //   Transforms.select(editor, target)
                            //   insertMention(editor, char)
                                insertQueryData(char)
                                const { selection } = editor

                                if (selection && Range.isCollapsed(selection)) {
                                    const [start] = Range.edges(selection)
                                    const after = Editor.after(editor, start)
                                    const afterRange = Editor.range(editor, start, after)
                                    setTarget(afterRange)
                                }

                                // setNextSelection(prev => (prev + 1) % (queryProps.length))
                            }}
                            style={{
                                padding: '1px 3px',
                                borderRadius: '3px',
                                background: i === index ? '#B4D5FF' : 'transparent',
                            }}
                        >
                            {char.text}
                        </div>
                    ))}
                </div>
            </Portal>
        ) : <></>)
    )
}