import { request } from './config'

class api {
	create = (data) => request('guild', 'create', data)

	get_my_guild = () => request('guild', 'get_my_guild')

	get_info = (guild_id) => request('guild', 'get_info', { guild_id })

	get_player_guild = (player_id) => request('guild', 'get_player_guild', { player_id })

	update = (data) => request('guild', 'update', data)

	update_announcement = (data) => request('guild', 'update_announcement', data)

	leave = () => request('guild', 'leave')

	disband = (guild_id) => request('guild', 'disband', { guild_id })

	search = (data) => request('guild', 'search', data)

	get_list = (data) => request('guild', 'get_list', data)

	claim_salary = () => request('guild', 'claim_salary')
}

export default class guild {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.get_my_guild()

		if (res.code !== 200) {
			// 如果返回错误（比如没有加入工会），清空数据
			this.data = null
			return
		}

		// 如果返回的数据为空，也清空
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
