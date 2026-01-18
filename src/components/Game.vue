<template>
	<div class="flex flex-col h-screen">
<!--		<TopBar/>-->
		<div class="flex-1 overflow-y-auto m-1! box-border">
			<keep-alive>
				<component :is="currentPage"/>
			</keep-alive>
		</div>
		<NavBar/>
	</div>


</template>


<script setup>
import {inject, computed, markRaw} from 'vue'
import Home from './home/index.vue'
import PlayerInfo from './playerInfo/index.vue'
import Shop from './shop/index.vue'
import PlayerItem from './playerItem/index.vue'
import PlayerBird from './playerbird/index.vue'
import JiaoTang from './jiaotang/index.vue'
import Friend from './friend/index.vue'
import Guild from './guild/index.vue'
import Ladder from './ladder/index.vue'
import Chat from './chat/index.vue'
import Leaderboard from './leaderboard/index.vue'
import Daily from './daily/index.vue'
import Bank from './bank/index.vue'
import Team from './team/index.vue'
import NavBar from './NavBar.vue'

const game = inject('game')

const pages = {
	page_home: markRaw(Home),
	page_daily: markRaw(Daily),
	page_bank: markRaw(Bank),
	page_player_item: markRaw(PlayerItem),
	page_shop: markRaw(Shop),
	page_friend: markRaw(Friend),
	page_guild: markRaw(Guild),
	page_player_info: markRaw(PlayerInfo),
	page_player_bird: markRaw(PlayerBird),
	page_jiaotang: markRaw(JiaoTang),
	page_ladder: markRaw(Ladder),
	page_team: markRaw(Team),
	page_chat: markRaw(Chat),
	page_leaderboard: markRaw(Leaderboard),

}

const currentPage = computed(() => pages[game.page] || pages.home)
</script>