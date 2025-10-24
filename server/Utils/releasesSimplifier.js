module.exports = (dataJSON) => {
	return (dataJSON || []).filter(r => !r.draft && !r.prerelease).map((r) => {
		const release = {
			id: r.id,
			url: r.url,
			html_url: r.html_url,
			tag_name: r.tag_name,
			published_at: r.published_at,
			assets: (r.assets || []).map((a) => {
				const asset = {
					url: a.url,
					name: a.name,
					size: a.size,
					content_type: a.content_type,
					updated_at: a.updated_at,
					browser_download_url: a.browser_download_url,
					uploader: {
						login: a.uploader.login,
						html_url: a.uploader.html_url,
						avatar_url: a.uploader.avatar_url,
					},
				}
				return asset;
			})
		};

		return release;
	});
};