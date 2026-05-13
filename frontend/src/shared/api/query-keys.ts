const authQueryKeys = {
   bootstrap: () => ["auth", "bootstrap"] as const,
}

const userQueryKeys = {
   me: () => ["user", "me"] as const,
}

export { authQueryKeys, userQueryKeys }
