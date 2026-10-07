import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const D = process.argv[2]
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9334', `--user-data-dir=${D}/prof3`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target
for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch('http://127.0.0.1:9334/json')).json()).find((t) => t.type === 'page') } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0; const pending = new Map()
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } })
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: `file://${D}/deck.html` }); await sleep(2500)
const { result } = await send('Runtime.evaluate', { returnByValue: true, expression: `JSON.stringify([...document.querySelectorAll('section.s')].map((s,i)=>{const r=s.getBoundingClientRect(); const f=s.querySelector('.foot'); const lim=f?f.getBoundingClientRect().top:r.bottom; const bad=[...s.querySelectorAll('*')].filter(e=>!e.closest('.foot')&&!e.classList.contains('bar')&&e.getBoundingClientRect().height>0&&(e.getBoundingClientRect().bottom>lim+1||e.getBoundingClientRect().right>r.right+1)).filter(e=>!e.parentElement||!(e.parentElement.getBoundingClientRect().bottom>lim+1)).slice(0,3).map(e=>e.tagName+':'+(e.textContent||'').trim().slice(0,40)+' b='+Math.round(e.getBoundingClientRect().bottom-r.top)); return [i+1,bad]}).filter(x=>x[1].length))` })
console.log('overflow:', result.value)
const n = (await send('Runtime.evaluate', { returnByValue: true, expression: 'document.querySelectorAll("section.s").length' })).result.value
for (let i = 0; i < n; i++) {
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: i * 720, width: 1280, height: 720, scale: 1 }, captureBeyondViewport: true })
  writeFileSync(`${D}/p${String(i + 1).padStart(2, '0')}.png`, Buffer.from(shot.data, 'base64'))
}
const pdf = await send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 })
writeFileSync(`${D}/deck.pdf`, Buffer.from(pdf.data, 'base64'))
console.log('pdf ok', n)
ws.close(); chrome.kill(); process.exit(0)
