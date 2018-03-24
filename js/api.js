chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var strOption = request.func;
        var strResponse = "";

        switch(strOption) {
            case 'getTwitterWhitelistStatus' :
                //This option is enabled by default
                if(localStorage.getItem("ext-ethersecuritylookup-twitter_whitelist") === null) {
                    strResponse = 1;
                } else {
                    var strTwitterWhitelist = localStorage.getItem("ext-ethersecuritylookup-twitter_whitelist");
                    var objTwitterWhitelist = JSON.parse(strTwitterWhitelist);
                    strResponse = objTwitterWhitelist.status;
                }
            break;
            case 'getTwitterWhitelist' :
                if(localStorage.getItem("ext-ethersecuritylookup-twitter_whitelist") === null) {
                    strResponse = JSON.stringify({});
                } else {
                    var strTwitterWhitelist = localStorage.getItem("ext-ethersecuritylookup-twitter_whitelist");
                    var objTwitterWhitelist = JSON.parse(strTwitterWhitelist);
                    strResponse = JSON.stringify(objTwitterWhitelist.users);
                }
            break;
            case 'getMetaMaskLists' :
                if(localStorage.getItem("ext-ethersecuritylookup-metamask_lists") === null) {
                    strResponse = JSON.stringify({tolerance: 2, whitelist: [], blacklist: [], fuzzylist: []});
                } else {
                    var strMetaMaskLists = localStorage.getItem("ext-ethersecuritylookup-metamask_lists");
                    var objMetaMaskLists = JSON.parse(strMetaMaskLists);
                    strResponse = JSON.stringify(objMetaMaskLists);
                }
            break;
            default: {
                strResponse = "not_supported";
            break;
            }
        }

        sendResponse({resp:strResponse});
    }
);