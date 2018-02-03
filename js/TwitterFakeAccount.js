class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 5;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = {
            295218901: "VitalikButein",
            2312333412: "ethereumproject",
            4831010888: "myetherwallet",
            2309637680: "BittrexExchange",
            1399148563: "krakenfx",
            877807935493033984: "binance_2017",
            894231710065446912: "Tronfoundation",
            33962758: "gavofyork",
            139487079: "VladZamfir",
            63064338: "koeppelmann",
            2491775609: "mandeleil",
            143053926: "gavinandresen",
            1469101279: "aantonop",
            774689518767181828: "ethstatus",
            34592834: "nickdjohnson",
            14379660: "brian_armstrong",
            3331352283: "ConsenSysAndrew",
            2207129125: "Cointelegraph",
            1333467482: "coindesk",
            841424245938769920: "AttentionToken",
            2288889440: "Poloniex",
            907209378331336705: "raiden_network",
            2561715571: "ShapeShift_io",
            10157: "avsa",
            861463172296974336: "joinindorse",
            14338147: "SatoshiLite"
        };
        this.arrViewBlacklistedUserIds = [];
        this.arrViewWhitelistedUserIds = [];
        this.intTweetCount = 0;

        //If they click on a tweet thread
        window.onclick = function() {
            this.doWarningAlert();
        }.bind(this);
    }

    /**
     * Fetches the Twitter usernames that are in the DOM and puts them into a class array arrAllTwitterUsernames.
     *
     * @return
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
    }

    /**
     * Checks to see if a userid/username is an "imposter" of a whitelisted one.
     *
     * @param   int         intUserId           The twitter userid
     * @param   string      strUsername         The twitter username
     * @return  object                          IE: {"result":true,"similar_to":"xxxx"} or {"result":false}
     */
    isImposter(intUserId, strUsername)
    {
        //idk why sometimes it's null...
        if(intUserId === null) {
            return {
                "result":false
            };
        }

        //Userid is whitelisted!
        if ((intUserId in this.objWhitelistedHandles)) {
            //Add it to the array so we don't have to do any checks again
            this.arrViewWhitelistedUserIds.push(intUserId);
            return {
                "result":false
            };
        }

        //Userid has already been checked.
        if(this.arrViewWhitelistedUserIds.length > 0) {
            if(this.arrViewWhitelistedUserIds.indexOf(intUserId) != -1) {
                //console.log(intUserId +" has already been checked.");
                return {
                    "result":false
                };
            }
        }

        //The userid has already been tested a positive match
        if(this.arrViewBlacklistedUserIds.length > 0) {
            if (this.arrViewBlacklistedUserIds.indexOf(intUserId) != -1) {
                return {
                    "result": true,
                    "similar_to": this.arrViewBlacklistedUserIds[intUserId].similar_to
                };
            }
        }

        //Check the username against the whitelist with levenshtein edit distance
        for(var intKey in this.objWhitelistedHandles) {
            console.log(strUsername + " checking against: "+ this.objWhitelistedHandles[intKey]);
            var intHolisticMetric = this.levenshtein(strUsername, this.objWhitelistedHandles[intKey]);
            if (intHolisticMetric <= this.intMaxEditDistance) {
                //Add it to the array so we don't have to do Levenshtein again
                this.arrViewBlacklistedUserIds[intUserId] = {
                    "holistic": intHolisticMetric,
                    "similar_to": this.objWhitelistedHandles[intKey]
                };
                return {
                    "result":true,
                    "similar_to":this.objWhitelistedHandles[intKey]
                };
            }
        }

        //Add it to the array so we don't have to do any checks again
        this.arrViewWhitelistedUserIds.push(intUserId);
        return {
            "result":false
        };
    }

    doWarningAlert()
    {
        //console.log("RUNNING LOPGIC");
        var arrUsersOnView = document.getElementsByClassName("tweet");

        //Only run the logic if more tweets were loaded.
        if(arrUsersOnView.length === this.intTweetCount) {
            return;
        }

        this.intTweetCount = arrUsersOnView.length;

        for(var i=0; i<arrUsersOnView.length; i++) {
            var intUserId = arrUsersOnView[i].getAttribute("data-user-id");
            var strUsername = arrUsersOnView[i].getAttribute("data-screen-name");

            //See if a flag has already been set on the node
            if(arrUsersOnView[i].getAttribute("ext-ethersecuritylookup-twitterflagged")) {
                console.log("Node "+ i +" already flagged");
                continue;
            }

            //console.log("Doing: "+ strUsername);
            var objImposter = this.isImposter(intUserId, strUsername);
            if(objImposter.result) {
                console.log(strUsername +" is imposter of "+ objImposter.similar_to);

                arrUsersOnView[i].style = "background:#ff8080";
                arrUsersOnView[i].setAttribute("ext-ethersecuritylookup-twitterflagged", 1);
                continue;

                var objAlertDiv = document.createElement("div");
                objAlertDiv.innerText = "⚠️This Twitter account might be fake! (very similar name to @"+ objImposter.similar_to +")";
                objAlertDiv.style = "border-radius:0.5em;color:white;background:red;text-align:center;margin-bottom:1%;";
                //objAlertDiv.innerHTML += '<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC \'-//W3C//DTD SVG 1.1//EN\'  \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'><svg style="position:absolute;left:1em;z-index:2;" enable-background="new 0 0 50 50" height="50px" id="Layer_1" version="1.1" viewBox="0 0 50 50" width="50px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect fill="none" height="50" width="50"/><path d="M34.397,29L20,48L5.604,29  H15C15,0,44,1,44,1S25,2.373,25,29H34.397z" fill="red" stroke="red" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"/></svg>';
                //arrUsersOnView[i].insertBefore(objAlertDiv, arrUsersOnView[i].firstChild);
                arrUsersOnView[i].append(objAlertDiv);
            }
        }
    }

    /**
     * Performs a Levenshtein edit distance between 2 strings.
     *
     * @param   string      a       The string to compare.
     * @param   string      b       The base string to use.
     *
     * @return  int                 The amount of edits between the 2 strings.
     */
    levenshtein(a, b)
    {
        if(a.length == 0) return b.length;
        if(b.length == 0) return a.length;

        // swap to save some memory O(min(a,b)) instead of O(a)
        if(a.length > b.length) {
            var tmp = a;
            a = b;
            b = tmp;
        }

        var row = [];
        // init the row
        for(var i = 0; i <= a.length; i++){
            row[i] = i;
        }

        // fill in the rest
        for(var i = 1; i <= b.length; i++){
            var prev = i;
            for(var j = 1; j <= a.length; j++){
                var val;
                if(b.charAt(i-1) == a.charAt(j-1)){
                    val = row[j-1]; // match
                } else {
                    val = Math.min(row[j-1] + 1, // substitution
                        prev + 1,     // insertion
                        row[j] + 1);  // deletion
                }
                row[j - 1] = prev;
                prev = val;
            }
            row[a.length] = prev;
        }

        return row[a.length];
    }

}


var objTwitterFakeAccount = new TwitterFakeAccount();

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

observeDOM( document.getElementsByTagName('body')[0] ,function(){
    console.log("DOM CHANGE");
    var waitForLoad = setInterval(function() {
        if (document.getElementById("permalink-overlay")) {
            console.log("RUNNNING LOGIC");
            objTwitterFakeAccount.doWarningAlert(1);
            console.log("FINISHED LOGIC");
            clearInterval(waitForLoad);
        }
    }.bind(this), 1000);
});