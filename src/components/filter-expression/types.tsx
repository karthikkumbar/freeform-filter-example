export type suggestionsType = {
    value: string,
    text: string,
    fields?: Array<suggestionsType>
}

export type QueryType = "attribute" | "operator" | "value" | "combination_operator" | "bracket" | "empty";
// type QueryType = "paragraph" | "attribute" | "operator" | "value" | "combination_operator" | "bracket";

export type queryNodeType = {
    type: QueryType,
    value: string | undefined,
    text: string | undefined,
    fields: Array<suggestionsType>,
    combo: string
}

export type DropdownContentType = {
    type: QueryType,
    options: Array<suggestionsType>,
    enableSuggestions?: boolean
    combo: string
}