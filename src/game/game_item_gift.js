import { request } from './config.js'
import { getImageUrl } from '../config/oss.js'
import {isDataChanged} from './utils'

class api {
	getAll = () => request('game_item_gift', 'get_all')
}

export default class game_item_gift {
	constructor() {
		this.data = null // 礼物配置列表
		this.api = new api()
	}

	async update() {
		const res = await this.api.getAll()
		if (res.code !== 200) return
		if (isDataChanged(this.data, res.data)) {
			this.data = res.data
		}
	}

	// 根据ID获取礼物配置
	get(gift_id) {
		return this.data?.find(gift => gift.id === gift_id)
	}


}
