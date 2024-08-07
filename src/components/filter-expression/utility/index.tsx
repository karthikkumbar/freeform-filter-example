import { Element as SlateElement, Node, Editor } from "slate";
import { queryNodeType } from "../types";
import { OPEN_BRACKET_AND_ATTRIBUTES, ONLY_OPERATORS, ONLY_VALUES, CLOSE_BRACKET_AND_OR_COMBINATION, OR_AND_COMBINATIONS } from "./operators";
import { DropdownContentType } from "../types";

export const getPreviousDropDownContent = (node: queryNodeType): DropdownContentType => {
    const {combo, type, text, fields } = node;
    if (combo === "combo1" && type === "bracket" && text === "(") {
        return OPEN_BRACKET_AND_ATTRIBUTES
    } else if(combo === "combo1" && type === 'attribute') {
        return OPEN_BRACKET_AND_ATTRIBUTES
    } else if( combo === "combo2" && type === "operator") {
        return ONLY_OPERATORS
    } else if( combo ==="combo3" && type === "value") {
        /**
         * The operator expects multiple values
         */
        if(fields && fields.length > 0) {
            const newArr = [...fields];
            newArr.shift()
            const first = fields[0]
            if(first) {
                return {
                    ...ONLY_VALUES,
                    options: [
                        {
                            ...first,
                            fields: newArr
                        }
                    ]
                }
            }
        }
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
}

export const getNextDropDownContent = (node: Node):DropdownContentType => {
    if(SlateElement.isElement(node)) {
        const {combo, type, character, fields } = node;
        if (combo === "combo1" && type === "bracket" && character === "(") {
            return OPEN_BRACKET_AND_ATTRIBUTES
        } else if(combo === "combo1" && type === 'attribute') {
            return ONLY_OPERATORS
        } else if( combo === "combo2" && type === "operator") {
            /**
             * The operator expects multiple values
             */
            if(fields && fields.length > 0) {
                const newArr = [...fields];
                newArr.shift()
                const first = fields[0]
                if(first) {
                    return {
                        ...ONLY_VALUES,
                        options: [
                            {
                                ...first,
                                fields: newArr
                            }
                        ]
                    }
                }
            }
            return ONLY_VALUES
        } else if( combo ==="combo3" && type === "value") {
            /**
             * The value expects multiple values
             */
            if(fields && fields.length > 0) {
                const newArr = [...fields];
                newArr.shift()
                const first = fields[0]
                if(first) {
                    return {
                        ...ONLY_VALUES,
                        options: [
                            {
                                ...first,
                                fields: newArr
                            }
                        ]
                    }
                }
            }
            return CLOSE_BRACKET_AND_OR_COMBINATION
        } else if( combo === "combo4" && type === "bracket") {
            return OR_AND_COMBINATIONS
        } else if( combo === "combo4" && type === "combination_operator") {
            /**
             * The value expects multiple values
             */
            if(fields && fields.length > 0) {
                const newArr = [...fields];
                newArr.shift()
                const first = fields[0]
                if(first) {
                    return {
                        ...ONLY_VALUES,
                        options: [
                            {
                                ...first,
                                fields: newArr
                            }
                        ]
                    }
                }
            }
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

export function getQueryTypeNodesFromEditor (editor: Editor) {
    const [nodeEntry] = Editor.nodes(editor);
    return getQueryTypeNodesFromNode(nodeEntry[0])
}

export function getQueryTypeNodesFromNode (nodeEntry: Node) {
    if(Node.isNode(nodeEntry)) {
        const x = Array.from(Node.descendants(nodeEntry))
        return x.filter(n => {
            if(SlateElement.isElement(n[0]) && n[0].type) {
                return n;
            }
        }).map((n: any) :queryNodeType => {
            return {type: n[0].type, text: n[0].character, value: n[0].value, fields: n[0].fields, combo: n[0].combo}
        })
    }
    return []
}

export function getSlateTypeNodesFromEditor (editor: Editor) {
    const [nodeEntry] = Editor.nodes(editor);
    if(Node.isNode(nodeEntry[0])) {
        const x = Array.from(Node.descendants(nodeEntry[0]))
        return x.filter(n => {
            if(SlateElement.isElement(n[0]) && n[0].type) {
                return n;
            }
        })
    }
    return []
}