<template>
  <div class="flex flex-col h-full">
    <el-card body-class="flex items-center justify-between gap-4">
      <!-- 左侧：重置时间和按钮 -->
      <div class="flex flex-col gap-2">

        <el-button
            type="primary"
            size="default"
            @click="lineupDialogRef?.show()"
        >
          ⚔️ 阵容管理
        </el-button>
      </div>
      <div class="flex  gap-2">
        <el-button
            size="small"
            :type="viewMode === 'around' ? 'primary' : 'default'"
            @click="switchViewMode('around')"
        >
          周围
        </el-button>
        <el-button
            size="small"
            :type="viewMode === 'browse' ? 'primary' : 'default'"
            @click="switchViewMode('browse')"
        >
          浏览
        </el-button>
      </div>

      <div class="flex flex-col gap-2">
        <el-select v-model="selectedMapId" placeholder="请选择地图" size="small" style="width: 100px" @change="() => loadRankList()"  :teleported="true" >
          <el-option v-for="map in game.game_map.data" :key="map.id" :label="map.nickname" :value="map.id"  >
            <span>{{ map.emoji ? map.emoji + ' ' : '' }}{{ map.nickname }}</span>
          </el-option>
        </el-select>
      </div>

    </el-card>

    <!-- 排行榜列表 -->
    <el-card class="flex-1 overflow-auto" :body-style="{ padding: '12px' }">
      <div v-if="loading" class="text-center py-8">
        <el-icon class="is-loading" size="32">
          <Loading/>
        </el-icon>
        <p class="text-gray-500 mt-2">加载中...</p>
      </div>

      <div v-else-if="rankList.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-gray-500">暂无排行数据</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
            v-for="player in rankList"
            :key="player.player_id"
            :class="[
						'transition-all cursor-pointer hover:bg-gray-50 p-1!',
						getRankCardClass(player.rank),
						player.is_current_player ? 'ring-2 ring-purple-500 ring-inset' : ''
					]"
            @click="openBattleDialog(player)"
        >
          <div class="flex items-center gap-4">
            <!-- 排名图标 -->
            <div class="text-3xl font-bold w-12 text-center" :class="getRankTextClass(player.rank)">
              {{ getRankIcon(player.rank) }}
            </div>

            <!-- 玩家头像 -->
            <PlayerAvatar
                :player-id="player.player_id"
                :sex="player.sex"
                :avatar-frame-id="player.avatar_frame_id"
                :size="56"
            />

            <!-- 玩家信息 -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg">{{ player.nickname }}</span>
                <span v-if="player.is_current_player"
                      class="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">我</span>
              </div>
              <div class="text-sm text-gray-600">Lv.{{ player.lv }} · {{ player.title }}</div>
            </div>

            <!-- 分数 -->
            <div class="text-right">
              <div class="text-xl font-bold text-orange-500">{{ player.score }}</div>
              <div class="text-xs text-gray-500">天梯分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 翻页控制 -->
      <div v-if="viewMode === 'browse' && pagination.total_pages > 1" class="mt-4 flex justify-center">
        <el-pagination
            v-model:current-page="currentPage"
            background
            :page-size="pagination.page_size"
            :total="totalCount"
            layout="prev, pager, next, jumper"
            @current-change="goToPage"
            small
        />
      </div>
    </el-card>

    <!-- 阵容管理对话框 -->
    <LineupDialog ref="lineupDialogRef"/>

    <!-- 对战界面对话框 -->
    <CommonBattleDialog ref="battleDialogRef"/>
  </div>
</template>

<script setup>
import {ref, inject, onMounted, computed} from 'vue'
import { message } from '@/game/notification-center'
import {Loading} from '@element-plus/icons-vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'
import LineupDialog from './LineupDialog.vue'
import CommonBattleDialog from '../common/CommonBattleDialog.vue'

const game = inject('game')

const loading = ref(false)
const selectedMapId = ref(null)
const lineupDialogRef = ref(null)
const battleDialogRef = ref(null)

// 分页相关状态
const viewMode = ref('around') // 'around' 或 'browse'
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  page_size: 11,
  has_prev: false,
  has_next: false
})

const rankList = computed(() => game.player_ladder_score.data.rank_list || [])
const totalCount = computed(() => game.player_ladder_score.data.total_count || 0)


// 获取排名图标
const getRankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

// 获取排名卡片样式
const getRankCardClass = (rank) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100'
  if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100'
  if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100'
  return 'bg-white'
}

// 获取排名文字样式
const getRankTextClass = (rank) => {
  if (rank <= 3) return 'text-3xl'
  return 'text-gray-600'
}

// 切换视图模式
const switchViewMode = (mode) => {
  viewMode.value = mode
  currentPage.value = 1
  loadRankList()
}

// 跳转到指定页
const goToPage = (page) => {
  currentPage.value = page
  loadRankList()
}

// 加载排行榜
const loadRankList = async () => {
  loading.value = true
  try {
    const page = viewMode.value === 'browse' ? currentPage.value : null
    const res = await game.player_ladder_score.getRank(selectedMapId.value, page)

    if (res.code !== 200) {
      message.error(res.msg || '加载排行榜失败')
    } else if (res.data.pagination) {
      // 更新分页信息
      pagination.value = res.data.pagination
    }
  } catch (error) {
    message.error('网络错误')
    console.error('加载排行榜失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开对战界面
const openBattleDialog = async (player) => {
  if (player.is_current_player) {
    message.warning('不能挑战自己')
    return
  }
  if (!player.lineup) {
    message.warning('该玩家尚未设置阵容')
    return
  }

  // 获取玩家天梯阵容
  await game.player_ladder_lineup.getLineup()
  const myLineup = game.player_ladder_lineup.data.lineup

  battleDialogRef.value?.show({
    title: '天梯对战',
    opponentName: player.nickname,
    opponentInfo: `⭐${player.score}`,
    showLineup: true,
    challengerLineup: myLineup,
    targetLineup: player.lineup,
    battleFunction: async () => {
      return await game.player_ladder_score.challenge(player.player_id)
    },
    onBattleComplete: async (response) => {
      await game.player.update()
      await game.player_ladder_score.getRank(selectedMapId.value)

      // 更新对手分数
      const updatedOpponent = game.player_ladder_score.data.rank_list?.find(
        p => p.player_id === player.player_id
      )
      if (updatedOpponent) {
        player.score = updatedOpponent.score
      }
    }
  })
}

// 页面加载时初始化
onMounted(async () => {
  // 使用玩家当前地图
  selectedMapId.value = game.player.data.map_id
  await loadRankList()
})
</script>

<style scoped>
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
