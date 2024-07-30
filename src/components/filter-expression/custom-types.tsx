import { BaseEditor, BaseRange, Range, Element } from 'slate'
import { ReactEditor, RenderLeafProps } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type BracketElement = {
    type: "bracket"
    character: string
    children: CustomText[]
}

export type AttributeElement = {
    type: 'attribute'
    character: string
    children: CustomText[]
}

export type OperatorElement = {
    type: 'operator'
    character: string
    children: CustomText[]
}

export type ValueElement = {
    type: 'value'
    character: string
    children: CustomText[]
}

export type CombinationsElement = {
    type: 'combination_operator'
    character: string
    children: CustomText[]
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
  | ParagraphElement
  | CombinationsElement
  | ValueElement

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underline?:boolean
  text: string
}

export type EmptyText = {
  text: string
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