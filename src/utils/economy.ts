import UserSchema from "../schemas/User"
import { getUser } from './database'

export async function addMoney(user, amount) {
  let u = await getUser(user)
  u.balance += amount
  u.save()
  return amount
}