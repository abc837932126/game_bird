import {request} from './config'

class api {

	getAll = () => request('game_title', 'get_all')

	getById = (id) => request('game_title', 'get_by_id', {id})

}

export default class game_title {

	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	get(id) {
		return this.data?.find(item => item.id === id)
	}

}