const app = new VTTCue({
  el: '#app',
  data: {
    url: '',
    slug: '',
    created: null,
  },
  methods: {
    createUrl() {
      console.log(this.url, this.slug)
    }
  }
})