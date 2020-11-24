const app = new Vue({
  el: '#app',
  data: {
    url: '',
    slug: '',
    created: null,
  },
  methods: {
    async createUrl() {
      const response = await fetch('/url', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          url: this.url,
          slug: this.slug
        })
      });
      this.created = await response.json();
      slug = this.created.slug
      url = this.created.url
      console.log(this.created); 
    },

    async copy() {
      this.$refs.text.select();
      document.execCommand('copy')
    }

  }
})