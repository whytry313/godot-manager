<template>
	<div id="rightPannel" v-if="assets">
		<div class="floatBlock">
			<div class="pad-block">
				<h2>Assets manager</h2>
			</div>
		</div>
		<div class="tabs" style="display: flex;">
			<div
				class="tab"
				:class="{ active: tab === seletedTab }"
				v-for="tab in types"
				@click="() => { seletedTab = tab; }">
					{{ tab }} ({{ getTabFiles(tab) }})
			</div>
		</div>
		<div class="pad-block" v-if="assets">
			<div class="pad-block" v-if="assets">
				<div class="splitter">
					<h3 style="margin-bottom: 0; align-self: center;">Assets: {{ asset.nbAssets }}</h3>
					<div style="align-self: center;">
						<div class="input">
							<div class="fas fa-search"></div>
							<input type="text" v-model="searchText">
						</div>
					</div>
				</div>
				<hr>
				<ImageViewer v-if="selectedAssets && seletedTab === 'images'" :assets="selectedAssets" :tabName="seletedTab" :selectedID="selectedID"/>
				<FilesDiplayer v-if="selectedAssets && seletedTab !== 'images'" :assets="selectedAssets" :tabName="seletedTab" :selectedID="selectedID"/>
			</div>
		</div>
	</div>
</template>

<script>
	import ImageViewer   from "./ImageViewer.vue";
	import FilesDiplayer from "./FilesDiplayer.vue";

	export default {
		name: "RightPanel",
		props: { selectedID: String },
		components: { ImageViewer, FilesDiplayer },
		data() { return { assets: null, searchText: "", asset: null, types: [], seletedTab: "images", selectedAssets: null }; },
		watch: {
			selectedID() { this.fetchAsset(); },
			searchText() { this.reloadAsset(); },
			seletedTab() { this.setTab(); },
		},
		methods: {
			getTabFiles(tab) {
				return (this.asset.files[ tab ].length || 0)+"";
			},
			async fetchAsset() {
				const path = '/projectAssets/' + this.selectedID.replace(/^#/, "");
				this.assets = await window._API_.get(path);
				this.reloadAsset();
			},
			reloadAsset() {
				let res = { files: {}, nbAssets: 0 };
				const text = this.searchText.trim().toLowerCase();
				if (text.length === 0) {
					res = this.assets;
				} else {
					Object.keys(this.assets.files).forEach((key) => {
						res.files[ key ] = []
						this.assets.files[ key ].forEach(e => {
							if (e.name.toLowerCase().indexOf(text) > -1) {
								res.files[ key ].push(e);
							}
						});
						res.nbAssets += res.files[ key ].length;
					});
				}

				this.asset = res;
				this.types = Object.keys(this.asset.files);
				this.setTab();
			},
			setTab() {
				if (!this.seletedTab) { this.selectedAssets = null; return; }
				this.selectedAssets = this.asset.files[ this.seletedTab ];
			}
		}
	};
</script>