<template>
	<div class="modal">
		<div class="content" style="max-width: 480px; min-height: 120px;">
			<div class="closeModal" @click="$emit('openModal', null)"></div>
			<div class="mod-tabs">
				<div class="mod-tab" :class="{ active: tab === 'General' }" @click="() => { tab = 'General'; }">General</div>
				<div class="mod-tab" :class="{ active: tab === 'Assets'  }" @click="() => { tab = 'Assets';  }">Assets</div>
			</div>
			<br>
			<br>
			<General v-if="tab === 'General'"/>
			<Assets  v-if="tab === 'Assets'"/>
		</div>
	</div>
</template>

<script>
	import General from "./Settings/General.vue";
	import Assets  from "./Settings/Assets.vue";

	export default {
		name: "FolderModal",
		data() {
			return {
				tab: "General"
			};
		},
		components: { General, Assets }
	}
</script>

<style>
	.mod-tabs {
		display: flex;
		justify-content: space-between;
		gap: 4px;
		margin-right: 26px;
	}
	.mod-tabs .mod-tab {
		width: 100%;
		cursor: pointer;
		text-align: center;
	}
	.mod-tabs .mod-tab+.mod-tab { border-left: 1px solid var(--textColor); }
	.mod-tabs .mod-tab.active {
		font-weight: bold;
		color: var(--accent);
	}
</style>