import { request } from './config'

class api {
	send = (data) => request('guild_invite', 'send', data)

	get_pending = () => request('guild_invite', 'get_pending')

	accept = (data) => request('guild_invite', 'accept', data)

	reject = (data) => request('guild_invite', 'reject', data)

	cancel = (data) => request('guild_invite', 'cancel', data)

	get_sent = (data) => request('guild_invite', 'get_sent', data)
}

export default class guild_invite {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.get_pending()

		if (res.code !== 200) {
			return
		}

		this.data = res.data
	}
}
