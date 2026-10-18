import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { CreateUserDto } from './create-user.dto'
import { UpdateUserDto } from './update-user.dto'

const VALID_USER = {
   email: 'ivan@example.com',
   password: 'ChangeMe123!',
   firstName: 'Иван',
   lastName: 'Петров',
   position: 'Инженер',
   roleIds: ['11111111-1111-4111-8111-111111111111'],
}

describe.each([CreateUserDto, UpdateUserDto])('%name profile validation', (Dto) => {
   it.each([
      { status: null },
      { status: 'unknown' },
      { status: 1 },
      { avatarUrl: '' },
      { avatarUrl: 'not-a-url' },
      { avatarUrl: 'ftp://example.com/avatar.png' },
      { avatarUrl: '//example.com/avatar.png' },
      { avatarUrl: 123 },
      { avatarUrl: `https://example.com/${'a'.repeat(2030)}` },
   ])('rejects invalid profile fields: %j', async (fields) => {
      const dto = plainToInstance(Dto, { ...VALID_USER, ...fields })

      expect(await validate(dto, { whitelist: true })).not.toHaveLength(0)
   })

   it.each([
      {},
      { status: 'active' },
      { status: 'invited' },
      { status: 'vacation' },
      { avatarUrl: null },
      { avatarUrl: 'https://example.com/avatar.png' },
      { avatarUrl: 'http://localhost:3000/avatar.png' },
      { avatarUrl: `https://example.com/${'a'.repeat(2028)}` },
   ])('accepts optional profile fields: %j', async (fields) => {
      const dto = plainToInstance(Dto, { ...VALID_USER, ...fields })

      expect(await validate(dto, { whitelist: true })).toHaveLength(0)
      expect(dto).toMatchObject(fields)
   })
})
