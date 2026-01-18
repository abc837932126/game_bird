
import { request } from './config'
class api{
	getAll = () => request('game_config', 'get_all')

	getByType = (type) => request('game_config', 'get_by_type', { type })

	getByKey = (key) => request('game_config', 'get_by_key', { key })
}



export default class game_config {

	constructor() {
		this.data = null;
		this.api = new api();
	}

	async update() {
		const res = await this.api.getAll()

		if (res.code !== 200) {
			return;
		}

		// 将数组格式转换为嵌套对象格式
		// 从 [{ key: 'balance_type', value: {...}, type: 'game' }]
		// 转换为 { game: { balance_type: {...} } }
		this.data = {}
		res.data.forEach(item => {
			if (!this.data[item.type]) {
				this.data[item.type] = {}
			}
			this.data[item.type][item.key] = item.value
		})
	}

	get_value(type, key) {
		return this.data?.[type]?.[key];
	}
}