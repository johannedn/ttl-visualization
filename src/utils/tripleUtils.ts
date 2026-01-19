export const isURI = (str: string): boolean =>
  str.startsWith('http://') ||
  str.startsWith('https://') ||
  str.startsWith('urn:')

export const getShortName = (uri: string): string => {
  if (!isURI(uri)) return uri
  const parts = uri.split(/[/#]/)
  return parts[parts.length - 1] || uri
}

export const getNamespace = (uri: string): string => {
  if (!isURI(uri)) return ''
  const last = Math.max(uri.lastIndexOf('/'), uri.lastIndexOf('#'))
  return uri.substring(0, last + 1)
}
