<template>
	<div class="card">
		<span class=" bg-[#008A5B] rounded-lg mx-2!">"{{ game.player.data?.game_title.nickname }}"</span>
		{{ game.player.data?.nickname }}
		<a class="text-blue-500!" @click="showDetail = !showDetail"> {{ showDetail ? '收起' : '展开' }} </a>
	</div>
	
	
	<el-card v-show="showDetail" bodyClass="my-1! py-0!">
		<p class="pt-2! border-b border-dashed border-gray-400">等级: {{ game.player.data?.lv || 1 }}</p>
		<p class="pt-2! border-b border-dashed border-gray-400">
			{{ getPriceType('balance_1') }}: {{ game.player.data?.balance_1 || 0 }}
			{{ getPriceType('balance_2') }}: {{ game.player.data?.balance_2 || 0 }}
		</p>
		
		<p class="pt-2! border-b border-dashed border-gray-400">{{ getPriceType('balance_3') }}: {{ game.player.data?.balance_3 || 0 }}</p>
	</el-card>
	
</template>

<script setup>

import {inject, ref} from "vue";


const game = inject('game')
const showDetail = ref(false);


const getPriceType = (key) => {
	const num = parseInt(key.replace('balance_', ''))
	const config = game.game_config.get_value('game','balance_type');
	return config?.[num];
}

</script>