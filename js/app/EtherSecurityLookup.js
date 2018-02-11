if(document.getElementById("ext-manifest_version")) {
    document.getElementById("ext-manifest_version").innerText = chrome.runtime.getManifest().version;
}

class EslTools {

    async getListFromGithub(objRepo)
    {
        console.log("Getting "+ objRepo.repo);
        try {
            let objResponse = await fetch(objRepo.repo);
            return objResponse.json();
        } catch(objError) {
            console.error("Failed to get Twitter list: "+ objRepo.repo, objError);
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
                "repo": "https://raw.githubusercontent.com/409H/EtherSecurityLookup/master/lists/twitter.whitelist.json",
                "users": []
            };
            this.refreshWhitelist(true);
        } else {
            var objTwitterWhitelist = JSON.parse(strTwitterWhitelist);
            if((Math.floor(Date.now() / 1000)) - 600 >= objTwitterWhitelist.timestamp) {
                this.refreshWhitelist(true);
            }
        }

        return objTwitterWhitelist;
    }

    /**
     * Fetches the whitelist json from the repo and puts it in localstorage
     */
    refreshWhitelist(blInit = false)
    {
        var objEslTools = new EslTools();

        if(blInit) {
            var objTwitterWhitelist = {
                "status": true,
                "timestamp": 0,
                "repo": "https://raw.githubusercontent.com/409H/EtherSecurityLookup/master/lists/twitter.whitelist.json",
                "users": []
            };
        } else {
            var objTwitterWhitelist = this.getWhitelistStructure();
        }

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
        var objTwitterWhitelist = this.getWhitelistStructure();
        var objEslTools = new EslTools();

        if(document.getElementById("ext-ethersecuritylookup-twitter_whitelist_checkbox")) {
            document.getElementById("ext-ethersecuritylookup-twitter_whitelist_checkbox").checked = objTwitterWhitelist.status;
            document.getElementById("ext-ethersecuritylookup-twitter_whitelist_last_updated").innerText = objEslTools.timeDifference(Math.floor(Date.now() / 1000), objTwitterWhitelist.timestamp);
            document.getElementById("ext-ethersecuritylookup-twitter_whitelist_count").innerText = Object.keys(objTwitterWhitelist.users).length;
        }
    }

    /**
     * Event handler to toggle the twitter option on/off and save into localstorage
     */
    toggleOption()
    {
        var objTwitterWhitelist = this.getWhitelistStructure();
        if(document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox').checked) {
            objTwitterWhitelist.status = true;
        } else {
            objTwitterWhitelist.status = false;
        }

        localStorage.setItem("ext-ethersecuritylookup-twitter_whitelist", JSON.stringify(objTwitterWhitelist));
    }
}

// Init Twitter lists and add an event listener to the checkbox to toggle it on/off.
var objTwitterLists = new TwitterLists();
var objTwitterWhitelist = document.getElementById('ext-ethersecuritylookup-twitter_whitelist_checkbox');
if(objTwitterWhitelist) {
    objTwitterWhitelist.addEventListener('change', function() {
        this.toggleOption();
    }.bind(objTwitterLists), false);
}


window.setInterval(function() {
    var objTwitterLists = new TwitterLists();
    objTwitterLists.refreshWhitelist();
}, 600000);