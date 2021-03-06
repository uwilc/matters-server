import xss from 'xss'

const CUSTOM_WHITE_LISTS = {
  a: [...(xss.whiteList.a || []), 'class'],
  figure: [],
  figcaption: [],
  source: ['src', 'type'],
  iframe: ['src', 'frameborder', 'allowfullscreen', 'sandbox'],
}

const onIgnoreTagAttr = (tag: string, name: string, value: string) => {
  /**
   * Allow attributes of whitelist tags start with "data-" or "class"
   *
   * @see https://github.com/leizongmin/js-xss#allow-attributes-of-whitelist-tags-start-with-data-
   */
  if (name.substr(0, 5) === 'data-' || name.substr(0, 5) === 'class') {
    // escape its value using built-in escapeAttrValue function
    return name + '="' + xss.escapeAttrValue(value) + '"'
  }
}

const ignoreTagProcessor = (
  tag: string,
  html: string,
  options: { [key: string]: any }
) => {
  if (tag === 'input' || tag === 'textarea') {
    return ''
  }
}

const xssOptions = {
  whiteList: { ...xss.whiteList, ...CUSTOM_WHITE_LISTS },
  onIgnoreTagAttr,
  onIgnoreTag: ignoreTagProcessor,
}
const customXSS = new xss.FilterXSS(xssOptions)

export const sanitize = (string: string) => customXSS.process(string)
