document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#AnalyseButton').addEventListener('click', analyse, false)

    function analyse() {
        chrome.tabs.query({ currentWindow: true, active: true},
        function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'hi')
        })
    }

})

