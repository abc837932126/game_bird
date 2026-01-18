import {request} from './config'
import {isDataChanged} from './utils'

class api {

	getAll = () => request('player_item_train_buff', 'get_all')

}

export default class player_item_train_buff {

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

	getById(id) {
		if (!this.data) return null;
		return this.data.find(item => item.id === id);
	}

}
