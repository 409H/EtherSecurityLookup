/**
 * This class is based heavily on https://github.com/MetaMask/eth-phishing-detect
 */
class DomainValidation
{
    constructor(strLists)
    {
        var objLists = JSON.parse(strLists);
        this.strDomain = objLists.domain;
        var objLists = JSON.parse(objLists.lists);
        this.whitelist = objLists.list.whitelist || [];
        this.blacklist = objLists.list.blacklist || [];
        this.fuzzylist = objLists.list.fuzzylist || [];
        this.tolerance = objLists.list.tolerance || 2;
    }

    check ()
    {
        const source = this.domainToParts(this.strDomain);

        // if source matches whitelist domain (or subdomain thereof), PASS
        const whitelistMatch = this.matchPartsAgainstList(source, this.whitelist);
        if (whitelistMatch) return { type: 'whitelist', result: false };

        // if source matches blacklist domain (or subdomain thereof), FAIL
        const blacklistMatch = this.matchPartsAgainstList(source, this.blacklist);

        if (blacklistMatch) return { type: 'blacklist', result: true };

        if (this.tolerance > 0) {
            let objReturn = null;
            // check if near-match of whitelist domain, FAIL
            let fuzzyForm = this.domainPartsToFuzzyForm(source);
            // strip www
            fuzzyForm = fuzzyForm.replace('www.', '');
            // check against fuzzylist
            this.fuzzylist.find(function(strFuzzyDomain) {
                var arrDomainParts = strFuzzyDomain.split(".").reverse();
                const fuzzyTarget = this.domainPartsToFuzzyForm(arrDomainParts);
                const distance = this.levenshtein(fuzzyTarget, this.domainPartsToFuzzyForm(source));
                if(distance <= this.tolerance) {
                    objReturn = { type: 'fuzzy', result: true };
                    return true;
                }
            }.bind(this));

            if(objReturn !== null) {
                return objReturn;
            }
        }

        // matched nothing, PASS
        return { type: 'all', result: false };
    }

    processDomainList (list) {
        return list.map(domainToParts)
    }

    domainToParts (domain) {
        return domain.split('.').reverse()
    }

    domainPartsToDomain(domainParts) {
        return domainParts.slice().reverse().join('.')
    }

    // for fuzzy search, drop TLD and re-stringify
    domainPartsToFuzzyForm(domainParts) {
        return domainParts.slice(1).reverse().join('.')
    }

    // match the target parts, ignoring extra subdomains on source
    //   source: [io, metamask, xyz]
    //   target: [io, metamask]
    //   result: PASS
    matchPartsAgainstList(source, list) {
        return list.some((target) => {
            // target domain has more parts than source, fail
            //if (target.length > source.length) return false;
            // source matches target or (is deeper subdomain)
            var target = this.domainToParts(target);
            return target.every((part, index) => source[index] === part)
        })
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
                if(b.charAt(i-1) === a.charAt(j-1)){
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
    var objDomainValidation = new DomainValidation(objData.data);
    var arrResult = objDomainValidation.check();
    postMessage(JSON.stringify(arrResult));
};