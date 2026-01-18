import { request } from './config'

class api {
	get_members = (data) => request('guild_member', 'get_members', data)

	kick = (data) => request('guild_member', 'kick', data)

	promote = (data) => request('guild_member', 'promote', data)

	demote = (data) => request('guild_member', 'demote', data)

	transfer_leadership = (data) => request('guild_member', 'transfer_leadership', data)

	get_contribution_rank = (data) => request('guild_member', 'get_contribution_rank', data)
}

export default class guild_member {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update(guild_id) {
		if (!guild_id) return

		const res = await this.api.get_members({ guild_id })

		if (res.code !== 200) {
			return
		}

		if (!this.data) {
			this.data = res.data
			return
		}

		// Smart array update
		res.data.forEach(newMember => {
			const existingIndex = this.data.findIndex(m => m.id === newMember.id)
			if (existingIndex !== -1) {
				Object.assign(this.data[existingIndex], newMember)
			} else {
				this.data.push(newMember)
			}
		})

		// Remove members not in new data
		this.data = this.data.filter(m =>
			res.data.some(newM => newM.id === m.id)
		)
	}
}
