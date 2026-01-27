import { request } from './config.js'

class api {
	get = () => request('game_config_red_packet', 'get')
}

export default class game_config_red_packet {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			console.error('获取红包配置失败:', res.msg)
			return
		}

		this.data = res.data
	}

	// 获取红包使用的货币类型 ID
	getCurrencyId() {
		return this.data?.currency_id || 3
	}

	// 获取货币信息
	getCurrency() {
		return this.data?.currency
	}

	// 获取货币名称
	getCurrencyName() {
		return this.data?.currency?.nickname || '星币'
	}
}
