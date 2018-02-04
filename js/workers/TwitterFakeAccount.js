class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 4;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = {
            "14338147": "SatoshiLite",
            "14379660": "brian_armstrong",
            "19748227": "mewtant_",
            "33962758": "gavofyork",
            "34592834": "nickdjohnson",
            "63064338": "koeppelmann",
            "139487079": "VladZamfir",
            "143053926": "gavinandresen",
            "295218901": "VitalikButerin",
            "574032254": "coinbase",
            "1333467482": "coindesk",
            "1399148563": "krakenfx",
            "1469101279": "aantonop",
            "2207129125": "Cointelegraph",
            "2288889440": "Poloniex",
            "2309637680": "BittrexExchange",
            "2312333412": "ethereumproject",
            "2491775609": "mandeleil",
            "2561715571": "ShapeShift_io",
            "3278906401": "metamask_io",
            "3313312856": "etherscan",
            "3331352283": "ConsenSysAndrew",
            "4831010888": "myetherwallet",
            "877807935493033984": "binance_2017",
            "894231710065446912": "Tronfoundation",
            "774689518767181828": "ethstatus",
            "841424245938769920": "AttentionToken",
            "907209378331336705": "raiden_network",
            "861463172296974336": "joinindorse",
            "878924739812761600": "QuikNode",
            "831847934534746114": "omise_go",
            "887708494832451584": "concourseqio"
        };
        this.arrViewBlacklistedUserIds = [];
        this.arrViewWhitelistedUserIds = [];
        this.intTweetCount = 0;
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
    var arrTweetData = JSON.parse(objData.data);

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