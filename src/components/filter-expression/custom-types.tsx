import { BaseEditor, BaseRange, Range, Element } from 'slate'
import { ReactEditor, RenderLeafProps } from 'slate-react'
import { HistoryEditor } from 'slate-history'
import { suggestionsType } from './types'

export type BracketElement = {
    type: "bracket"
    character: string
    combo: string
    fields?: Array<suggestionsType>
    value: string
    children: CustomText[]
}

export type AttributeElement = {
    type: 'attribute'
    character: string
    combo: string
    fields?: Array<suggestionsType>
    value: string
    children: CustomText[]
}

export type OperatorElement = {
    type: 'operator'
    character: string
    combo: string
    fields?: Array<suggestionsType>
    value: string
    children: CustomText[]
}

export type ValueElement = {
    type: 'value'
    character: string
    combo: string
    fields?: Array<suggestionsType>
    value: string | Array<any>
    children: CustomText[]
}

export type CombinationsElement = {
    type: 'combination_operator'
    character: string
    combo: string
    fields?: Array<suggestionsType>
    value: string
    children: CustomText[]
}

export type CustomElement2 =
  | BracketElement
  | AttributeElement
  | OperatorElement
  | CombinationsElement
  | ValueElement

export type EmptyElement = {
  type: 'empty'
  combo: string
  fields?: Array<suggestionsType>
  character?: string
  value?: string
  children: Array<CustomElement2 | CustomText>
}

export type ParagraphElement = {
  type: 'paragraph'
  align?: string
  character?: string
  children: CustomText[]
}

export type CustomElement =
  | BracketElement
  | AttributeElement
  | OperatorElement
  // | ParagraphElement
  | CombinationsElement
  | ValueElement
  | EmptyElement

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underline?:boolean
  text: string
  type?: string
}

export type EmptyText = {
  text: string
  type?: string
}

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>
  }

export type CustomRenderLeafProps = Omit<RenderLeafProps, "leaf"> & {
    leaf: CustomText
}

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText | EmptyText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}