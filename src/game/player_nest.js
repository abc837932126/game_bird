import {request} from "./config.js";

class api {
	get = (params) => request('player_nest', 'get', params)
	get_friend_nest = (params) => request('player_nest', 'get_friend_nest', params)
	set_bird = (params) => request('player_nest', 'set_bird', params)
	use_nest_item = (params) => request('player_nest', 'use_nest_item', params)
	use_nest_buff = (params) => request('player_nest', 'use_player_item_nest_buff', params)
	start_pairing = (params) => request('player_nest', 'start_pairing', params)
	harvest = (params) => request('player_nest', 'harvest', params)
}

export default class player_nest {
	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.get()

		if (res.code !== 200) {
			return;
		}

		// 首次加载，直接赋值
		if (!this.data) {
			this.data = res.data;
			return;
		}

		// 智能更新：保持对象引用，只更新属性
		Object.assign(this.data, res.data);
	}

	// 设置或移除鸟（slot: 1或2, player_bird_id: 鸟ID或null, nest_owner_id: 可选，操作好友鸟巢时传入好友ID）
	async set_bird(slot, player_bird_id, nest_owner_id = null) {
		const params = { slot, player_bird_id };
		if (nest_owner_id) {
			params.nest_owner_id = nest_owner_id;
		}
		const res = await this.api.set_bird(params);

		// 只有在操作自己的巢穴时才更新 this.data
		if (res.code === 200 && !nest_owner_id) {
			await this.update();
		}

		return res;
	}

	// 使用巢穴道具
	async use_nest_item(player_item_nest_id) {
		const res = await this.api.use_nest_item({player_item_nest_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	// 使用巢穴增益
	async use_nest_buff(buff_id) {
		const res = await this.api.use_nest_buff({buff_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	// 开始配对
	async start_pairing() {
		const res = await this.api.start_pairing()

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	// 收获幼鸟
	async harvest(use_fertility_pill = false) {
		const res = await this.api.harvest({ use_fertility_pill })

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}
}
