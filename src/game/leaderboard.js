import { request } from './config'

class api {
	get_charm_leaderboard = (data) => request('leaderboard', 'get_charm_leaderboard', data)
	get_cultivation_leaderboard = (data) => request('leaderboard', 'get_cultivation_leaderboard', data)
}

export default class leaderboard {
	constructor() {
		this.api = new api()
	}
}
