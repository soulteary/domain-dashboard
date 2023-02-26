# Domain Dashboard

You only need to **copy and paste** the content of the privoder domain list page, then you will get the full domain list.

## Download

```bash
docker run --rm -it -p 3000:3000 -v `pwd`/embed:/embed -v `pwd`/data:/data soulteary/domain-dashboard:v0.1.1
```

## Screenshots

<img src="./screenshots/webui-desktop.png" width="80%">

<img src="./screenshots/webui-mobile.png" width="50%">

## Support Domain Provider

- [Aliyun](https://dc.console.aliyun.com/#/domain-list/all)
- [CloudFlare](https://dash.cloudflare.com/)
- [NameSilo](https://www.namesilo.com/account_domains.php)
- [QCloud](https://console.cloud.tencent.com/domain/all-domain)

Copy text from the domain list, and paste it into the text file in the data directory, eg: `cloudflare.txt`.

<img src="./screenshots/domain-aliyun.png" width="45%"> <img src="./screenshots/domain-cloudflare.png" width="45%">

<img src="./screenshots/domain-namesilo.png" width="45%"> <img src="./screenshots/domain-qcloud.png" width="45%">
