<template>
	<div>
		<label><input type="checkbox" v-model="settings.hideProjects" title="Removes projects from the visible projects list if version doesn't match"> Hide non-compatble projects</label>
		<br>
		<label><input type="checkbox" v-model="settings.darkMode" title="Toggle dark mode for less aggressive background color"> Enable dark mode</label>
		<br>
		<label>
			<input type="color" v-model="settings.accent" class="color-picker">
			Main color
		</label>
		<br>
		<label><input type="checkbox" v-model="settings.disableTips" title="Toggle dark mode for less aggressive background color"> Disable Tips</label>
	</div>
</template>

<script>
	import LocalStorage from "../../LocalStorage.js";

	export default {
		name: "FolderModal",
		data() {
			return {
				settings: {
					accent: LocalStorage.get("accent") || "#92e312",
					darkMode: !!LocalStorage.get("darkMode"),
					disableTips: !!LocalStorage.get("disableTips"),
					hideProjects: !!LocalStorage.get("hideProjects"),
				}
			};
		},
		mounted() {
			this.getSettings();
		},
		watch: {
			"settings.accent"()       { LocalStorage.set("accent", this.settings.accent) },
			"settings.darkMode"()     { this.toggleDarkMode(); },
			"settings.hideProjects"() { this.hideProjects();   },
			"settings.disableTips"()  { LocalStorage.set("disableTips", this.settings.disableTips) },
		},
		methods: {
			async getSettings() {
				const { projects, programs } = await window._API_.get("/settings") || {};
				this.programs = programs || [];
				this.projects = projects || [];
			},
			toggleDarkMode() { LocalStorage.set("darkMode", !LocalStorage.get("darkMode")); },
			hideProjects()   { LocalStorage.set("hideProjects", !LocalStorage.get("hideProjects")); },
		}
	}
</script>

<style scoped>
	input[type="color"].color-picker { border-radius: 5px; padding: 0; border: 0px solid #DDD; width: 16px; height: 16px; vertical-align: middle; margin: 2px; }
	input[type="color"].color-picker::-moz-color-swatch { border: none; }
	input[type="color"].color-picker::-webkit-color-swatch-wrapper { padding: 0; border-radius: 0; }
	input[type="color"].color-picker::-webkit-color-swatch { border: none; }
</style>