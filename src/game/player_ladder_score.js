import {request} from './config'

class api {

	getRank = (data = {}) => request('player_ladder_score', 'get_rank', data)
	challenge = (data) => request('player_ladder_score', 'challenge', data)

}

export default class player_ladder_score {

	constructor() {
		this.data = {
			map_id: null,
			total_count: 0,
			current_player: null,
			rank_list: []
		};
		this.api = new api();
	}

	async getRank(mapId = null, page = null) {
		const requestData = {};
		if (mapId !== null) requestData.map_id = mapId;
		if (page !== null) requestData.page = page;

		const res = await this.api.getRank(requestData);

		if (res.code !== 200) {
			return res;
		}

		// 更新每个属性而不是替换整个对象，保持响应式
		this.data.map_id = res.data.map_id;
		this.data.total_count = res.data.total_count;
		this.data.current_player = res.data.current_player;
		this.data.rank_list = res.data.rank_list;

		return res;
	}

	async challenge(targetPlayerId) {
		const requestData = {
			target_player_id: targetPlayerId
		};

		return await this.api.challenge(requestData);
	}

}
