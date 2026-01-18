import { request } from './config.js'
import { getImageUrl } from '@/config/oss'
import {isDataChanged} from './utils'

class api {
	getAll = (params) => request('game_avatar_frame', 'get_all', params)
}

export default class game_avatar_frame {
	constructor() {
		this.api = new api()
		this.data = null // 头像框列表
	}

	// 获取头像框列表
	async update() {
		const response = await this.api.getAll()
		if (response.code === 200) {
			if (isDataChanged(this.data, response.data)) {
				this.data = response.data
			}
		}
		return response
	}

	// 获取头像框PNG图片URL
	getFrameImageUrl(nickname) {
		if (!nickname) return null
		return getImageUrl('avatar', nickname)
	}

	// 获取头像框SVGA动画URL
	getFrameSvgaUrl(nickname) {
		if (!nickname) return null
		return getImageUrl('avatar', nickname, '', '.svga')
	}

	// 根据ID获取头像框信息
	getById(frameId) {
		return this.data.find(frame => frame.id === frameId)
	}
}
