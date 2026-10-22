import { describe, expect, test } from 'vitest'
import { hexVariants, isHex } from './hex'

const hexCases: [string, string, boolean][] = [
  ['should accept 3 digit hex', '#abc', true],
  ['should accept 4 digit hex', '#abcd', true],
  ['should accept 6 digit hex', '#AABBCC', true],
  ['should accept 8 digit hex', '#aabbccdd', true],
  ['should reject 5 digit hex', '#000aa', false],
  ['should reject non hex digits', '#ggg', false],
  ['should reject values without #', 'abc', false],
]

const variantCases: [string, string, string[]][] = [
  ['should expand 3 digit hex', '#abc', ['#aabbcc', '#abc']],
  ['should expand 4 digit hex', '#abcd', ['#aabbccdd', '#abcd']],
  ['should shorten 6 digit hex', '#aabbcc', ['#aabbcc', '#abc']],
  ['should shorten 8 digit hex', '#aabbccdd', ['#aabbccdd', '#abcd']],
  ['should not shorten 6 digit hex without short form', '#aabbcd', ['#aabbcd']],
  ['should lowercase hex', '#ABC', ['#aabbcc', '#abc']],
]

describe('isHex', () => {
  test.each(hexCases)('%s', (_, input, expected) => {
    expect(isHex(input)).toBe(expected)
  })
})

describe('hexVariants', () => {
  test.each(variantCases)('%s', (_, input, expected) => {
    expect(hexVariants(input)).toEqual(expected)
  })
})
