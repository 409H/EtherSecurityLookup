document.getElementById("ext-manifest_version").innerText = chrome.runtime.getManifest().version;

class EslTools {

    async getListFromGithub(objTwitterWhitelist)
    {
        try {
            let objResponse = await fetch(objTwitterWhitelist.repo);
            return objResponse.json();
        } catch(objError) {
            console.error("Failed to get Twitter list: "+ objTwitterWhitelist.repo, objError);
        }
    }

    timeDifference(current, previous)
    {
        if(previous == 0) {
            return "Not fetched";
        }

        var elapsed = parseInt(current) - parseInt(previous);
        if(elapsed > 59) {
            return Math.floor(elapsed / 60) + ' minutes ago';
        }
        return Math.round(elapsed) + ' seconds ago';
    }

}

class TwitterLists {

    constructor()
    {
        this.getStats();

        setInterval(function() {
            this.refreshWhitelist();
        }.bind(this), 50000);
    }

    /**
     * Fetches the whitelist from either localstorage or the default strucutre/values.
     *
     * @return object   {{status: number, timestamp: number, repo: string, users: Array}}
     */
    getWhitelistStructure()
    {
        var strTwitterWhitelist = localStorage.getItem("ext-ethersecuritylookup-twitter_whitelist");

        if(strTwitterWhitelist === null) {
            var objTwitterWhitelist = {
                "status": true,
                "timestamp": 0,
                "repo": "https://gist.githubusercontent.com/409H/740c10d340ec01e265ba4add2e4430a7/raw/f975cf74174a999292c954eb9e1da7cc70956a49/esl-twitter.whitelist.json",
                "users": []
            };
        } else {
            var objTwitterWhitelist = JSON.parse(strTwitterWhitelist);
        }

        return objTwitterWhitelist;
    }

    /**
     * Fetches the whitelist json from the repo and puts it in localstorage
     */
    refreshWhitelist()
    {
        var objEslTools = new EslTools();

        var objTwitterWhitelist = this.getWhitelistStructure();

        if(objTwitterWhitelist.status) {
            objEslTools.getListFromGithub(objTwitterWhitelist).then(function (objList) {
                objTwitterWhitelist.timestamp = Math.floor(Date.now() / 1000);
                objTwitterWhitelist.users = objList;

                localStorage.setItem("ext-ethersecuritylookup-twitter_whitelist", JSON.stringify(objTwitterWhitelist));
                this.getStats();
            }.bind(this));
        }
    }

    /**
     * Gets and formats the stats for EtherSecurityLookup.html
     */
    getStats()
    {
        console.log("GET STATS");
        var objTwitterWhitelist = this.getWhitelistStructure();
        var objEslTools = new EslTools();

        console.log(objTwitterWhitelist);
        document.getElementById("ext-ethersecuritylookup-twitter_whitelist_checkbox").checked = objTwitterWhitelist.status;
        document.getElementById("ext-ethersecuritylookup-twitter_whitelist_last_updated").innerText = objEslTools.timeDifference(Math.floor(Date.now()/1000), objTwitterWhitelist.timestamp);
        document.getElementById("ext-ethersecuritylookup-twitter_whitelist_count").innerText = Object.keys(objTwitterWhitelist.users).length;
    }

    /**
     * Event handler to toggle the twitter option on/off and save into localstorage
     */
    toggleOption()
    {
        var objTwitterWhitelist = this.getWhitelistStructure();
        console.log("Check:"+ document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox').checked);
        console.log(typeof document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox').checked);
        if(document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox').checked) {
            objTwitterWhitelist.status = true;
        } else {
            objTwitterWhitelist.status = false;
        }

        console.log(objTwitterWhitelist);
        localStorage.setItem("ext-ethersecuritylookup-twitter_whitelist", JSON.stringify(objTwitterWhitelist));
    }
}

var objTwitterLists = new TwitterLists();
var objTwitterWhitelist = document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox');
if(objTwitterWhitelist) {
    objTwitterWhitelist.addEventListener('change', function() {
        this.toggleOption();
    }.bind(objTwitterLists), false);
}

class DomainBlacklist {

    constructor()
    {
        this.refreshBlacklist();
    }

    refreshBlacklist()
    {

    }

}