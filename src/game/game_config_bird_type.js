import { request } from './config'

class api {
	// 获取所有鸟类型配置
	get_all = () => request('game_config_bird_type', 'get_all')
}

export default class game_config_bird_type {
	constructor() {
		this.data = [];
		this.api = new api();
	}

	// 更新鸟类型配置数据
	async update() {
		const res = await this.api.get_all()

		if (res.code !== 200) {
			return;
		}

		this.data = res.data;
	}

	// 根据ID获取类型
	get_type_by_id(typeId) {
		return this.data.find(t => t.id === typeId);
	}

	// 获取类型名称
	get_type_name(typeId) {
		const type = this.get_type_by_id(typeId);
		return type?.nickname || '未知';
	}

	// 获取克制的类型列表
	get_counters(typeId) {
		const type = this.get_type_by_id(typeId);
		return type?.counters?.map(c => c.counter_type) || [];
	}

	// 检查是否克制某个类型
	is_counter(attackerTypeId, defenderTypeId) {
		const type = this.get_type_by_id(attackerTypeId);
		return type?.counters?.some(c => c.counter_type_id === defenderTypeId) || false;
	}

	// 获取所有类型
	get_all() {
		return this.data;
	}
}
