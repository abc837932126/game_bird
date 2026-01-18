import { request } from './config'

class api {
	create_team = (data) => request('team', 'create_team', data)

	get_my_team = () => request('team', 'get_my_team')

	get_team = (team_id) => request('team', 'get_team', { team_id })

	get_player_team = (player_id) => request('team', 'get_player_team', { player_id })

	invite_player = (data) => request('team', 'invite_player', data)

	leave_team = (data) => request('team', 'leave_team', data)
}

export default class team {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.get_my_team()

		if (res.code !== 200) {
			this.data = null
			return
		}

		if (!res.data) {
			this.data = null
			return
		}

		if (!this.data) {
			this.data = res.data
		} else {
			Object.assign(this.data, res.data)
		}
	}
}
