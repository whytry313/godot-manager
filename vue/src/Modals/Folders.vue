<template>
	<div class="modal">
		<ConfirmModal v-if="deleteElement" :message="`Do you really want to remove this folder?\n${ deleteElement.path }`" :buttons="[ 'Cancel', 'Delete' ]" @answer="onAnswer"/>
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
					<div class="folder" v-for="path in programs">
						<i class="fas fa-trash" @click="() => { onRemoveFolder(path, 'programs'); }"></i> {{ path }}
					</div>
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
					<div class="folder" v-for="path in projects">
						<i class="fas fa-trash" @click="() => { onRemoveFolder(path, 'projects'); }"></i> {{ path }}
					</div>
				</div>
				<div style="display: block; text-align: right;">
					<div class="btn mini" @click="() => { addFolder('projects'); }"><i class="fas fa-plus-circle"></i> Add a folder</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import ConfirmModal from "./Confirm.vue";
	export default {
		name: "FolderModal",
		components: { ConfirmModal },
		data() {
			return {
				projects: [],
				programs: [],
				projectsSettings: {},
				disableAssets: false,
				deleteElement: null,
			};
		},
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
			onRemoveFolder(path, type) {
				this.deleteElement = { path, type };
			},
			async onAnswer(answer) {
				if (answer === "Delete") {
					await window._API_.post("/settings", { [this.deleteElement.type]: this[this.deleteElement.type].filter(e => e !== this.deleteElement.path) });
					await this.getSettings();
				}
				this.deleteElement = null;
			}
		},
		watch: {
			disableAssets() { this.projectsSettings.disableAssets = this.disableAssets; this.updateSettings(); }
		}
	}
</script>