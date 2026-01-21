import {reactive} from 'vue'
import { canManageGuild } from '@/utils/guild-position'

import game_config from './game_config.js'
import game_title from "./game_title.js";
import game_map from "./game_map.js";

import game_item_bait from "./game_item_bait.js";
import game_item_common from "./game_item_common.js";
import game_item_trap_buff from "./game_item_trap_buff.js";
import game_item_nest_buff from "./game_item_nest_buff.js";
import game_item_train_buff from "./game_item_train_buff.js";
import game_item_trap from "./game_item_trap.js";
import game_item_bird_exp from "./game_item_bird_exp.js";
import game_item_train from "./game_item_train.js";
import game_item_ring from "./game_item_ring.js";
import game_item_nest from "./game_item_nest.js";
import game_item_gift from "./game_item_gift.js";
import game_avatar_frame from "./game_avatar_frame.js";
import player_item_bait from "./player_item_bait.js";
import player_item_common from "./player_item_common.js";
import player_item_trap_buff from "./player_item_trap_buff.js";
import player_item_nest_buff from "./player_item_nest_buff.js";
import player_item_train_buff from "./player_item_train_buff.js";
import player_item_trap from "./player_item_trap.js";
import player_item_bird_exp from "./player_item_bird_exp.js";
import player_item_train from "./player_item_train.js";
import player_item_ring from "./player_item_ring.js";
import player_item_nest from "./player_item_nest.js";
import player_item_gift from "./player_item_gift.js";
import player from "./player.js";
import player_trap from "./player_trap.js";
import player_train from "./player_train.js";
import player_nest from "./player_nest.js";
import player_bird from "./player_bird.js";
import player_friend from "./player_friend.js";
import player_marriage from "./player_marriage.js";
import game_marriage from "./game_marriage.js";
import player_chat from "./player_chat.js";
import player_gift from "./player_gift.js";
import player_red_packet from "./player_red_packet.js";
import player_avatar_frame from "./player_avatar_frame.js";
import player_ladder_score from "./player_ladder_score.js";
import player_ladder_lineup from "./player_ladder_lineup.js";
import guild from "./guild.js";
import guild_member from "./guild_member.js";
import guild_invite from "./guild_invite.js";
import guild_application from "./guild_application.js";
import team from "./team.js";
import leaderboard from "./leaderboard.js";
import notificationCenter from "./notification-center.js";
import game_bird from "@/game/game_bird.js";
import checkin from "./checkin.js";
import bank from "./bank.js";

class Game {

	constructor() {
		this.token = ""
		this.page = 'page_home'
		this.player = new player();
		this.game_config = new game_config();
		this.game_title = new game_title();
		this.game_map = new game_map();

		this.game_item_bait = new game_item_bait();
		this.game_item_common = new game_item_common();
		this.game_item_trap_buff = new game_item_trap_buff();
		this.game_item_nest_buff = new game_item_nest_buff();
		this.game_item_train_buff = new game_item_train_buff();
		this.game_item_trap = new game_item_trap();
		this.game_item_bird_exp = new game_item_bird_exp();
		this.game_item_train = new game_item_train();
		this.game_item_ring = new game_item_ring();
		this.game_item_nest = new game_item_nest();
		this.game_item_gift = new game_item_gift();
		this.game_avatar_frame = new game_avatar_frame();
		this.game_bird = new game_bird();
		this.player_item_bait = new player_item_bait();
		this.player_item_common = new player_item_common();
		this.player_item_trap_buff = new player_item_trap_buff();
		this.player_item_nest_buff = new player_item_nest_buff();
		this.player_item_train_buff = new player_item_train_buff();
		this.player_item_trap = new player_item_trap();
		this.player_item_bird_exp = new player_item_bird_exp();
		this.player_item_train = new player_item_train();
		this.player_item_ring = new player_item_ring();
		this.player_item_nest = new player_item_nest();
		this.player_item_gift = new player_item_gift();
		this.player_trap = new player_trap();
		this.player_train = new player_train();
		this.player_nest = new player_nest();
		this.player_bird = new player_bird();
		this.player_friend = new player_friend();
		this.player_marriage = new player_marriage();
		this.game_marriage = new game_marriage();
		this.player_chat = new player_chat();
		this.player_gift = new player_gift();
		this.player_red_packet = new player_red_packet();
		this.player_avatar_frame = new player_avatar_frame();
		this.player_ladder_score = new player_ladder_score();
		this.player_ladder_lineup = new player_ladder_lineup();

		// Guild modules
		this.guild = new guild();
		this.guild_member = new guild_member();
		this.guild_invite = new guild_invite();
		this.guild_application = new guild_application();

		// Team module
		this.team = new team();

		// Leaderboard module
		this.leaderboard = new leaderboard();

		// 通知中心
		this.notificationCenter = notificationCenter;

		// 签到模块
		this.checkin = new checkin();

		// 银行模块
		this.bank = new bank();
	}

	/**
	 * 初始化/刷新游戏数据
	 * 在登录和重连时调用
	 */
	async refreshGameData() {
		await game.game_avatar_frame.update()
		await this.player.update()
		await this.player_friend.update()
		await this.game_config.update()
		await this.game_title.update()
		await this.game_map.update()
		await this.game_item_gift.update()
		await this.guild.update()

		// 如果玩家是工会管理员，加载工会申请列表
		if (this.guild.data?.id && canManageGuild(this.guild.data)) {
			await this.guild_application.updateGuildApplications(this.guild.data.id)
		}

		// 加载队伍信息
		await this.team.update()

		// 加载签到信息
		await this.checkin.update()

		// 加载银行信息
		await this.bank.update()
	}


}


/** @type {Game} */
export const game = reactive(new Game())
