import {request} from "./config.js";

class api {
	getAll = (params) => request('player_train', 'get_all', params)
	set_bird = (params) => request('player_train', 'set_bird', params)
	use_item = (params) => request('player_train', 'use_item', params)
	use_player_item_train_buff = (params) => request('player_train', 'use_player_item_train_buff', params)
	get_reward = (params) => request('player_train', 'get_reward', params)
	steal_reward = (params) => request('player_train', 'steal_reward', params)
	get_friend_trains = (params) => request('player_train', 'get_friend_trains', params)
	get_stolen_today = (params) => request('player_train', 'get_stolen_today', params)
}

export default class player_train {
	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		// 如果是首次加载，直接赋值
		if (!this.data) {
			this.data = res.data;
			return;
		}

		// 智能更新：只更新变化的训练场，保持数组引用不变
		const newData = res.data;

		// 更新现有训练场或添加新训练场
		newData.forEach(newTrain => {
			const existingIndex = this.data.findIndex(t => t.id === newTrain.id);
			if (existingIndex !== -1) {
				// 更新现有训练场的属性
				Object.assign(this.data[existingIndex], newTrain);
			} else {
				// 添加新训练场
				this.data.push(newTrain);
			}
		});

		// 移除不存在的训练场（从后往前删除，避免索引问题）
		for (let i = this.data.length - 1; i >= 0; i--) {
			if (!newData.some(newTrain => newTrain.id === this.data[i].id)) {
				this.data.splice(i, 1);
			}
		}
	}

	async set_bird(train_id, player_bird_id) {
		const res = await this.api.set_bird({train_id, player_bird_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	async use_item(train_id, player_item_train_id) {
		const res = await this.api.use_item({train_id, player_item_train_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	async get_reward(train_id) {
		const res = await this.api.get_reward({train_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	async use_player_item_train_buff(train_id, item_id) {
		const res = await this.api.use_player_item_train_buff({train_id, item_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}

	async steal_reward(target_id, train_id) {
		const res = await this.api.steal_reward({target_id, train_id})

		if (res.code === 200) {
			await this.update();
		}

		return res;
	}
}
