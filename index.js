addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const host = "https://cloudflare-2020-general-engineering-assignment.tennyson-cheng.workers.dev"
  const url = host + "/links"
  const links = [
    JSON.stringify({name: "Github", url: "https://github.com/crt10"}),
    JSON.stringify({name: "LinkedIn", url: "https://www.linkedin.com/in/tennyson-cheng-bb053b1b8/"}),
    JSON.stringify({name: "Personal Site", url: "https://meme-werld.fun"})
  ]
  const pfp = "https://meme-werld.fun/profile.jpg"
  const name = "Tennyson Cheng"

  if (request.url === url) {
    return new Response(links, {
      headers: { "content-type": "application/json" },
    })
  }
  return new HTMLRewriter()
  .on("div#links", new LinksTransformer(links))
  .on("div#profile", new RewriteAttribute("style"))
  .on("img#avatar", new RewriteAttribute("src", pfp))
  .on("h1#name", new RewriteAttribute("", name))
  .transform(await fetchStaticHTML())
}

async function fetchStaticHTML() {
  const url = "https://static-links-page.signalnerve.workers.dev"
  const response = await fetch(url, {
    headers: {"content-type": "text/html"},
  })
  return new Response(await response.text(), {
    headers: {"content-type": "text/html"},
  })
}

class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  async element(e) {
    console.log(`Incoming element: ${e.tagName}`)
    for (let link of this.links) {
      let a = "<a href=\"" + JSON.parse(link).url + "\">" + JSON.parse(link).name + "</a>"
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
        e.append(this.param, {html: false})
    }
  }
}