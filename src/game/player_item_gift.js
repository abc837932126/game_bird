import { request } from './config.js'
import {isDataChanged} from './utils'

class api {
	getAll = () => request('player_item_gift', 'get_all')
}

export default class player_item_gift {
	constructor() {
		this.data = null // 玩家拥有的礼物列表
		this.api = new api()
	}

	async update() {
		const res = await this.api.getAll()
		if (res.code !== 200) return
		if (isDataChanged(this.data, res.data)) {
			this.data = res.data
		}
	}

	// 根据礼物ID获取玩家拥有的该礼物
	get(gift_id) {
		return this.data?.find(item => item.game_item_gift?.id === gift_id)
	}

	// 获取礼物数量
	getCount(gift_id) {
		const item = this.get(gift_id)
		return item?.count || 0
	}
}
