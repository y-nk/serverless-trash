import { DocumentStore } from 'ravendb'

export const getStoreSession = (storeName: string) => {
  const store = new DocumentStore(process.env.RAVENDB_URL!, storeName)
  store.initialize()

  return store.openSession()
}
