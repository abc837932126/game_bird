import {request} from './config'
import {isDataChanged} from './utils'

class api {

	getAll = () => request('player_item_trap_buff', 'get_all')
	use = (params) => request('player_item_trap_buff', 'use' , params)

}

export default class player_item_trap_buff {

	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		if (isDataChanged(this.data, res.data)) {
			this.data = res.data;
		}
	}

	use(item_id , count) {
		return this.api.use({ item_id , count})
	}

	getById(id) {
		if (!this.data) return null;
		return this.data.find(item => item.id === id);
	}

}
