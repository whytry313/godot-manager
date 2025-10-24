<template>
	<div class="gallery">
		<!-- <h4 v-if="tabName">{{ tabName }} ({{ assets.length }})</h4> -->
		<br><br>
		<div class="exts" v-if="assets.length">
			<div class="ext" :class="{ active: activeExt === '' }" @click="() => { activeExt = ''; }">All</div>
			<div class="ext" v-for="(val, ext) in exts" :class="{ active: activeExt === ext }" @click="() => { activeExt = ext; }">{{ ext }} ({{ val }})</div>
		</div>
		<div class="files">
			<table style="width: 100%;">
				<tbody>
					<tr v-for="file in (filtered || assets)">
						<td class="ext">
							<b>{{ file.ext }}</b>
						</td>
						<td class="isPath" :title="file.folder" @click="(e) => { openFolder(e, file.filepath); }">
							<i class="fas fa-folder"></i>
						</td>
						<td class="gallery-file">
							{{ file.name }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
	export default {
		name: "FileDisplayer",
		props: { assets: Array, tabName: String, selectedID: String },
		mounted() { this.getExts(); },
		data() { return { exts: {}, activeExt: '', filtered: null }; },
		methods: {
			openFolder(e, path) {
				if (e.shiftKey) {
					window._API_.post("/openFolder", { filepath: path });
					const event = new KeyboardEvent('keydown', { key: 'a' });
					document.querySelector("BODY").dispatchEvent(event);
				}
			},
			getExts() {
				const exts = {};
				this.assets.forEach((file) => {
					exts[ file.ext ] = (exts[ file.ext ] || 0) + 1;
				});
				this.exts = exts;
				this.filtered = this.activeExt !== '' ?
					[ ...this.assets ].sort((a, b) => a.ext === this.activeExt ? -1 : 0) :
					null;
			}
		},
		watch: {
			activeExt() { this.getExts(); },
			$props: {
				deep: true,
				handler() { this.getExts(); },
			}
		}
	}
</script>

<style>
	.gallery-file {
		width: 100%;
		padding: 9px 12px;
		border-bottom: 1px solid var(--border-color);
	}
	.files {
		border-radius: 4px;
		border: 1px solid var(--border-color);
	}
	.ext { text-align: right; color: var(--accent); padding: 9px 12px; }
	.files .isPath { cursor: pointer; user-select: none; }
	.exts {
		display: flex;
		justify-content: space-between;
		gap: 3px;
		border: 1px solid var(--border-color);
		border-radius: 6px 6px 0px 0px;
		margin-top: 5px;
	}
	.exts .ext { width: 100%; text-align: center; cursor: pointer; }
	.exts .ext:hover { opacity: 0.75; }
	.exts .ext.active { font-weight: bold; }
</style>