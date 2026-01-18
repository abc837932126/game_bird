<template>
  <div class="h-full flex flex-col p-4">
    <el-card class="h-full overflow-y-auto">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 魅力排行榜 -->
        <el-tab-pane label="魅力榜" name="charm">
          <div v-loading="loading" class="space-y-2">
            <div
              v-for="item in charmLeaderboard"
              :key="item.player_id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              @click="handleViewPlayer(item)"
            >
              <!-- 排名 -->
              <div class="w-10 text-center">
                <span
                  v-if="item.rank <= 3"
                  class="text-2xl"
                >{{ getRankIcon(item.rank) }}</span>
                <span v-else class="text-lg font-bold text-gray-600">{{ item.rank }}</span>
              </div>

              <!-- 头像 -->
              <PlayerAvatar
                :player-id="item.player_id"
                :sex="item.player_sex"
                :avatar-frame-id="item.player_avatar_frame_id"
                :size="50"
              />

              <!-- 信息 -->
              <div class="flex-1">
                <div class="font-bold">{{ item.player_nickname }}</div>
                <div class="text-sm text-gray-500">Lv.{{ item.player_lv }}</div>
              </div>

              <!-- 魅力值 -->
              <div class="text-right">
                <div class="text-lg font-bold text-pink-600">{{ item.total_charm }}</div>
                <div class="text-xs text-gray-500">魅力值</div>
              </div>
            </div>

            <div v-if="!loading && charmLeaderboard.length === 0" class="text-center py-8 text-gray-500">
              暂无数据
            </div>
          </div>
        </el-tab-pane>

        <!-- 养成排行榜 -->
        <el-tab-pane label="养成榜" name="cultivation">
          <div v-loading="loading" class="space-y-2">
            <div
              v-for="item in cultivationLeaderboard"
              :key="item.player_id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              @click="handleViewPlayer(item)"
            >
              <!-- 排名 -->
              <div class="w-10 text-center">
                <span
                  v-if="item.rank <= 3"
                  class="text-2xl"
                >{{ getRankIcon(item.rank) }}</span>
                <span v-else class="text-lg font-bold text-gray-600">{{ item.rank }}</span>
              </div>

              <!-- 头像 -->
              <PlayerAvatar
                :player-id="item.player_id"
                :sex="item.player_sex"
                :avatar-frame-id="item.player_avatar_frame_id"
                :size="50"
              />

              <!-- 信息 -->
              <div class="flex-1">
                <div class="font-bold">{{ item.player_nickname }}</div>
                <div class="text-sm text-gray-500">Lv.{{ item.player_lv }}</div>
                <div class="text-sm text-blue-600">{{ item.bird_name }}</div>
              </div>

              <!-- 重量 -->
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">{{ item.bird_weight.toFixed(2) }}kg</div>
                <div class="text-xs text-gray-500">最重鸟</div>
              </div>
            </div>

            <div v-if="!loading && cultivationLeaderboard.length === 0" class="text-center py-8 text-gray-500">
              暂无数据
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 用户详情对话框 -->
    <UserDetailDialog ref="userDetailDialogRef" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onActivated } from 'vue'
import PlayerAvatar from '../common/PlayerAvatar.vue'
import UserDetailDialog from '../UserDetailDialog/index.vue'

const game = inject('game')
const activeTab = ref('charm')
const loading = ref(false)
const charmLeaderboard = ref([])
const cultivationLeaderboard = ref([])
const userDetailDialogRef = ref(null)

// 获取排名图标
const getRankIcon = (rank) => {
  const icons = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return icons[rank] || rank
}

// 加载魅力排行榜
const loadCharmLeaderboard = async () => {
  loading.value = true
  try {
    const res = await game.leaderboard.api.get_charm_leaderboard({ limit: 100 })
    if (res.code === 200) {
      charmLeaderboard.value = res.data
    }
  } catch (error) {
    console.error('加载魅力排行榜失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载养成排行榜
const loadCultivationLeaderboard = async () => {
  loading.value = true
  try {
    const res = await game.leaderboard.api.get_cultivation_leaderboard({ limit: 100 })
    if (res.code === 200) {
      cultivationLeaderboard.value = res.data
    }
  } catch (error) {
    console.error('加载养成排行榜失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换标签页
const handleTabChange = (tab) => {
  if (tab === 'charm' && charmLeaderboard.value.length === 0) {
    loadCharmLeaderboard()
  } else if (tab === 'cultivation' && cultivationLeaderboard.value.length === 0) {
    loadCultivationLeaderboard()
  }
}

// 查看玩家详情
const handleViewPlayer = (item) => {
  userDetailDialogRef.value?.open({
    id: item.player_id,
    player_id: item.player_id,
    nickname: item.player_nickname,
    lv: item.player_lv,
    sex: item.player_sex,
    avatar_frame_id: item.player_avatar_frame_id
  })
}

// 页面加载时加载默认排行榜
onMounted(() => {
  loadCharmLeaderboard()
})

// 每次页面激活时刷新数据
onActivated(() => {
  if (activeTab.value === 'charm') {
    loadCharmLeaderboard()
  } else if (activeTab.value === 'cultivation') {
    loadCultivationLeaderboard()
  }
})
</script>
