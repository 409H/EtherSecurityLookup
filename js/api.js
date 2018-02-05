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
            default: {
                strResponse = "not_supported";
            break;
            }
        }

        sendResponse({resp:strResponse});
    }
);