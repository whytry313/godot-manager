<template>
	<div>
		<span style="opacity: 0.5;"><i>You can disable <b>assets scanning</b> via Folder Settings (Folder icon)</i></span>
		<br>
		<br>
		<table class="settings-table">
			<tbody>
				<tr>
					<td :title="`Maximum weight of image to show in the assets (avoids showing images bigger than ${ toHuman(imageWeight) })`">Max image weight</td>
					<td><input type="range" min="200" max="10000" step="200" v-model="imageWeight"></td>
					<td>{{ toHuman(imageWeight) }}</td>
				</tr>
				<tr>
					<td title="Amount of images to show by page">Images per page</td>
					<td><input type="range" min="2" max="64" step="2" v-model="perPage"></td>
					<td>{{ perPage }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
	import LocalStorage from "../../LocalStorage.js";
	import human from "../../Utils/humanFileSize.js";
	export default {
		name: "Assets",
		data() {
			return {
				imageWeight: LocalStorage.get("maxImageWeight") || 2000,
				perPage:     LocalStorage.get("imagesPerPage")  || 24,
			};
		},
		methods: {
			toHuman(value) { return human(value * 1024); },
		},
		watch: {
			imageWeight(newVal, oldVal) {
				if (newVal === oldVal) return;
				LocalStorage.set("maxImageWeight", this.imageWeight);
			},
			perPage(newVal, oldVal) {
				if (newVal === oldVal) return;
				LocalStorage.set("imagesPerPage", this.perPage);
			},
		}
	}
</script>

<style>
	.settings-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}
	.settings-table tr td:last-child { width: 60px; }
</style>