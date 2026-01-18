<template>
	<div class="mb-4 rounded-lg overflow-y-auto">

		<el-image
			:src="getImageUrl('map', game.player.data?.game_map?.nickname)"
			fit="cover"
			class="w-full h-38"
			loading="lazy"
		>
			<template #error>
				<div class="h-38 bg-linear-to-r from-pink-400 via-purple-400 to-red-400
					            flex items-center justify-center">
					<span class="text-8xl">⛪</span>
				</div>
			</template>
		</el-image>
	</div>


	<HomeMap/>
	<HomeTrap/>
	<HomeTrain/>
	<HomeNest/>


</template>

<script setup>
import {inject, onMounted} from 'vue'


import HomeMap from "@/components/home/HomeMap.vue";
import HomeTrap from "@/components/home/HomeTrap.vue";
import HomeTrain from "@/components/home/HomeTrain.vue";
import HomeNest from "@/components/home/HomeNest.vue";
import {getImageUrl} from '@/config/oss'

const game = inject('game')

onMounted(async () => {
	await game.player_trap.update();
	await game.player_train.update();
	await game.player_nest.update();
})
</script>