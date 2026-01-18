// 数据对比工具函数
export function isDataChanged(oldData, newData) {
	if (oldData === null || newData === null) return true;
	return JSON.stringify(oldData) !== JSON.stringify(newData);
}
