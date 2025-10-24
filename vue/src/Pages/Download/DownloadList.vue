<template>
	<div class="details">
		<div class="splitter">
			<h3>Downloads availible for Godot {{ activeRelease.tag_name }}</h3>
			<div @click="() => { openLink(activeRelease.html_url); }" class="btn mini round">Open in browser</div>
		</div>
		<div class="downloads">
			<div class="downloads-list" v-for="(category, key) in activeRelease.assets">
				<h3 style="margin-bottom: 0;">{{ category.label }}</h3>
				<div class="files">
					<div class="download splitter" v-for="asset in category.assets">
						<span><i class="fas fa-file"></i> {{ asset.name }}</span>
						<div class="splitter">
							<div @click="() => { openLink(asset.browser_download_url); }"><i class="fas fa-globe"></i></div>
							<span style="align-self: center;">{{ humansize(asset.size) }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import humansize from "../../Utils/humanFileSize.js";
	export default {
		name: "DownloadList",
		props: { activeRelease: Object },
		methods: {
			humansize(date) { return humansize(date); },
			async openLink(link) { await window._API_.post("/openLink", { url: link }); },
		}
	}
</script>

<style scoped>
	.downloads-list {
		margin-bottom: 25px;
	}
	.downloads-list .files {
		display: block;
		margin-top: 5px;
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid var(--border-color);
	}
	.downloads-list .download {
		padding: 7px 12px;
		border-bottom: 1px solid var(--border-color);
	}
	.downloads-list .download:hover {
		background-color: var(--accent);
	}
	.downloads-list .download:hover, .downloads-list .download:hover .fas { color: var(--background) !important; }
	.files .download .fas.fa-file { color: var(--accent); }
	.files .download .fas.fa-globe { color: var(--accent); }
	.files .download .btn.mini { padding: 4px 2px 4px 6px; text-align: center; margin-right: 5px; font-size: 12px; min-width: 0px; }
</style>