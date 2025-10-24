<template>
	<div class="modal">
		<div class="content" style="max-width: 600px;">
			<div class="closeModal" @click="$emit('openModal', null)"></div>
			<h4>Folders</h4>
			<hr>
			<label>
				<input type="checkbox" v-model="disableAssets"> Disable <b>Assets scanning</b> to reduce starting time
			</label>
			<hr>
			<div id="programsFolders">
				<h4><i class="fas fa-microchip"></i> Programs locations</h4>
				<div class="list">
					<div class="folder" v-for="path in programs">{{ path }}</div>
				</div>
				<div style="display: block; text-align: right;">
					<div class="btn mini" @click="() => { addFolder('programs'); }"><i class="fas fa-plus-circle"></i> Add a folder</div>
				</div>
			</div>
			<br>
			<hr>
			<br>
			<div id="projectsFolders">
				<h4><i class="fas fa-code-branch"></i> Projects locations</h4>
				<div class="list">
					<div class="folder" v-for="path in projects">{{ path }}</div>
				</div>
				<div style="display: block; text-align: right;">
					<div class="btn mini" @click="() => { addFolder('projects'); }"><i class="fas fa-plus-circle"></i> Add a folder</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "FolderModal",
		data() { return { projects: [], programs: [], projectsSettings: {}, disableAssets: false, }; },
		mounted() {
			this.getSettings();
		},
		methods: {
			async getSettings() {
				const { projects, programs, projectsSettings } = await window._API_.get("/settings") || {};
				this.programs = programs || [];
				this.projects = projects || [];
				this.projectsSettings = projectsSettings || {};
				this.disableAssets = !!this.projectsSettings.disableAssets;
			},
			async addFolder(type) {
				const folder = await window._API_.get("/openFolder");
				if (folder) {
					await window._API_.post("/settings", { [type]: [ ...this[type], folder ] });
					await this.getSettings();
				}
			},
			async updateSettings() {
				await window._API_.post("/settings", { projectsSettings: JSON.parse(JSON.stringify(this.projectsSettings)) });
				await this.getSettings();
			},
		},
		watch: {
			disableAssets() { this.projectsSettings.disableAssets = this.disableAssets; this.updateSettings(); }
		}
	}
</script>