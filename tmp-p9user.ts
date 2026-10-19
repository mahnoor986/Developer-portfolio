import { getPayload } from 'payload'
import config from './src/payload.config'
const payload = await getPayload({ config })
const email = 'tmp-phase9@example.com'
if (process.argv[2] === 'create') {
  const { totalDocs } = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (!totalDocs) await payload.create({ collection: 'users', data: { email, password: 'Tmp-phase9-12345!', name: 'Phase Nine Test' } })
} else await payload.delete({ collection: 'users', where: { email: { equals: email } } })
console.log('ok', process.argv[2]); process.exit(0)
