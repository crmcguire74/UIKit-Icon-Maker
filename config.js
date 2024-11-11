const config = {
    // Check if we're on Netlify by looking at the hostname
    baseUrl: window.location.hostname === 'iconforge.net' ? 'https://iconforge.net' : '',
    getUrl: function(path) {
        return this.baseUrl + path;
    }
};

if (typeof window !== 'undefined') {
    window.config = config;
}