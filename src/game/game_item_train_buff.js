import {request} from './config'
import {isDataChanged} from './utils'

class api {

	getAll = () => request('game_item_train_buff', 'get_all')
	buy = (params) => request('game_item_train_buff', 'buy' , params)

}

export default class game_item_train_buff {

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

	buy(item_id , count) {
		return this.api.buy({ item_id , count})
	}

	getById(id) {
		if (!this.data) return null;
		return this.data.find(item => item.id === id);
	}

}
