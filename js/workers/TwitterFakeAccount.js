class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 4;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = {};
        this.arrViewBlacklistedUserIds = [];
        this.arrViewWhitelistedUserIds = [];
        this.intTweetCount = 0;
    }

    setWhitelist(strWhitelist)
    {
        this.objWhitelistedHandles = JSON.parse(strWhitelist);
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

        //Check the username against the whitelist with levenshtein edit distance
        for(var intKey in this.objWhitelistedHandles) {
            if(strUsername.toLowerCase() === this.objWhitelistedHandles[intKey].toLowerCase()) {
                return {
                    "result":false
                };
            }
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

        return {
            "result":false
        };
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

self.onmessage = function(objData) {
    var objTwitterFakeAccount = new TwitterFakeAccount();
    var objRequest = JSON.parse(objData.data);
    var arrTweetData = objRequest.tweet_data;
    objTwitterFakeAccount.setWhitelist(objRequest.whitelist);

    for(var intCounter=0; intCounter<arrTweetData.length; intCounter++) {
        var objTweetData = arrTweetData[intCounter];
        var objImposter = objTwitterFakeAccount.isImposter(objTweetData.userId, objTweetData.name);
        if(objImposter.result) {
            objTweetData.is_imposter = true;
            objTweetData.similar_to = objImposter.similar_to;
        } else {
            objTweetData.is_imposter = false;
        }
        arrTweetData[intCounter] = objTweetData;
    }

    postMessage(JSON.stringify(arrTweetData));

};