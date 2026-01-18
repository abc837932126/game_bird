import { request } from './config'
import {isDataChanged} from './utils'

class api {
	getAll = () => request('game_item_nest_buff', 'get_all', {})
	buy = (item_id, count) => request('game_item_nest_buff', 'buy', { item_id, count })
}

export default class game_item_nest_buff {
	constructor() {
		this.data = []
		this.api = new api()
	}

	async update() {
		const res = await this.api.getAll()
		if (res.code === 200) {
			if (isDataChanged(this.data, res.data || [])) {
				this.data = res.data || []
			}
		}
	}

	buy(item_id, count) {
		return this.api.buy(item_id, count)
	}

	getById(id) {
		return this.data.find(item => item.id === id)
	}
}
