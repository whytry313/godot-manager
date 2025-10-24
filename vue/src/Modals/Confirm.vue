<template>
	<div class="modal">
		<div class="content" style="max-width: 380px; display: inline-block;">
			<h4>Confirm</h4>
			<div class="message">
				{{ message }}
			</div>
			<br>
			<br>
			<div class="buttons-container">
				<div class="btn" v-for="btn in buttons" @click="() => { $emit('answer', btn); }">{{ btn }}</div>
			</div>
		</div>
	</div>
</template>	

<script>
	export default {
		name: "ConfirmModal",
		props: {
			message: { type: String, required: true },
			buttons: { type: Array, required: true },
		},
	}
</script>

<style scoped>
	.modal { z-index: 100; }
	.buttons-container {
		display: flex;
		gap: 5px;
	}
	.message {
		white-space: pre-wrap;
	}
	.buttons-container .btn {
		flex: 1;
		text-align: center;
	}
	.buttons-container .btn:first-child {
		background-color: #e43030;
		color: #FFF;
	}
</style>