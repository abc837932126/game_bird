import { request } from './config'

class api {

	getLineup = (data = {}) => request('player_ladder_lineup', 'get_lineup', data)
	getPlayerLineup = (player_id) => request('player_ladder_lineup', 'get_player_lineup', { player_id })
	setLineup = (data) => request('player_ladder_lineup', 'set_lineup', data)

}

export default class player_ladder_lineup {

	constructor() {
		this.data = {
			lineup: {
				slot1: null,
				slot2: null,
				slot3: null
			}
		};
		this.api = new api();
	}

	async getLineup() {
		const res = await this.api.getLineup();

		if (res.code !== 200) {
			return res;
		}

		// 更新每个位置的数据，保持响应式
		this.data.lineup.slot1 = res.data.lineup.slot1;
		this.data.lineup.slot2 = res.data.lineup.slot2;
		this.data.lineup.slot3 = res.data.lineup.slot3;

		return res;
	}

	async setLineup(slot, playerBirdId) {
		const requestData = {
			slot: slot,
			player_bird_id: playerBirdId
		};

		const res = await this.api.setLineup(requestData);

		if (res.code === 200) {
			// 更新阵容数据
			this.data.lineup.slot1 = res.data.lineup.slot1;
			this.data.lineup.slot2 = res.data.lineup.slot2;
			this.data.lineup.slot3 = res.data.lineup.slot3;
		}

		return res;
	}

}
