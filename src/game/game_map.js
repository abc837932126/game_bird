
import {request} from "./config.js";

class api {

	getAll = () => request('game_map', 'get_all')

	getById = (id) => request('game_map', 'get_by_id', {id})

	getByPos = (pos) => request('game_map', 'get_by_pos', {pos})


}

export default class game_map {

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