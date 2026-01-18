<template>
	
	<div class="card">
		【  <a class="text-blue-500!" @click="MapInfoRef?.show(game.player.data?.game_map)"> {{ game.player.data?.game_map.nickname || '未知地图' }}</a>】
	</div>
	
	<MapInfo ref="MapInfoRef" />
</template>


<script setup>
import {inject, ref} from "vue";

import MapInfo from "@/components/map/MapInfo.vue";

const game = inject('game')
const MapInfoRef = ref(null)


</script>

<style scoped>

</style>