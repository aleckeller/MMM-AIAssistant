Module.register("MMM-AIAssistant", {

  defaults: {
    exampleContent: ""
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["template.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.templateContent = this.config.exampleContent
  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data`returned by the node helper.
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "SPEECH_TO_TEXT_RESULT") {
      this.templateContent = payload.text
      this.updateDom()
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = `${this.templateContent}`

    return wrapper
  },

  /**
   * This is the place to receive notifications from other modules or the system.
   *
   * @param {string} notification The notification ID, it is preferred that it prefixes your module name
   * @param {number} payload the payload type.
   */
  notificationReceived(notification, payload) {
    if (notification === "DO_CHAT_COMPLETION") {
      this.sendSocketNotification("SPEECH_TO_TEXT", payload)
    }
  },
})
