<template>
	<div id="pagePanel">
		<LeftPanel :projects="projects" @updateID="(id) => { selectedID = id; }"/>
		<RightPanel :selectedID="selectedID"/>
	</div>
</template>

<script>
	import LeftPanel     from "./Assets/LeftPanel.vue";
	import RightPanel    from "./Assets/RightPanel.vue";

	export default {
		name: "AssetsPage",
		emits: [ "openModal", "updateVar" ],
		props: { projects: Array },
		data() { return { selectedID: null }; },
		components: { LeftPanel, RightPanel },
	}
</script>

<style>
	.tabs {
		border-bottom: 1px solid var(--border-color);
	}
	.tabs .tab {
		cursor: pointer;
		background-color: transparent;
		padding: 9px 0;
		width: 100%;
		text-align: center;
		transition: all 0.2s;
	}
	.tabs .tab:hover, .tabs .tab.active {
		background-color: var(--accent);
		color: var(--background);
	}
</style>