export const SuggestionTypes = {
    attribute: "attribute",
    operator: "operator",
    value: "value",
    combinations: "combination_operator",
    bracket: "bracket"
  } as const
  
  export const OPEN_BRACKET = [
    {
      text: "(",
      value: "("
    }
  ]
  
  export const CLOSE_BRACKET = [
    {
      text: ")",
      value: ")"
    }
  ]
  
  export const COMBINATION_OPTIONS = [
    {
      text: "OR",
      value: "OR",
    },
    {
      text: "AND",
      value: "AND",
    },
  ];
  
  export const valueOptions = [
    {
      text: "Video",
      value: "video",
    },
    {
      text: "Voice",
      value: "voice",
    }
  ]
  export const ATTRIBUTES = [
      {
          value: "applicationport",
          text: "Application Port"
      },
      {
          value: "applicationip",
          text: "Application IP"
      },
      {
          value: "applicationdirection",
          text: "Application Direction"
      },
      {
          value: "clientip",
          text: "Client IP"
      },
      {
          value: "tos",
          text: "TOS"
      }
  ]
  
  export const OPERATORS = [
      {
        value: "equal",
        text: "= (Is equal to)",
      },
      {
        value: "notEqual",
        text: "!= (Is not equal to)",
      },
      {
        value: "prefix",
        text: "Is starts with",
      },
      {
        value: "notPrefix",
        text: "Is not starts with",
      },
      {
        value: "suffix",
        text: "Is ends with",
      },
      {
        value: "notSuffix",
        text: "Is not ends with",
      },
      {
        value: "contains",
        text: "Is contains",
      },
      {
        value: "notContains",
        text: "Is not contains",
      },
      {
        value: "gt",
        text: "> (Is greater than)",
      },
      {
        value: "lt",
        text: "< (Is less than)",
      },
      {
        value: "notgt",
        text: "!> (Is not greater than)",
      },
      {
        value: "notlt",
        text: "!< (Is not less than)",
      },
      {
        value: "between",
        text: "Is in between",
        fields: [
          {
            text: "From",
            value: "lower",
          },
          {
            text: "To",
            value: "upper",
          },
        ],
      },
      {
        value: "notBetween",
        text: "Is not in between",
        fields: [
          {
            text: "From",
            value: "lower",
          },
          {
            text: "To",
            value: "upper",
          },
        ],
      },
      {
        value: "mask",
        text: "Is mask",
        fields: [
          {
            text: "IP Address",
            value: "ip",
          },
          {
            text: "Mask",
            value: "mask",
          },
        ],
      },
      {
        value: "notMask",
        text: "Is not mask",
        fields: [
          {
            text: "IP Address",
            value: "ip",
          },
          {
            text: "Mask",
            value: "mask",
          },
        ],
      },
      {
        value: "subnetName",
        text: "Is subnet",
      //   selector: NamedSubnetSelector,
      },
      {
        value: "notSubnetName",
        text: "Is not subnet",
      //   selector: NamedSubnetSelector,
      },
    ];


// combo 1
export const OPEN_BRACKET_AND_ATTRIBUTES = {
  combo: "combo1",
  type: SuggestionTypes.attribute,
  options: [...OPEN_BRACKET , ...ATTRIBUTES]
}
// combo 2
export const ONLY_OPERATORS = {
  combo: "combo2",
  type: SuggestionTypes.operator,
  options: [...OPERATORS]
}

// combo 3
export const ONLY_VALUES = {
  combo: "combo3",
  type: SuggestionTypes.value,
  enableSuggestions: false,
  options: [...valueOptions]
}

// combo 4
export const CLOSE_BRACKET_AND_OR_COMBINATION = {
  combo: "combo4",
  type: SuggestionTypes.combinations,
  options: [...CLOSE_BRACKET, COMBINATION_OPTIONS[0]]
}
// combo 5
export const OR_AND_COMBINATIONS = {
  combo: "combo5",
  type: SuggestionTypes.combinations,
  options: [...COMBINATION_OPTIONS]
}