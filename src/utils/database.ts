import User from '../models/User'

export const checkUser = async function (bot, user) {
  let users = await User.find({
    id: user,
  }).exec()
  if (!users[0]) {
    let profile = new User({
      id: user
    })
    profile.save()
    
  }
}
