<template>

	<el-dialog v-model="vis" class="p-0!" width="90%" :show-close="false" header-class="p-0!">


		<el-image :src="getImageUrl('map', map?.nickname)" fit="cover" loading="lazy">
			<template #placeholder>
				<div class="flex-cc w-full h-full bg-[#f5f7fa]">
					<ElIcon>
						<Picture/>
					</ElIcon>
				</div>
			</template>
		</el-image>

		<div class="flex flex-col p-4! gap-2!">
			<p class="m-0 mb-3 text-base font-medium">{{ map.nickname }}</p>
			<p class="text-gray-500 text-sm mb-2" v-if="map.desc">{{ map.desc }}</p>

			<div class="flex justify-end ">
				<el-button type="primary" @click="vis = false">关闭</el-button>
			</div>
		</div>



	</el-dialog>
</template>


<script setup>

import {ElButton, ElDialog} from "element-plus";
import {ref} from "vue";
import {Picture} from "@element-plus/icons-vue";
import {getImageUrl} from '@/config/oss'

const vis = ref(false)
const map = ref()

const show = (map_data) => {
	map.value = map_data
	vis.value = true
}

defineExpose({
	show
})

</script>


<style scoped>

</style>