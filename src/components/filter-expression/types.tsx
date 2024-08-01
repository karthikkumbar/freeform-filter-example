export type suggestionsType = {
    value: string,
    text: string
}

type QueryType = "attribute" | "operator" | "value" | "combination_operator" | "bracket" | "empty";
// type QueryType = "paragraph" | "attribute" | "operator" | "value" | "combination_operator" | "bracket";

export type queryPropsType = {
    type: QueryType,
    enableSuggestions: boolean,
    suggestionOptions: Array<suggestionsType>,
    nextProp?: QueryType
}

export type queryNodeType = {
    type: QueryType,
    value: string | undefined,
    text: string | undefined
}