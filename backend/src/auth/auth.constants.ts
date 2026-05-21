import * as argon2 from 'argon2'

export const IS_PUBLIC_KEY = 'isPublic'
export const PERMISSION_KEY = 'permission'

export const PASSWORD_HASH_OPTIONS: argon2.Options & { raw?: false } = {
   type: argon2.argon2id,
   memoryCost: 19456,
   timeCost: 2,
   parallelism: 1,
}
