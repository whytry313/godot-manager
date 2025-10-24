<template>
	<div class="gallery">
		<div class="splitter">
			<h4 v-if="tabName">{{ tabName }} ({{ assets.length }})</h4>
			<label v-if="pages > 0" style="align-self: center;"> Page {{ parseInt(this.page) + 1 }}
				<input type="range" min="0" :max="pages" v-model="page" style="margin: 0 4px;">
			</label>
		</div>
		<div class="images">
			<div class="image-container isPath" v-for="image in images" :key="image.filepath" @click="(e) => { openFolder(e, image.filepath); }">
				<div class="image">
					<img v-if="fileLimit > image.size" :src="'res://'+ selectedID + ':' + urlEncode(image.res)" :alt="image.filepath">
					<img v-else src="/img/limit.png" :alt="image.filepath">
				</div>
				<p class="image-title">{{ image.name }} ({{ toHuman(image.size) }})</p>
			</div>
		</div>
	</div>
</template>

<script>
	import LocalStorage from "../../LocalStorage.js";
	import human from "../../Utils/humanFileSize.js";
	export default {
		name: "ImageViewer",
		props: {
			assets: Object,
			tabName: String,
			selectedID: String,
		},
		data() {
			return {
				images: [],
				page: 0,
				pages: 0,
				fileLimit: parseInt(LocalStorage.get("maxImageWeight") || 2000) * 1024, 
				nbImages: parseInt(LocalStorage.get("imagesPerPage") || 24),
			};
		},
		mounted() {
			this.getPage();
			this.pages = Math.ceil(this.assets.length / this.nbImages) - 1;
		},
		watch: {
			page() { this.getPage(); },
			$props: {
				deep: true,
				handler() { this.getPage(); }
			}
		},
		methods: {
			toHuman(val) { return human(val); },
			getPage() {
				this.pages = Math.ceil(this.assets.length / this.nbImages) - 1;
				this.images = this.assets.slice(this.page*this.nbImages, (this.page*this.nbImages)+this.nbImages);
			},
			urlEncode(url) { return encodeURI(url); },
			openFolder(e, path) {
				if (e.shiftKey) {
					window._API_.post("/openFolder", { filepath: path });
					const event = new KeyboardEvent('keydown', { key: 'a' });
					document.querySelector("BODY").dispatchEvent(event);
				}
			},
		}
	}
</script>

<style>
	.images {
		display: grid;
		gap: 8px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
		/*grid-template-columns: repeat(6, 1fr);*/
	}
	.image-container {
		overflow: hidden;
		border-radius: 7px;
		background-color: #55555555;
	}

	.image-container .image {
		margin: 3%;
		width: 94%;
		position: relative;
		padding-top: 94%;
		background-color: #55555555;
		display: inline-block;
		vertical-align: top;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: 50% 50%;
		border-radius: 5px;
		overflow: hidden;
	}
	.image-container .image img {
		position: absolute;
		left: 0; top: 0; right: 0; bottom: 0;
		object-fit: contain;
		max-width: 100%;
		max-height: 100%;
	}
	.image-container .image-title {
		margin: 7px 3%;
	}
</style>