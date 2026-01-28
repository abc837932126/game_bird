
import { request } from './config'

class api {
	// 获取天梯配置
	get = () => request('game_config_ladder', 'get')
}

export default class game_config_ladder {
	constructor() {
		this.data = null;
		this.api = new api();
	}

	// 更新天梯配置数据
	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	// 获取失败扣除货币类型
	get_failure_penalty_currency() {
		return this.data?.failure_penalty_currency;
	}

	// 获取失败扣除比例
	get_failure_penalty_rate() {
		return this.data?.failure_penalty_rate || 10;
	}

	// 获取货币转移税率
	get_transfer_tax_rate() {
		return this.data?.transfer_tax_rate || 20;
	}

	// 获取所有配置
	get_all() {
		return this.data;
	}
}
