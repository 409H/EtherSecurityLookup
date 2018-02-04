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
            default: {
                strResponse = "not_supported";
            break;
            }
        }

        sendResponse({resp:strResponse});
    }
);