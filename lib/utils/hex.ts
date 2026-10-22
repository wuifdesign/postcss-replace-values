const hexRegex = /^#([0-9a-f]{3,4}){1,2}$/i

export const isHex = (value: string): boolean => hexRegex.test(value)

/**
 * All notations of a hex color in lowercase, the long form first:
 * `#abc` and `#aabbcc` give `['#aabbcc', '#abc']`, `#abcdef` gives `['#abcdef']`
 */
export const hexVariants = (hex: string): string[] => {
  const digits = hex.slice(1).toLowerCase()
  if (digits.length <= 4) {
    return [`#${digits.replace(/./g, '$&$&')}`, `#${digits}`]
  }
  const pairs = digits.match(/../g) ?? []
  return pairs.every((pair) => pair[0] === pair[1])
    ? [`#${digits}`, `#${pairs.map((pair) => pair[0]).join('')}`]
    : [`#${digits}`]
}
