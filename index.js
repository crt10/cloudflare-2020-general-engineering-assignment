addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const host = "https://cloudflare-2020-general-engineering-assignment.tennyson-cheng.workers.dev"
  const url = host + "/links"
  const linkTreeURL = "https://static-links-page.signalnerve.workers.dev"
  const links = [
    {name: "Github", url: "https://github.com/crt10"},
    {name: "LinkedIn", url: "https://www.linkedin.com/in/tennyson-cheng-bb053b1b8/"},
    {name: "Personal Site", url: "https://meme-werld.fun"},
  ]
  const socialLinks = [
    {name: "Facebook", url: "https://www.facebook.com/tennyson.cheng", svg: "https://simpleicons.org/icons/facebook.svg"},
    {name: "Twitch", url: "https://www.twitch.tv/creatorten", svg: "https://simpleicons.org/icons/twitch.svg"},
  ]
  const pfp = "https://meme-werld.fun/profile.jpg"
  const name = "Tennyson Cheng"
  const color = "bg-blue-700"

  if (request.url === url) {
    return new Response(JSON.stringify(links), {
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    })
  }
  return new HTMLRewriter()
  .on("div#links", new LinksTransformer(links))
  .on("div#profile", new RewriteAttribute("style"))
  .on("img#avatar", new RewriteAttribute("src", pfp))
  .on("h1#name", new RewriteAttribute("", name))
  .on("div#social", new RewriteAttribute("style"))
  .on("div#social", new LinksTransformer(socialLinks))
  .on("title", new RewriteAttribute("", name))
  .on("body", new RewriteAttribute("class", color))
  .transform(await fetchStaticHTML(linkTreeURL))
}

async function fetchStaticHTML(url) {
  const response = await fetch(url, {
    headers: {'content-type': 'text/html;charset=UTF-8'},
  })
  return new Response(await response.text(), {
    headers: {'content-type': 'text/html;charset=UTF-8'},
  })
}

class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  async element(e) {
    for (let link of this.links) {
      let a = "<a href=\"" + link.url + "\">"
      if (link.svg) {
        a += await (await fetchStaticHTML(link.svg)).text()
      }
      else {
        a += link.name
      }
      a += "</a>"
      e.append(a, {html:true})
    }
  }
}

class RewriteAttribute {
  constructor(attr, param) {
    this.param = param
    this.attr = attr
  }
  async element(e) {
    switch(this.attr) {
      case "style":
        e.removeAttribute(this.attr)
        break
      case "src":
        e.setAttribute(this.attr, this.param)
        break
      case "":
        e.setInnerContent(this.param, {html: false})
        break
      case "class":
        e.setAttribute(this.attr, this.param)
    }
  }
}