
import * as Vue from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import getBase64FromBlob from './utils/getBase64FromBlob.js';

const ImageInput = {
  props: {
    id: String,
    modelValue: String,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      preview: ""
    }
  },
  watch: {
    // whenever question changes, this function will run
    modelValue(newValue, oldValue) {
      this.preview = newValue || null;
    }
  },
  methods: {
    selectFileButtonClick() {
      this.$refs.input.click();
    },
    updateImage(event) {
      /**
       * @type {HTMLInputElement}
       */
      const input = event.target;
      const file = input.files[0];
      if (!file) {
        this.preview = null;
        this.$emit('update:modelValue', null);
        return;
      }

      getBase64FromBlob(file).then(result => {
        this.preview = result;
        this.$emit('update:modelValue', result);
      });
    }
  },
  template: `
    <div :class="['w-full p-1 outline outline-2 hover:outline-4 outline-violet-400 outline-violet-300 dark:outline-violet-900 hover:dark:outline-violet-800 rounded-md flex items-center', $attrs['class']]" @click="selectFileButtonClick">
      <img v-if="preview" :src="preview" class="w-8 h-8 m-1 mr-2 inline" alt="App Color Image">
      {{ preview ? 'Click to change' : 'Select File' }}
      <input ref="input" :id="id" name="image" type="file" @change="updateImage($event)" class="hidden w-full p-1 bg-zinc-200 dark:bg-zinc-900 focus:ring-1 focus:ring-violet-900">
    </div>
  `
}

let app = Vue.createApp({
  components: {
    ['image-input']: ImageInput,
  },
  mounted() {
    fetch("/assets/color.png").then(r => r.blob()).then(getBase64FromBlob).then(data => this.colorIcon = data);
    fetch("/assets/outline.png").then(r => r.blob()).then(getBase64FromBlob).then(data => this.outlineIcon = data);
  },
  data() {
    return {
      id: crypto.randomUUID(),
      description: '',
      fullDescription: '',
      name: '',
      fullName: '',
      url: '',
      colorIcon: '',
      outlineIcon: '',
    }
  },
  methods: {
    create() {
      const zip = new JSZip();

      zip.file("manifest.json", JSON.stringify(this.manifest));
      zip.file("color.png", this.colorIcon.replace(/^data:.+;base64,/, ''), { base64: true });
      zip.file("outline.png", this.outlineIcon.replace(/^data:.+;base64,/, ''), { base64: true });

      zip.generateAsync({ type: "base64" }).then(function (content) {
        location.href = "data:application/zip;base64," + content;
      });
    }
  },
  computed: {
    manifest() {
      return {
        "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.16/MicrosoftTeams.schema.json",
        "version": "1.0.0",
        "manifestVersion": "1.16",
        "id": this.id,
        "packageName": "com.zivieri.leonardo.link",
        "name": { "short": this.name, "full": this.fullName || this.name },
        "developer": {
          "name": "Leonardo Zivieri",
          "mpnId": "",
          "websiteUrl": "https://rawcdn.githack.com/LeonardoZivieri/MicrosoftTeamsSimpleTabRedirect/main/build.html",
          "privacyUrl": "https://rawcdn.githack.com/LeonardoZivieri/MicrosoftTeamsSimpleTabRedirect/main/privacy.html",
          "termsOfUseUrl": "https://rawcdn.githack.com/LeonardoZivieri/MicrosoftTeamsSimpleTabRedirect/main/termsofuse.html"
        },
        "description": { "short": this.description, "full": this.fullDescription || this.description },
        "icons": { "outline": "outline.png", "color": "color.png" },
        "accentColor": "#FFFFFF",
        "staticTabs": [
          {
            "entityId": "ebc288fb-3745-4c0f-9caa-44d2841000c0",
            "name": `${this.name} - Link`,
            "contentUrl": `https://rawcdn.githack.com/FunctionOneCorporate/MicrosoftTeamsSimpleTabRedirect/main/index.html?url=${encodeURIComponent(this.url)}`,
            "scopes": ["personal"]
          },
          { "entityId": "about", "scopes": ["personal"] }
        ],
        "validDomains": ["rawcdn.githack.com"],
        "isFullScreen": true
      }      
    }
  }
})

app.mount('#app');
