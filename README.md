# EtherSecurityLookup
A sister app to [EtherAddressLookup](https://github.com/409H/EtherAddressLookup), but security focused only to help prevent you from falling victim to phishing scams within the Ethereum world.

Ether/ERC20 donation address: `0x661b5dc032bedb210f225df4b1aa2bdd669b38bc`

## What does this extension do?

- [x] Automagically tell you if a Twitter account is imitating a verified Twitter account.
- [ ] Block you from visiting verified phishing/scam Ethereum-related domains.
- [ ] Warn you if you are about to sign a transaction to a flagged Ethereum address.
- [ ] Warn you on block explorers (such as etherscan.io) if an address has been flagged. 
- [ ] Remove Google search Ads.
- [ ] Display a visual aid for verified domains so you know which ones are safe.

## Installations

### Chrome Extension

The `master` branch is bundled on every release and pushed to the Chrome store, you can view/download it 
here: [https://chrome.google.com/webstore/detail/ethersecuritylookup/bhhfhgpgmifehjdghlbbijjaimhmcgnf](https://chrome.google.com/webstore/detail/ethersecuritylookup/bhhfhgpgmifehjdghlbbijjaimhmcgnf) for Chrome.

(Note that this will have automatic updates)

### Manual Installation

#### Chrome
* Clone/download [the repo](https://github.com/409H/EtherSecurityLookup).
* Go to [chrome://extensions](chrome://extensions) in Chrome
* Turn on developer mode.
* Load the `manifest.json` file by dragging and dropping.

## Whitelisting/Blacklisting

### Whitelist my Twitter account

* Go to [http://gettwitterid.com/](http://gettwitterid.com/) and type your Twitter handle .
* Copy your ID.
* Create a PR in [lists/twitter.whitelist.json](https://github.com/409H/EtherSecurityLookup/blob/master/lists/twitter.whitelist.json) following the same structure. 

```
    "id": "twitter_handle"
```

----

**Tweet Threads**

* [https://twitter.com/iurimatias/status/958726515050663937](https://twitter.com/iurimatias/status/958726515050663937)
* [https://twitter.com/sniko_/status/959559349734604802](https://twitter.com/sniko_/status/959559349734604802)
