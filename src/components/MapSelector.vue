<template>
	<el-dialog v-model="vis" title="选择地图" width="90%" :show-close="false">
		<div class="map-scroll-container">
			<div class="map-grid">
				<div
					v-for="map in maps"
					:key="map.id"
					class="map-card"
					:class="{
						'current': isCurrentMap(map.id),
						'locked': isLocked(map)
					}"
					@click="handleMapClick(map)"
				>
					<el-image :src="getImageUrl('map', map.nickname)" fit="cover" class="map-image">
						<template #placeholder>
							<div class="flex-cc w-full h-full bg-[#f5f7fa]">
								<ElIcon>
									<Picture/>
								</ElIcon>
							</div>
						</template>
					</el-image>
					<div class="map-info">
						<div class="map-name">{{ map.nickname }}</div>
						<div v-if="map.lv" class="level-requirement">
							等级要求: {{ map.lv }}
						</div>
						<div v-if="isCurrentMap(map.id)" class="current-badge">
							当前地图
						</div>
						<div v-if="isLocked(map)" class="locked-badge">
							等级不足
						</div>
					</div>
				</div>
			</div>
		</div>

		<template #footer>
			<el-button @click="vis = false">关闭</el-button>
		</template>
	</el-dialog>

	<!-- 通用战斗对话框 -->
	<CommonBattleDialog ref="battleDialogRef" />
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElDialog, ElButton, ElIcon, ElImage } from 'element-plus'
import { message } from '@/game/notification-center'
import { Picture } from '@element-plus/icons-vue'
import { getImageUrl } from '@/config/oss'
import CommonBattleDialog from '@/components/common/CommonBattleDialog.vue'

const game = inject('game')
const vis = ref(false)
const maps = ref([])
const playerLevel = ref(1)
const currentMapId = ref(null)
const battleDialogRef = ref(null)

const show = async () => {
	await loadMaps()
	await loadPlayerInfo()
	vis.value = true
}

const loadMaps = async () => {
	const res = await game.game_map.api.getAll()
	if (res.code === 200) {
		maps.value = res.data
	}
}

const loadPlayerInfo = async () => {
	await game.player.update()
	playerLevel.value = game.player.data.lv
	currentMapId.value = game.player.data.map_id
}

const isLocked = (map) => {
	return playerLevel.value < map.lv
}

const isCurrentMap = (mapId) => {
	return currentMapId.value === mapId
}

const handleMapClick = async (map) => {
	if (isLocked(map)) {
		message.error(`需要等级 ${map.lv} 才能进入该地图`)
		return
	}
	if (isCurrentMap(map.id)) {
		message.info('您已经在该地图了')
		return
	}

	// 显示战斗对话框
	await showBattleDialog(map)
}

const showBattleDialog = async (map) => {
	// 获取玩家天梯阵容
	await game.player_ladder_lineup.getLineup()
	const myLineup = game.player_ladder_lineup.data.lineup

	// 生成 NPC 阵容占位符
	const npcLineup = {
		slot1: { nickname: '???', lv: map.lv, weight: 0 },
		slot2: { nickname: '???', lv: map.lv, weight: 0 },
		slot3: { nickname: '???', lv: map.lv, weight: 0 }
	}

	battleDialogRef.value.show({
		title: `地图挑战 - ${map.nickname}`,
		opponentName: `${map.nickname} 守卫`,
		opponentInfo: `等级 ${map.lv}`,
		showLineup: true,
		challengerLineup: myLineup,
		targetLineup: npcLineup,
		battleFunction: async () => {
			return await game.game_map.api.switchMap(map.id)
		},
		onBattleComplete: async (response) => {
			if (response.data.battle_result.winner === 'challenger') {
				message.success('战斗胜利！成功进入新地图')
				await loadPlayerInfo()
				vis.value = false
			}
		}
	})
}

defineExpose({
	show
})
</script>

<style scoped>
.map-scroll-container {
	max-height: 60vh;
	overflow-y: auto;
	overflow-x: hidden;
}

.map-scroll-container::-webkit-scrollbar {
	width: 8px;
}

.map-scroll-container::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 4px;
}

.map-scroll-container::-webkit-scrollbar-thumb {
	background: #888;
	border-radius: 4px;
}

.map-scroll-container::-webkit-scrollbar-thumb:hover {
	background: #555;
}

.map-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 20px;
	padding: 20px;
}

.map-card {
	border: 2px solid #e0e0e0;
	border-radius: 8px;
	padding: 10px;
	cursor: pointer;
	transition: all 0.3s;
}

.map-card:hover:not(.locked) {
	border-color: #409eff;
	transform: translateY(-5px);
	box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.map-card.current {
	border-color: #67c23a;
	background-color: #f0f9ff;
}

.map-card.locked {
	opacity: 0.5;
	cursor: not-allowed;
}

.map-image {
	width: 100%;
	height: 150px;
	border-radius: 4px;
}

.map-info {
	margin-top: 10px;
}

.map-name {
	font-size: 16px;
	font-weight: bold;
	margin-bottom: 5px;
}

.level-requirement {
	font-size: 14px;
	color: #666;
}

.current-badge {
	display: inline-block;
	padding: 2px 8px;
	background-color: #67c23a;
	color: white;
	border-radius: 4px;
	font-size: 12px;
	margin-top: 5px;
}

.locked-badge {
	display: inline-block;
	padding: 2px 8px;
	background-color: #f56c6c;
	color: white;
	border-radius: 4px;
	font-size: 12px;
	margin-top: 5px;
}
</style>
