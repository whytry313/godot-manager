<template>
	<div id="pagePanel">
		<div id="leftPannel">
			<div class="floatBlock nobg">
				<div class="pad-block" style="position: sticky; top: 0; background-color: var(--background); z-index: 2;">
					<div style="display: flex; gap: 7px">
						<router-link class="btn round textmini" to="/" style="align-self: center;">
							<i class="fas fa-arrow-left"></i>
						</router-link>
						<h4 style="margin: 4px; align-self: center;"><i class="fas fa-download"></i> Downloads ({{ list.length }})</h4>
					</div>
				</div>
				<div class="releases-list">
					<div class="release splitter" v-for="(version, index) in list" @click="() => { setActiveRelease(version); }" :class="{ active: activeRelease && activeRelease.tag_name === version.tag_name }">
						<b>{{ version.tag_name }}</b>
						<span :title="version.published_at">{{ human(version.published_at) }}</span>
					</div>
				</div>
			</div>
		</div>
		<div id="rightPannel">
			<div class="floatBlock">
				<div class="pad-block">
					<div class="splitter">
						<h2>List</h2>
						<div style="gap: 4px; display: flex;">
							<div class="btn round mini ghost" @click="downloadNew">
								<i class="fas fa-refresh"></i>
								Pull from github
							</div>
						</div>
					</div>
				</div>
			</div>
			<div>
				<div class="pad-block">
					<DownloadList v-if="list && activeRelease" :activeRelease="activeRelease"/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import humanize from "../Utils/humanTime.js";
	import DownloadList from "./Download/DownloadList.vue";
	export default {
		name: "Downloads",
		emits: [ "openModal", "updateVar" ],
		components: { DownloadList },
		data() { return { programs: [], list: [], activeRelease: null } },
		mounted() {
			this.getSettings();
			this.getGodotRemotes();
		},
		methods: {
			async getSettings() {
				const { projects, programs } = await window._API_.get("/settings") || {};
				this.programs = programs || [];
			},
			async getGodotRemotes() {
				const remotes = await window._API_.get("/godot-remotes");
				this.list = remotes || [];
			},
			async downloadNew() {
				this.list = [];
				await new Promise(resolve => setTimeout(resolve, 200));
				this.list = await window._API_.get("/godot-remotes/download");
			},
			human(date) { return humanize(date); },
			setActiveRelease(release) {
				const copy = JSON.parse(JSON.stringify(release));
				const categories = {
					"linux":     { label: "Linux/x11",        assets: [], },
					"templates": { label: "Export templates", assets: [], },
					"windows":   { label: "Windows",          assets: [], },
					"macos":     { label: "MacOSX",           assets: [], },
					"android":   { label: "Android",          assets: [], },
					"misc":      { label: "Miscelanious",     assets: [], },
				};
				(copy.assets || []).forEach((asset) => {
					if (asset.name.includes("_win")) { categories.windows.assets.push(asset); }
					else if (asset.name.includes("_linux") || asset.name.includes("_x11")) { categories.linux.assets.push(asset); }
					else if (asset.name.includes("_mac") || asset.name.includes("_osx")) { categories.macos.assets.push(asset); }
					else if (asset.name.includes("_android")) { categories.android.assets.push(asset); }
					else if (asset.name.includes("_export_templates")) { categories.templates.assets.push(asset); }
					else { categories.misc.assets.push(asset); }
				});
				copy.assets = categories;
				this.activeRelease = copy;
			}
		}
	}
</script>

<style scoped>
	.release {
		opacity: 0.7;
		cursor: pointer;
		/*display: block;*/
		border-top: 1px solid var(--border-color);
		padding: 9px 12px;
		transition: opacity 0.2s;
	}
	.release.active {
		color: var(--accent);
	}
	.release:hover {
		opacity: 1;
	}
	.release span {
		opacity: 0.4;
	}
</style>