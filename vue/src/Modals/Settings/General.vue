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
		<br>
		<hr>
		<br>
		<label>
			Command prefix.<br>
			Eg; To force nVidia GPU use<br>
			<b style="opacity: 0.5;">__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia</b><br>
			<br>
			<div class="text-block">
				<textarea v-model="settings.commandPrefix"></textarea>
			</div>
			<table>
				<tbody>
					<tr v-for="command in commands">
						<td>{{ command[ 0 ] }}</td>
						<td>{{ command[ 1 ] }}</td>
					</tr>
				</tbody>
			</table>
		</label>
	</div>
</template>

<script>
	import LocalStorage from "../../LocalStorage.js";

	export default {
		name: "FolderModal",
		data() {
			return {
				projectsSettings: {},
				commands: [],
				settings: {
					accent: LocalStorage.get("accent") || "#92e312",
					darkMode: !!LocalStorage.get("darkMode"),
					disableTips: !!LocalStorage.get("disableTips"),
					hideProjects: !!LocalStorage.get("hideProjects"),
					commandPrefix: LocalStorage.get("commandPrefix") || "",
				}
			};
		},
		mounted() {
			this.getSettings();
		},
		watch: {
			"settings.accent"()        { LocalStorage.set("accent", this.settings.accent) },
			"settings.darkMode"()      { this.toggleDarkMode(); },
			"settings.hideProjects"()  { this.hideProjects();   },
			"settings.disableTips"()   { LocalStorage.set("disableTips", this.settings.disableTips); },
			"settings.commandPrefix"() {
				LocalStorage.set("commandPrefix", this.settings.commandPrefix);
				this.projectsSettings.commandPrefix = this.settings.commandPrefix;
				this.parseCommand();
			},
		},
		methods: {
			async getSettings() {
				const { projectsSettings } = await window._API_.get("/settings") || {};
				if (projectsSettings && projectsSettings !== this.projectsSettings) {
					this.projectsSettings = projectsSettings || {};
					if (this.projectsSettings.commandPrefix !== this.settings.commandPrefix) {
						this.settings.commandPrefix = this.projectsSettings.commandPrefix;
					}
				}
				this.parseCommand();
			},
			toggleDarkMode() { LocalStorage.set("darkMode", !LocalStorage.get("darkMode")); },
			hideProjects()   { LocalStorage.set("hideProjects", !LocalStorage.get("hideProjects")); },
			parseCommand() {
				const commands = [];
				this.settings.commandPrefix.split(/[\ \t\n]+/).map((argv) => {
					const pairs = argv.split("=").filter(e => e.length);
					if (pairs.length === 2) {
						commands.push(pairs);
					}
				});
				this.commands = commands;
			},
		},
		async unmounted() {
			if (Object.keys(this.projectsSettings).length) {
				const data = JSON.parse(JSON.stringify(this.projectsSettings));
				await window._API_.post("/settings", { projectsSettings: data });
			}
		},
	}
</script>

<style scoped>
	input[type="color"].color-picker { border-radius: 5px; padding: 0; border: 0px solid #DDD; width: 16px; height: 16px; vertical-align: middle; margin: 2px; }
	input[type="color"].color-picker::-moz-color-swatch { border: none; }
	input[type="color"].color-picker::-webkit-color-swatch-wrapper { padding: 0; border-radius: 0; }
	input[type="color"].color-picker::-webkit-color-swatch { border: none; }
	.text-block {
		display: block;
		width: auto;
		padding: 7px;
		border: 1px solid var(--textColor);
		background-color: var(--background);
		color: var(--textColor);
		border-radius: 7px;
	}
	.text-block textarea {
		width: 100%;
		min-height: 50px;
		resize: vertical;
		padding: 0;
		color: var(--textColor);
		background-color: transparent;
		border: none;
		outline: none;
	}
	.text-block:focus-within {
		border: 1px solid var(--accent);
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	table tr td {
		padding: 7px;
		border: 1px solid var(--textColor);
	}
</style>