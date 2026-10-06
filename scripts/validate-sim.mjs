// Validates the simulated enterprise data (relationships, reconciliation, ranges, realism).
// Usage: npm run validate:sim        (exits 1 on any error)
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'silent' })
try {
  const { sim } = await server.ssrLoadModule('/src/data/sim/index.ts')
  const { validate } = await server.ssrLoadModule('/src/data/sim/validate.ts')
  let failed = false
  for (const [id, d] of Object.entries(sim)) {
    const { errors, warnings, summary } = validate(d)
    console.log(`\n══ ${id.toUpperCase()} ══ ${summary.domain}`)
    console.log(summary.entities)
    console.log('\nFunctions (score, status │ Strat Perf Cost Tech Risk Trans):\n  ' + summary.functions.join('\n  '))
    console.log('\nSource systems:\n  ' + summary.sources.join('\n  '))
    console.log('\nStories (each layer with its health):\n  ' + summary.stories.join('\n  '))
    console.log('\nExecutive 360:\n  ' + summary.exec.join('\n  '))
    warnings.forEach((w) => console.log('  ⚠ ' + w))
    errors.forEach((e) => console.log('  ✗ ' + e))
    console.log(errors.length ? `\n✗ ${errors.length} error(s)` : '\n✓ no errors')
    failed ||= errors.length > 0
  }
  process.exitCode = failed ? 1 : 0
} finally { await server.close() }
