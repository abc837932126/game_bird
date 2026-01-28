<template>
	<div class="card">
		<span class=" bg-[#008A5B] rounded-lg mx-2!">"{{ game.player.data?.game_title.nickname }}"</span>
		{{ game.player.data?.nickname }}
		<a class="text-blue-500!" @click="showDetail = !showDetail"> {{ showDetail ? '收起' : '展开' }} </a>
	</div>


	<el-card v-show="showDetail" bodyClass="my-1! py-0!">
		<p class="pt-2! border-b border-dashed border-gray-400">等级: {{ game.player.data?.lv || 1 }}</p>
		<p
			v-for="balance in game.player.data?.player_balance || []"
			:key="balance.balance_id"
			class="pt-2! border-b border-dashed border-gray-400"
		>
			{{ balance.game_config_player_balance?.nickname || '未知' }}: {{ balance.count || 0 }}
		</p>
	</el-card>

</template>

<script setup>

import {inject, ref} from "vue";


const game = inject('game')
const showDetail = ref(false);

</script>
