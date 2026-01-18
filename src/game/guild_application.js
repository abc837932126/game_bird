import { request } from './config'

class api {
	apply = (data) => request('guild_application', 'apply', data)

	get_my_applications = () => request('guild_application', 'get_my_applications')

	get_guild_applications = (data) => request('guild_application', 'get_guild_applications', data)

	accept = (data) => request('guild_application', 'accept', data)

	reject = (data) => request('guild_application', 'reject', data)

	cancel = (data) => request('guild_application', 'cancel', data)
}

export default class guild_application {
	constructor() {
		this.data = null
		this.guildApplications = []
		this.pendingCount = 0
		this.api = new api()
	}

	async update() {
		const res = await this.api.get_my_applications()

		if (res.code !== 200) {
			return
		}

		this.data = res.data
	}

	async updateGuildApplications(guildId) {
		if (!guildId) return

		const res = await this.api.get_guild_applications({ guild_id: guildId })

		if (res.code !== 200) {
			return
		}

		this.guildApplications = res.data
		this.pendingCount = res.data.filter(app => app.status === 'pending').length
	}
}
