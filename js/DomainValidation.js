var objWorker = new Worker(chrome.runtime.getURL('/js/workers/DomainValidation.js'));

chrome.runtime.sendMessage({func: "getMetaMaskLists"}, function(objResponse) {
    if (objResponse.resp) {
        objWorker.postMessage(JSON.stringify({
            domain: window.location.hostname,
            lists: objResponse.resp
        }));
    }
});

objWorker.onmessage = function (event) {
    var objResult = JSON.parse(event.data);
    if(objResult.result) {
        //Either blacklisted or fuzzy match
        window.location.href = "https://harrydenley.com/EtherAddressLookup/phishing.html#"+ (window.location.href)+"#type="+objResult.type;
        return false;
    }
};