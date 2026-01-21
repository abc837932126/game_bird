import { request } from './config'

class api {

	getAll = () => request('player_bird', 'get_all')

	usePlayerItemBirdExp = (data) => request('player_bird', 'use_player_item_bird_exp', data)

	sell = (player_bird_id) => request('player_bird', 'sell', { player_bird_id })

	toggleLock = (player_bird_id) => request('player_bird', 'toggle_lock', { player_bird_id })

	sellAll = () => request('player_bird', 'sell_all')

	reincarnate = (player_bird_id) => request('player_bird', 'reincarnate', { player_bird_id })

	useGrowthPotion = (player_bird_id) => request('player_bird', 'use_growth_potion', { player_bird_id })

	useStabilizer = (player_bird_id) => request('player_bird', 'use_stabilizer', { player_bird_id })

}


export default class player_bird {

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

	// 使用经验卡
	async useExpCard(player_bird_id, game_item_bird_exp_id, count = 1) {
		const requestData = {
			player_bird_id,
			game_item_bird_exp_id,
			count
		};

		const res = await this.api.usePlayerItemBirdExp(requestData);

		if (res.code === 200) {
			// 更新鸟的数据
			await this.update();
		}

		return res;
	}

	// 出售鸟
	async sell(player_bird_id) {
		const res = await this.api.sell(player_bird_id);

		if (res.code === 200) {
			// 更新鸟的数据
			await this.update();
		}

		return res;
	}

	// 转生
	async reincarnate(player_bird_id) {
		const res = await this.api.reincarnate(player_bird_id);

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	// 使用成长药水
	async useGrowthPotion(player_bird_id) {
		const res = await this.api.useGrowthPotion(player_bird_id);

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	async useStabilizer(player_bird_id) {
		const res = await this.api.useStabilizer(player_bird_id);

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

}