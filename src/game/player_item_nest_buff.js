import { request } from './config'
import {isDataChanged} from './utils'

class api {
	getAll = () => request('player_item_nest_buff', 'get_all', {})
}

export default class player_item_nest_buff {
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
}
