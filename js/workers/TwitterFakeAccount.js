class TwitterFakeAccount
{

    constructor()
    {
        this.intMaxEditDistance = 3;
        this.arrAllTwitterUsernames = [];
        this.objWhitelistedHandles = {
            "30473929": "eordano",
            "1210170414": "arimeilich",
            "3291830170": "decentraland",
            "14285074": "danfinlay",
            "14338147": "SatoshiLite",
            "14379660": "brian_armstrong",
            "16143277": "kingflurkel",
            "19748227": "mewtant_",
            "26861418": "iurimatias",
            "33962758": "gavofyork",
            "34592834": "nickdjohnson",
            "37456482": "spencecoin",
            "48093881": "leashless",
            "61417559": "ErikVoorhees",
            "63064338": "koeppelmann",
            "92170043": "smokyish",
            "125304737": "blockchain",
            "139487079": "VladZamfir",
            "143053926": "gavinandresen",
            "186028018": "peter_szilagyi",
            "263162731": "thegrifft",
            "295218901": "VitalikButerin",
            "574032254": "coinbase",
            "801236832": "hudsonjameson",
            "886832413": "bitfinex",
            "1333467482": "coindesk",
            "1399148563": "krakenfx",
            "1469101279": "aantonop",
            "1595615893": "polkadotnetwork",
            "2185973521": "satoshilabs",
            "2207129125": "Cointelegraph",
            "2230675752": "jaxx_io",
            "2288889440": "Poloniex",
            "2309637680": "BittrexExchange",
            "2312333412": "ethereumproject",
            "2491775609": "mandeleil",
            "2561715571": "ShapeShift_io",
            "2652239532": "LedgerHQ",
            "3129477561": "ConsenSys",
            "3278906401": "metamask_io",
            "3313312856": "etherscan",
            "3331352283": "ConsenSysAndrew",
            "3536736623": "ParityTech",
            "4108026892": "4chdn",
            "4831010888": "myetherwallet",
            "877807935493033984": "binance_2017",
            "894231710065446912": "Tronfoundation",
            "774689518767181828": "ethstatus",
            "841424245938769920": "AttentionToken",
            "907209378331336705": "raiden_network",
            "861463172296974336": "joinindorse",
            "878924739812761600": "QuikNode",
            "831847934534746114": "omise_go",
            "887708494832451584": "concourseqio",
            "893215209896071168": "MercuryProtocol",
            "883774743345758208": "stx_coin",
            "878526188268007424": "ETHWeather",
            "877252835641090050": "cryptomindedcom",
            "876743483595280384": "FoundationHG",
            "876560885497683968": "TokenData",
            "873704225984958464": "flippeningwatch",
            "872785322828083201": "iXledger",
            "866192511038922753": "ethplorer",
            "865963965649571840": "KyberNetwork",
            "865213817466142724": "district0x",
            "842114751878553604": "Prism_Exchange",
            "831182644234821632": "EntEthAlliance",
            "828668619986964480": "AragonProject",
            "826699259441328128": "0xProject",
            "825344377723707392": "ethlance",
            "817756699708846093": "ProjectOaken",
            "816646997356777472": "Bancor",
            "798810763586478080": "Givethio",
            "759252279862104064": "eth_classic",
            "739770876808167424": "PowerLedger_io",
            "4469439315": "numerai",
            "787097654530498560": "maurelian_",
            "774687750570336260": "carlbennetts",
            "704835806255427584": "jfurgo",
            "813038152013201408": "wtzb_",
            "848656782289391616": "coinyeezy",
            "605817117": "berndlapp",
            "237387363": "sniko_",
            "937307244886220801": "EthAddrLookup"
        };
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
            if (strUsername.toLowerCase() === this.objWhitelistedHandles[intKey].toLowerCase()) {
                return {
                    "result": false,
                    "whitelisted": true
                };
            }
        }

        for(var intKey in this.objWhitelistedHandles) {
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

        if(objImposter.hasOwnProperty("whitelisted")) {
            objTweetData.is_whitelisted = true;
        } else {
            objTweetData.is_whitelisted = false;
        }
        arrTweetData[intCounter] = objTweetData;
    }

   postMessage(JSON.stringify(arrTweetData));

};