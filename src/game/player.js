
import {request} from "./config.js";

class api {

	login = (data) => request('player', 'login', data, false)

	reg = (data) => request('player', 'reg', data, false)

	info = () => request('player', 'info')

	start = () => request('player', 'start')

	search = (query, page = 1) => request('player', 'search', { query, page })

	convert_gift_value = () => request('player', 'convert_gift_value')

	get_player_info = (player_id) => request('player', 'get_player_info', { player_id })

}

export default class player {

	constructor() {
		this.data = null;
		this.api = new api();
	}


	async update() {
		const res = await this.api.info()
		if (res.code !== 200) {
			return;
		}
		this.data = res.data
	}

}