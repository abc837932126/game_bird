<template>
	<div class="relative w-full h-full">
		<!-- 背景图片 -->
		<div :style=" {backgroundImage: `url(${getImageUrl('bg' ,'bg')})`}" class="h-full bg-cover absolute inset-0"></div>


		<!-- 内容层 -->
		<div class="relative z-10 w-full h-full">
			<landing v-if="showLanding"/>
			<Game v-else-if="game.token"/>
			<Index v-else/>
		</div>
	</div>


</template>


<script setup>
import {inject, computed, onMounted, onUnmounted} from 'vue'
import Game from './components/Game.vue'
import Index from './components/Index.vue'
import landing from '@/components/landing/index.vue'
import {getImageUrl} from "@/config/oss";
import { registerAllNotifications, unregisterAllNotifications } from '@/game/notification-listeners.js'

const game = inject('game')

// 判断是否需要显示 Index
const showLanding = computed(() => {
	return game.token && !game.player.data?.landing
})


// 设置动态视口高度（兼容不支持dvh的浏览器）
const setViewportHeight = () => {
	const vh = window.innerHeight * 0.01
	document.documentElement.style.setProperty('--vh', `${vh}px`)
}


// 窗口大小变化处理
const handleResize = () => {
	// 更新视口高度
	setViewportHeight()
}

onMounted(() => {
	// 初始化视口高度
	setViewportHeight()

	// 自动隐藏移动端地址栏
	setTimeout(() => {
		window.scrollTo(0, 1)
		setTimeout(() => {
			window.scrollTo(0, 0)
		}, 50)
	}, 100)


	window.addEventListener('resize', handleResize)
	// 监听orientationchange事件（设备旋转）
	window.addEventListener('orientationchange', handleResize)

	// ============ 初始化全局通知系统 ============
	game.notificationCenter.init()
	registerAllNotifications()
	console.log('[App] 通知系统已启动')
})

onUnmounted(() => {

	window.removeEventListener('resize', handleResize)
	window.removeEventListener('orientationchange', handleResize)

	// 清理通知监听器
	unregisterAllNotifications()
})

</script>