class DomainValidation
{
    constructor()
    {
        var o = new PhishingDetector();
        console.log(o)
    }
}

var objWorker = new Worker(chrome.runtime.getURL('/js/workers/DomainValidation.js'));

chrome.runtime.sendMessage({func: "getMetaMaskLists"}, function(objResponse) {
    if (objResponse.resp) {
        objWorker.postMessage(JSON.stringify({
            domain: "https://google.com/foo/bar",
            lists: objResponse.resp
        }));
    }
});

objWorker.onmessage = function (event) {
    console.log(event);
};