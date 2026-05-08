import { create } from "zustand"

const SESSION_STORAGE_KEY = "mock-session"

type MockSession = {
   login: string
   password: string
}

type SessionState = {
   session: MockSession | null
   writeSession: (session: MockSession) => void
   clearSession: () => void
}

const isBrowser = () => typeof window !== "undefined"

const parseSession = (rawValue: string | null) => {
   if (!rawValue) {
      return null
   }

   try {
      const parsedValue = JSON.parse(rawValue) as Partial<MockSession>

      if (
         typeof parsedValue.login !== "string" ||
         typeof parsedValue.password !== "string"
      ) {
         return null
      }

      return {
         login: parsedValue.login,
         password: parsedValue.password,
      } satisfies MockSession
   } catch {
      return null
   }
}

const readSession = () => {
   if (!isBrowser()) {
      return null
   }

   return parseSession(window.localStorage.getItem(SESSION_STORAGE_KEY))
}

const persistSession = (session: MockSession | null) => {
   if (!isBrowser()) {
      return
   }

   if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      return
   }

   window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

const useSessionStore = create<SessionState>((set) => ({
   session: readSession(),
   writeSession: (session) => {
      persistSession(session)
      set({ session })
   },
   clearSession: () => {
      persistSession(null)
      set({ session: null })
   },
}))

if (isBrowser()) {
   window.addEventListener("storage", (event) => {
      if (event.storageArea !== window.localStorage) {
         return
      }

      if (event.key !== SESSION_STORAGE_KEY && event.key !== null) {
         return
      }

      useSessionStore.setState({
         session: parseSession(event.newValue),
      })
   })
}

const writeSession = (session: MockSession) =>
   useSessionStore.getState().writeSession(session)

const clearSession = () => useSessionStore.getState().clearSession()

const isAuthenticated = () => useSessionStore.getState().session !== null

export {
   SESSION_STORAGE_KEY,
   clearSession,
   isAuthenticated,
   readSession,
   useSessionStore,
   writeSession,
}
export type { MockSession }
