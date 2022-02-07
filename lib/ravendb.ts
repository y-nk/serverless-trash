import { CreateDatabaseOperation, DocumentStore } from 'ravendb'
import { readFileSync } from 'fs'

export const getStoreSession = async (databaseName: string) => {
  const store = new DocumentStore(process.env.RAVENDB_URL!, databaseName, {
    type: 'pfx',
    certificate: readFileSync('./certs/ravendb.pfx'),
  })

  store.initialize()

  const session = store.openSession()

  try {
    await session.load('0')
  } catch (err: unknown) {
    if ((err as any).name === 'DatabaseDoesNotExistException') {
      await store.maintenance.server.send(
        new CreateDatabaseOperation({ databaseName }),
      )
    }
  }

  return session
}
