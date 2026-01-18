import { request } from './config'

class api {

	getAll = () => request('player_friend', 'get_all')

	add = (friend_id) => request('player_friend', 'add', { friend_id })

	getPending = () => request('player_friend', 'get_pending')

	accept = (request_id) => request('player_friend', 'accept', { request_id })

	reject = (request_id) => request('player_friend', 'reject', { request_id })

	delete = (friendship_id) => request('player_friend', 'delete', { friendship_id })

}

export default class player_friend {

	constructor() {
		this.data = null;
		this.pendingRequests = [];
		this.pendingCount = 0;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	async updatePending() {
		const res = await this.api.getPending()

		if (res.code !== 200) {
			return;
		}

		this.pendingRequests = res.data.requests;
		this.pendingCount = res.data.count;
	}




}