import { mkdir, writeFile } from 'node:fs/promises'

const url =
  'https://fonts.googleapis.com/css2?family=Spectral:wght@400;600;800&family=JetBrains+Mono:wght@400;500&display=swap'
const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const keep = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']

const css = await fetch(url, { headers: { 'User-Agent': ua } }).then((r) => r.text())
await mkdir('src/fonts', { recursive: true })

let out = ''
let n = 0
for (const chunk of css.split('/*').slice(1)) {
  const subset = chunk.slice(0, chunk.indexOf('*/')).trim()
  if (!keep.includes(subset)) continue
  const body = chunk.slice(chunk.indexOf('*/') + 2)
  const fam = body.match(/font-family:\s*'([^']+)'/)?.[1]
  const weight = body.match(/font-weight:\s*(\d+)/)?.[1]
  const src = body.match(/url\(([^)]+)\)/)?.[1]
  const range = body.match(/unicode-range:\s*([^;]+);/)?.[1]
  if (!fam || !weight || !src) continue
  const name = `${fam.replace(/\s+/g, '')}-${weight}-${subset}.woff2`
  const buf = Buffer.from(await fetch(src).then((r) => r.arrayBuffer()))
  await writeFile(`src/fonts/${name}`, buf)
  out += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${weight};font-display:swap;src:url(../fonts/${name}) format('woff2');unicode-range:${range};}\n`
  n++
}

await writeFile('src/styles/fonts.css', out)
console.log('fonts written:', n)
