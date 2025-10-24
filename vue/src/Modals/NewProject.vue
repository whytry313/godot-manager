<template>
	<div class="modal">
		<div class="content" style="max-width: 400px;">
			<div class="closeModal" @click="$emit('openModal', null)"></div>
			<h4>Create a New Project</h4>
			<hr>
			<p><i class="fas fa-info-circle" style="color: var(--accent);"></i> Version used: {{ selectedProgram.versionTag }} ({{ selectedProgram.tag }})</p>
			<table style="width: 100%;">
				<tbody>
					<tr>
						<td>Folder</td>
						<td>
							<div class="input click" @click="selectFolder" :title="selectedFolder">
								<div class="fas fa-folder icon"></div>
								<div class="container">
									<input type="text" disabled="true" v-model="selectedFolder"/>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Project name</td> <td><div class="input"><input type="text" v-model="projectName"/></div></td>
					</tr>
				</tbody>
			</table>
			<br>
			<template v-if="error">
				<p>{{ error }}</p>
				<br>
			</template>
			<div style="display: flex; justify-content: space-between; gap: 4px;">
				<div class="btn dark" @click="$emit('openModal', '')"><div class="fas fa-times"></div> Cancel</div>
				<div style="display: flex; justify-content: space-between; gap: 4px;">
					<div class="btn" :class="{ disabled: !folderIsEmpty || projectName.length < 1 }" @click="() => { create(false); }"><div class="fas fa-plus"></div> Create</div>
					<div class="btn" :class="{ disabled: !folderIsEmpty }" @click="() => { create(true); }"><div class="fas fa-plus-circle"></div> Create and open</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "FolderModal",
		props: { program: Object, selectedProgram: Object },
		data() { return { modes: [], projectName: "", selectedFolder: "", folderIsEmpty: false, error: null }; },
		mounted() {
			this.projectName = "";
			this.selectedFolder = "";
			this.folderIsEmpty = false;
			this.error = "";
		},
		methods: {
			async selectFolder() {
				const folder = await window._API_.get("/createProjectFolder");
				this.selectedFolder = folder || '';
				window._API_.post("/isEmpty", { folder: this.selectedFolder }).then((res) => {
					this.folderIsEmpty = !! res;
					if (res === null) { this.error = "Error on provided path."; }
					else if (res === false) { this.error = "Folder is not empty"; }
					else {
						this.error = "";
						if (this.projectName === "") { this.projectName = this.selectedFolder.split('/').pop(); }
					}
				})
			},
			async create(open) {
				if (this.selectedFolder !== "" && this.folderIsEmpty && this.projectName.length > 2) {
					const error = await window._API_.post("/createProject", { name: this.projectName, folder: this.selectedFolder, open: open, program: JSON.parse(JSON.stringify(this.selectedProgram)) });
					if (error && error.trim().length > 0) { this.error = error; console.log("Error found:", error); }
					this.$emit("openModal", "");
				} else {
					this.error = "Wrong settings";
				}
			}
		}
	}
</script>