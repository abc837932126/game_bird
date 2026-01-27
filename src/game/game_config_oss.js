import { request } from './config'
import { OSS_CONFIG } from '../config/oss.js'

class api {
	get_active = () => request('game_config_oss', 'get_active')
}

export default class game_config_oss {
	constructor() {
		this.base_url = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.get_active()

		if (res.code !== 200) {
			return;
		}

		// 直接存储 base_url
		this.base_url = res.data;

		// 同时更新全局 OSS_CONFIG
		if (this.base_url) {
			OSS_CONFIG.BASE_URL = this.base_url;
		}
	}

	get_base_url() {
		return this.base_url;
	}
}
