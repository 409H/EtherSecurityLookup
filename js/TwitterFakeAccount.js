class TwitterFakeAccount
{

    constructor()
    {
        this.arrAllTwitterUsernames = [];
        this.intTweetCount = 0;
    }

    /**
     * Fetches the tweets on the page and returns an array of objects
     *
     * @return  array
     */
    getTweets()
    {
        if(document.getElementsByClassName("permalink-container").length > 0) {
            if(document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet").length > 0) {
                return document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet");
            }
        }

        if(document.getElementsByClassName("tweet")) {
            return document.getElementsByClassName("tweet");
        }
        return [];
    }

    /**
     * Fetches the Twitter usernames that are in the DOM and puts them into a class array arrAllTwitterUsernames.
     *
     * @return  array
     */
    getTwitterUsernames()
    {
        var arrUsersOnView = document.getElementsByClassName("tweet");
        for(var intCounter=0; intCounter<arrUsersOnView.length; intCounter++) {
            var strUsername = arrUsersOnView[intCounter].getAttribute("data-screen-name");
            var intUserId = arrUsersOnView[intCounter].getAttribute("data-user-id");

            if(intUserId === null) {
                continue;
            }

            this.arrAllTwitterUsernames[intUserId] = {
                "userid": intUserId,
                "username": strUsername
            };
        }

        return this.arrAllTwitterUsernames;
    }

    doWarningAlert(objData)
    {
        var objNodes = document.getElementsByClassName("ext-ethersecuritylookup-tweet-"+objData.tweet_id);
        for(var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];
            if (objNode.getAttribute("ext-ethersecuritylookup-twitterflagged")) {
                return;
            }

            objNode.style = "background:rgba(255, 128, 128, 0.38);border: 2px solid red;padding:5px;border-radius:1em;";
            objNode.setAttribute("ext-ethersecuritylookup-twitterflagged", 1);

            var objAlertDiv = document.createElement("div");
            // @todo - Maybe link to the account it's similar to? https://twitter.com/intent/user?user_id=XXX
            objAlertDiv.innerText = "⚠️This Tweet might be from a fake account! (very similar name to @" + objData.similar_to + ")";
            objAlertDiv.innerHTML += "<a href='https://help.twitter.com/forms/impersonation?handle="+ objData.name +"' target='_blank' style='text-decoration:underline;text-decoration-style:dotted;color:rgba(255, 254, 236, 1);font-size:7pt;padding-left:5px;'>REPORT</a>";
            objAlertDiv.style = "color:white;background:red;text-align:center;margin-bottom:1%;font-weight:600;width:100%;border-top-left-radius:1em;border-top-right-radius:1em;top:-5px;position:relative;left:-5px;padding:5px;";
            objNode.insertBefore(objAlertDiv, objNode.firstChild);
        }
    }

    doWhitelistAlert(objData) {
        var objNodes = document.getElementsByClassName("ext-ethersecuritylookup-tweet-" + objData.tweet_id);
        for (var intCounter = 0; intCounter < objNodes.length; intCounter++) {
            var objNode = objNodes[intCounter];
            if (objNode.getAttribute("ext-ethersecuritylookup-twitterflagged")) {
                return;
            }

            var objAccountDetails = objNode.getElementsByClassName("account-group")[0];
            objNode.setAttribute("ext-ethersecuritylookup-twitterflagged", 1);

            var objWhitelistedIcon = document.createElement("img");
            objWhitelistedIcon.src = chrome.runtime.getURL('/images/esl-green.png');
            objWhitelistedIcon.style = "display:inline;height:20px;width:20px;left:15px;";
            objWhitelistedIcon.title = "This account is whitelisted by EtherSecurityLookup";
            objAccountDetails.append(objWhitelistedIcon);
        }
    }

    /**
     * https://stackoverflow.com/a/9496574
     * @param attribute
     * @return {Array}
     */
    getAllElementsWithAttribute(attribute, strValue)
    {
        var objNode = document;
        if(document.getElementsByClassName("permalink-container").length > 0) {
            if (document.getElementsByClassName("permalink-container")[0].getElementsByClassName("tweet").length > 0) {
                objNode = document.getElementsByClassName("permalink-container")[0];
            }
        }
        var matchingElements = [];
        var allElements = objNode.getElementsByTagName('*');
        for (var i = 0, n = allElements.length; i < n; i++)
        {
            if (allElements[i].getAttribute(attribute) !== null)
            {
                if(allElements[i].getAttribute(attribute) === strValue) {
                    // Element exists with attribute. Add to array.
                    matchingElements.push(allElements[i]);
                }
            }
        }
        return matchingElements;
    }

    isTwitterVerified(objTweet)
    {
        if(typeof objTweet.children[1] !== 'undefined') {
            if(typeof objTweet.children[1].children[0] !== 'undefined') {
                if(typeof objTweet.children[1].children[0].children[0] !== 'undefined') {
                    if(typeof objTweet.children[1].children[0].children[0].children[1] !== 'undefined') {
                        if(typeof objTweet.children[1].children[0].children[0].children[1].children[2] !== 'undefined') {
                            if(typeof objTweet.children[1].children[0].children[0].children[1].children[2].children[0] !== 'undefined') {
                                var arrClasses = objTweet.children[1].children[0].children[0].children[1].children[2].children[0].classList;
                                if(arrClasses.contains("Icon--verified")) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}


var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback){
        if( MutationObserver ){
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer){
                if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe( obj, { childList:true, subtree:true });
        }
        else if( eventListenerSupported ){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    };
})();

// Observe a specific DOM element:
var objTwitterFakeAccount = new TwitterFakeAccount();
var objWorker = new Worker(chrome.runtime.getURL('/js/workers/TwitterFakeAccount.js'));
var arrCheckedUsers = [];
var intTweetCounter = 0;

chrome.runtime.sendMessage({func: "getTwitterWhitelistStatus"}, function(objResponse) {
    if(objResponse.resp) {
        observeDOM( document.getElementsByTagName('body')[0] ,function(){
            if (document.getElementsByClassName("tweet")) {
                var arrTweets = objTwitterFakeAccount.getTweets();

                intTweetCounter = arrTweets.length;

                var arrTweetData = [];
                for(var intCounter=0; intCounter<arrTweets.length; intCounter++) {

                    var arrTmpTweetData = {
                        "userId": arrTweets[intCounter].getAttribute("data-user-id"),
                        "name": arrTweets[intCounter].getAttribute("data-screen-name"),
                        "tweet_id": arrTweets[intCounter].getAttribute("data-tweet-id"),
                        "twitter_verified":  objTwitterFakeAccount.isTwitterVerified(arrTweets[intCounter])
                    };

                    //See if we've already checked the userid
                    if(arrCheckedUsers.indexOf(arrTmpTweetData.userId) !== -1) {
                        if(arrCheckedUsers[arrTmpTweetData.userId].is_imposter === false) {
                            continue;
                        } else {
                            objTweetData.similar_to = arrCheckedUsers[arrTmpTweetData.userId].similar_to;
                            objTwitterFakeAccount.doWarningAlert(objTweetData);
                            continue;
                        }
                    }

                    if("ext-ethersecuritylookup-tweet-"+arrTweets[intCounter].getAttribute("data-tweet-id") in arrTweets[intCounter] === false) {
                        arrTweets[intCounter].className += " ext-ethersecuritylookup-tweet-" + arrTweets[intCounter].getAttribute("data-tweet-id");
                    }
                    arrTweetData.push(arrTmpTweetData);
                }

                var objDataToInspect = {
                    "whitelist": {},
                    "tweet_data": arrTweetData
                };
                chrome.runtime.sendMessage({func: "getTwitterWhitelist"}, function(objResponse) {
                    this.whitelist = objResponse.resp;

                    objWorker.postMessage(JSON.stringify(this));
                }.bind(objDataToInspect));
            }
        });
    }
});

objWorker.onmessage = function (event) {
    arrCheckedUsers[event.data.userId] = event.data;
    var arrData = JSON.parse(event.data);

    for(var intCounter=0; intCounter<arrData.length; intCounter++) {

        if(arrData[intCounter].is_imposter) {
            if(arrData[intCounter].twitter_verified === false) {
                objTwitterFakeAccount.doWarningAlert(arrData[intCounter]);
            }
        }

        if(arrData[intCounter].is_whitelisted) {
            objTwitterFakeAccount.doWhitelistAlert(arrData[intCounter]);
        }
    }
};