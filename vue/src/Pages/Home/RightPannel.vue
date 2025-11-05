<template>
	<div id="rightPannel" ref="list">
		<div class="floatBlock">
			<div class="pad-block">
				<div class="splitter">
					<h4><i class="fas fa-code-branch"></i> Projects</h4>
					<div class="buttons">
						<router-link v-if="nbAssets" to="/assets" class="btn mini round ghost">
							<i class="fas fa-archive"></i> Assets ({{ nbAssets }})
						</router-link>
						<div class="menu-button" title="Refresh folders (Ctrl+r / F5)" @click="reloadRefresh">
							<i class="fas fa-refresh"></i>
						</div>
						<div class="menu-button" title="Create new project" v-if="selectedVersion" @click="() => { openModal('newproject');  }">
							<i class="fas fa-plus"></i></div>
						<div class="menu-button" title="Folders settings" @click="() => { openModal('folders');  }">
							<i class="fas fa-folder"></i>
						</div>
						<div class="menu-button" title="Settings" @click="() => { openModal('settings'); }">
							<i class="fas fa-cog"></i>
						</div>
						<div class="menu-button" title="Toggle dark mode" @click="toggleDarkMode">
							<i class="fas fa-eye"></i>
						</div>
					</div>
				</div>
			</div>
			<hr>
			<p style="padding: 0 12px" v-if="selectedVersion">
				<b style="color: var(--accent);">{{ selectedVersion.versionTag }}</b>
				&nbsp;
				<span style="font-size: 0.9em; opacity: 0.5;">
					<i class="fas fa-folder"></i> {{ selectedVersion.path }}
				</span>
			</p>
		</div>
		<div id="projectsList">
			<Project v-if="projects.length" v-for="project in sortProjects(projects)"
				:project="project"
				:selectedVersion="selectedVersion"
				:classes="{ disabled: !(selectedVersion && selectedVersion.versionTag === project.version) }"
				@click="(e) => { openProject(e, project); }"
				@showProjectAddons="(project) => { $emit('openProjectSpecs', project); }"
				@openInTerminal="(e) => { openProject(e, project, true); }"/>
			<div v-if="!projects.length">
				<div style="display: block; margin: 15% auto; text-align: center;">
					No projects found
					<br/>
					<br/>
					<div class="btn" @click="() => { openModal('folders');  }"><i class="fas fa-folder"></i> Add folders</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import LocalStorage from "../../LocalStorage.js";
	import Project from "./Project.vue";
	export default {
		name: "RightPannel",
		components: { Project },
		props: { projects: Array, selectedVersion: Object, nbAssets: Number },
		methods: {
			openModal(modal) {
				this.$emit("openModal", modal);
			},

			async reloadRefresh() {
				await window._API_.get("/scan");
				window.location.reload();
			},

			sortProjects() {
				if (!this.selectedVersion || !this.selectedVersion.versionTag) return this.projects;
				const tag = this.selectedVersion.versionTag;
				if (this.$refs.list) {
					this.$refs.list.scrollTo({ top: 0, behavior: "smooth" });
				}
				return [ ...this.projects ]
					.sort((a, b) => a.int_v > b.int_v ? -1 : 0)
					.sort((a, b) => a.main_v === this.selectedVersion.version ? -1 : 0)
					.sort((a, b) => a.version === tag ? -1 : 0)
					.map((project) => {
						project.isUpgradable = false;
						const isSameVersion = this.selectedVersion.version === project.main_v;
						const versionIsMoreRecent = this.selectedVersion.int_v > project.int_v;
						project.isUpgradable = isSameVersion && versionIsMoreRecent;
						return project;
					});
			},

			openProject(e, project, inTerminal = false) {
				if (e.shiftKey && !inTerminal) { return this.onProgramFolder(project); }
				if (!this.selectedVersion) return;
				const isSameVersion = this.selectedVersion && this.selectedVersion.versionTag === project.version;
				if (isSameVersion || e.target.classList.contains("openAnyway")) {
					window._API_.post('/openProject', {
						project: project.id,
						program: this.selectedVersion.id,
						inTerminal: inTerminal
					});
				}
			},

			toggleDarkMode() {
				LocalStorage.set("darkMode", !LocalStorage.get("darkMode"));
			},

			async onProgramFolder(program) {
				window._API_.post("/openFolder", { filepath: program.project });
			},
		},
	}
</script>

<style scoped>
	.buttons {
		font-size: 0;
	}
	.menu-button {
		--button-size: 42px;
		display: inline-block;
		width:  var(--button-size);
		height:  var(--button-size);
		border-radius: 50%;
		font-size: 18px;
		text-align: center;
		color: #878787;
		cursor: pointer;
		line-height: var(--button-size);
		background-color: rgba(0,0,0,0.1);
		transform: scale(0.9);
		transition: all 0.2s;
	}
	.menu-button .fas {
		padding-top: 12px;
	}
	.menu-button:hover {
		color: #FFF;
		transform: scale(1);
		background-color: var(--accent);
	}
	.menu-button:active {
		transform: scale(0.75);
	}
</style>