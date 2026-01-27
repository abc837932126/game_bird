import { request } from './config.js'

class api {
	get = () => request('game_config_marriage', 'get')
	getAll = () => request('game_config_marriage', 'get_all')
}

export default class game_config_marriage {
	constructor() {
		this.data = null
		this.items = []
		this.api = new api()
	}

	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			console.error('获取婚礼配置失败:', res.msg)
			return
		}

		this.data = res.data
	}

	async updateItems() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			console.error('获取婚礼道具列表失败:', res.msg)
			return
		}

		this.items = res.data || []
	}

	// 获取婚礼道具列表
	getItems() {
		return this.items
	}

	// 获取婚礼使用的货币类型 ID（已废弃，保留兼容性）
	getCurrencyId() {
		return this.data?.currency_id || 1
	}

	// 获取货币信息（包含 nickname）（已废弃，保留兼容性）
	getCurrency() {
		return this.data?.currency
	}

	// 获取货币名称（已废弃，保留兼容性）
	getCurrencyName() {
		return this.data?.currency?.nickname || '金币'
	}
}
