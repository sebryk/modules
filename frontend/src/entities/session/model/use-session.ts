import { useSessionStore } from "@/entities/session/model/session"

const useSession = () => useSessionStore((state) => state.session)

export { useSession }
