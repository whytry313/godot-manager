<template>
	<div id="pagePanel">
		<LeftPannel  :programs="programs" @openModal="openModal" :selectedVersion="selectedProgram" @changeVersion="selectVersion"/>
		<RightPannel :projects="projects" @openModal="openModal" :selectedVersion="selectedProgram" :nbAssets="nbAssets" @openProjectSpecs="openProjectSpecs"/>
		<transition name="fadetop">
			<div class="modal" v-if="project">
				<div class="content" style="max-width: 400px;">
					<div class="closeModal" @click="() => { project = null; }"></div>
					<h4 style="">Project addons ({{ project.nbPlugins }})</h4>
					<hr>
					<h3 style="margin-bottom: 0;">{{ project.name }}</h3>
					<span class="nowrap" :title="project.path">{{ project.path }}</span>
					<p style="margin-bottom: 0;">&nbsp;</p>
					<p class="addon-entry" :class="{ disabled: !addon.enabled }" v-for="addon in project.addons">
						<b>{{ addon.name }}</b>
						<p style="margin-top: 0; opacity: 0.7;" v-if="addon.description !== ''">{{ addon.description }}</p>
					</p>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
	import LeftPannel  from "./Home/LeftPannel.vue";
	import RightPannel from "./Home/RightPannel.vue";

	export default {
		name: "Home",
		emits: [ "openModal", "updateVar" ],
		components: { LeftPannel, RightPannel },
		props: { projects: Array, programs: Array, selectedProgram: Object, nbAssets: Number },
		data() { return { /**selectedVersion: null,**/ programPath: null, project: null }; },
		mounted() { this.programPath = localStorage.getItem("programPath"); },
		watch: {
			programPath() {
				const selectedVersion = (this.programs || []).filter(e => e.path === this.programPath)[0];
				this.$emit("updateVar", "selectedProgram", selectedVersion);
				localStorage.setItem("programPath", this.programPath);
			}
		},
		methods: {
			 openModal(modalName) { this.$emit("openModal", modalName); },
			 selectVersion(version) { this.programPath = version.path; },
			 async openProjectSpecs(project) {
			 	this.project = await window._API_.get("/projectAddons/"+project.id.replace("#", ""));
			 },
		}
	}
</script>

<style scoped>
	span.nowrap {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		opacity: 0.75;
	}
	.addon-entry {
		border-bottom: 1px solid var(--border-color);
		padding-left: 15px;
		margin: 0;
		padding-top: 15px;
		border-left: 3px solid var(--accent);
	}
	.addon-entry.disabled {
		opacity: 0.5;
	}
</style>