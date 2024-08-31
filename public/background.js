chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed and command registered.')
})

chrome.commands.onCommand.addListener((command) => {
    if (command === 'open_extension') {
        chrome.action.openPopup()
    }
})
