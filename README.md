# EtherSecurityLookup
A sister app to [EtherAddressLookup](https://github.com/409H/EtherAddressLookup), but security focused only to help prevent you from falling victim to phishing scams within the Ethereum world.

Ether/ERC20 donation address:  0x661b5dc032bedb210f225df4b1aa2bdd669b38bc

## What does this extension do?

- [x] Automagically tell you if a Twitter account is imitating a verified Twitter account.
- [ ] Block you from visiting verified phishing/scam Ethereum-related domains.
- [ ] Warn you if you are about to sign a transaction to a flagged Ethereum address.
- [ ] Warn you on block explorers (such as etherscan.io) if an address has been flagged. 
- [ ] Remove Google search Ads.
- [ ] Display a visual aid for verified domains so you know which ones are safe.

### Whitelist my Twitter account

* Go to [http://gettwitterid.com/](http://gettwitterid.com/) and type your Twitter handle .
* Copy your ID.
* Create a PR in [lists/twitter.whitelist.json](https://github.com/409H/EtherSecurityLookup/blob/master/lists/twitter.whitelist.json) following the same structure. 

```
    "id": "twitter_handle"
```