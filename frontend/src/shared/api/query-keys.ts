const authQueryKeys = {
   bootstrap: () => ['auth', 'bootstrap'] as const,
}

const userQueryKeys = {
   me: () => ['user', 'me'] as const,
   lists: () => ['user', 'list'] as const,
   list: (params: object) => [...userQueryKeys.lists(), params] as const,
}

export { authQueryKeys, userQueryKeys }
