import { request } from './config.js';

class api {
	get_active = (params) => request('game_config_guild_create', 'get_active', params);
}

export default class game_config_guild_create {
	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.get_active();

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	// 获取创建价格
	get_create_price() {
		return this.data?.create_price || 10000;
	}

	// 获取货币类型ID
	get_balance_id() {
		return this.data?.balance_id || 2;
	}
}
