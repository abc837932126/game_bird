import { request } from './config.js'

class api {
	setFrame = (params) => request('player_avatar_frame', 'set_frame', params)
}

export default class player_avatar_frame {
	constructor() {
		this.api = new api()
	}

	// 更换头像框
	async setFrame(frameId) {
		return await this.api.setFrame({ avatar_frame_id: frameId })
	}
}
