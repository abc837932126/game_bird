import {request} from './config'

class api {

	getAll = () => request('game_bird', 'get_all')

}

export default class game_bird {

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

}