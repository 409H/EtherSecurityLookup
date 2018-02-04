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
        var objNode = document.getElementById("ext-ethersecuritylookup-tweet-"+objData.tweet_id);

        if(objNode.getAttribute("ext-ethersecuritylookup-twitterflagged")){
            return;
        }

        objNode.style = "background:rgba(255, 128, 128, 0.38);border: 2px solid red;padding:5px;border-radius:1em;";
        objNode.setAttribute("ext-ethersecuritylookup-twitterflagged", 1);

        var objAlertDiv = document.createElement("div");
        // @todo - Maybe link to the account it's similar to? https://twitter.com/intent/user?user_id=XXX
        objAlertDiv.innerText = "⚠️This Tweet might be from a fake account! (very similar name to @"+ objData.similar_to +")";
        objAlertDiv.style = "color:white;background:red;text-align:center;margin-bottom:1%;font-weight:600;width:100%;border-top-left-radius:1em;border-top-right-radius:1em;top:-5px;position:relative;left:-5px;padding:5px;";
        objNode.insertBefore(objAlertDiv, objNode.firstChild);
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
            if (document.getElementById("permalink-overlay")) {
                var arrTweets = objTwitterFakeAccount.getTweets();

                intTweetCounter = arrTweets.length;

                var arrTweetData = [];
                for(var intCounter=0; intCounter<arrTweets.length; intCounter++) {
                    var arrTmpTweetData = {
                        "userId": arrTweets[intCounter].getAttribute("data-user-id"),
                        "name": arrTweets[intCounter].getAttribute("data-screen-name"),
                        "tweet_id": arrTweets[intCounter].getAttribute("data-tweet-id")
                    };

                    //See if we've already checked the userid
                    if(arrCheckedUsers.indexOf(arrTmpTweetData.userId) !== -1) {
                        console.log(arrCheckedUsers[arrTmpTweetData.userId]);
                        if(arrCheckedUsers[arrTmpTweetData.userId].is_imposter === false) {
                            console.log(arrTmpTweetData.name +" is ok");
                            continue;
                        } else {
                            objTweetData.similar_to = arrCheckedUsers[arrTmpTweetData.userId].similar_to;
                            console.log(arrTmpTweetData.name +" is NOT ok");
                            //objTwitterFakeAccount.doWarningAlert(objTweetData);
                            continue;
                        }
                    }

                    arrTweets[intCounter].id = "ext-ethersecuritylookup-tweet-"+arrTweets[intCounter].getAttribute("data-tweet-id");
                    arrTweetData.push(arrTmpTweetData);
                }

                objWorker.postMessage(JSON.stringify(arrTweetData));
            }
        });
    }
});

objWorker.onmessage = function (event) {
    arrCheckedUsers[event.data.userId] = event.data;
    var arrData = JSON.parse(event.data);
    for(var intCounter=0; intCounter<arrData.length; intCounter++) {
        if(arrData[intCounter].is_imposter) {
            console.log(arrData[intCounter].name +" is an imposter of "+ arrData[intCounter].similar_to);
            objTwitterFakeAccount.doWarningAlert(arrData[intCounter]);
        }
    }
};