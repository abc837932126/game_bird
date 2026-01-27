import { request } from './config.js'

class api {
	get = () => request('game_config_gift', 'get')
}

export default class game_config_gift {
	constructor() {
		this.data = null
		this.api = new api()
	}

	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			console.error('获取礼物配置失败:', res.msg)
			return
		}

		this.data = res.data
	}

	// 获取礼物兑换的货币类型 ID
	getCurrencyId() {
		return this.data?.currency_id || 3
	}

	// 获取兑换率（百分比）
	getConvertRate() {
		return this.data?.convert_rate || 100
	}

	// 获取货币信息
	getCurrency() {
		return this.data?.currency
	}

	// 获取货币名称
	getCurrencyName() {
		return this.data?.currency?.nickname || '星币'
	}

	// 计算实际兑换金额
	calculateConvertedAmount(giftValue) {
		const rate = this.getConvertRate()
		return Math.floor(giftValue * rate / 100)
	}
}
