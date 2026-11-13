/**
 * Ultimo elemento di un array o di una stringa.
 *
 * Sostituisce `Array.prototype.at(-1)`, assente nei motori più vecchi ancora
 * diffusi nelle WebView delle app (Chrome < 92, Safari/iOS < 15.4): lì la
 * chiamata lancia `TypeError` già alla creazione del checker.
 */
export function lastItem<T>(items: ArrayLike<T>): T | undefined {
  return items.length > 0 ? items[items.length - 1] : undefined
}
