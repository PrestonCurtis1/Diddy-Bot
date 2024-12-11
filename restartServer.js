const response = await fetch("https://gw.discloud.com/api/app/1731989981986/restart", 
  {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": "Bearer 5ae122b9aa31feb39565957495c24253b19008cc7b603f69c1505c3042e94df64094b0252bfb9b41930093cce37487ae67516d3c",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "Referer": "https://discloud.com/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "PUT"
  });
console.log(response);