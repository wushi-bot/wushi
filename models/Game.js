module.exports = class Game {
  constructor (type, players, createdBy, started, isPrivate) {
    this.type = type
    this.players = players
    this.createdBy = createdBy
    this.started = started
    this.isPrivate = isPrivate
    this.requests = []
  }
}
