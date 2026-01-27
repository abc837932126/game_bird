import { request } from './config'

class api {
	daily_checkin = () => request('player_checkin', 'daily_checkin')
	checkin_info = () => request('player_checkin', 'checkin_info')
}

export default class checkin {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.checkin_info()
		if (res.code !== 200) return
		this.data = res.data
	}

	async doCheckin() {
		const res = await this.api.daily_checkin()
		if (res.code === 200) {
			await this.update()
		}
		return res
	}
}
