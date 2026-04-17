// Cloudflare Pages middleware.
//
// Runs for every request hitting the Pages project. Two responsibilities:
//
//  1. Content-negotiate the homepage: when an agent sends
//     `Accept: text/markdown`, serve `/index.md` instead of the HTML homepage
//     with `Content-Type: text/markdown`. See:
//     https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
//
//  2. Inject the agent-discovery `Link` response header on the homepage
//     (RFC 8288), advertising the sitemap, agent-skills index, and the
//     markdown alternate. The `_headers` file already sets this for direct
//     static hits, but Functions responses bypass `_headers`, so we set it
//     here too.
//
// Docs:
// - https://developers.cloudflare.com/pages/functions/middleware/
// - https://www.rfc-editor.org/rfc/rfc8288

type Ctx = EventContext<unknown, string, unknown>;

const LINK_HEADER = [
  '</sitemap-index.xml>; rel="sitemap"; type="application/xml"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
  '</index.md>; rel="alternate"; type="text/markdown"',
].join(", ");

function extractQ(acceptLower: string, type: string): number {
  const idx = acceptLower.indexOf(type);
  if (idx === -1) return 0;
  const end = acceptLower.indexOf(",", idx);
  const segment = acceptLower.slice(idx, end === -1 ? undefined : end);
  const match = segment.match(/;\s*q=([0-9.]+)/);
  return match ? parseFloat(match[1]) : 1;
}

function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const lower = accept.toLowerCase();
  if (!lower.includes("text/markdown")) return false;
  const htmlQ = extractQ(lower, "text/html");
  const mdQ = extractQ(lower, "text/markdown");
  return mdQ >= htmlQ;
}

function isHomepage(pathname: string): boolean {
  return pathname === "/" || pathname === "/index.html";
}

export const onRequest = async (context: Ctx): Promise<Response> => {
  const { request, next } = context;
  const url = new URL(request.url);

  // Only alter behaviour for the homepage. Everything else flows through
  // unchanged (static assets use `_headers` for their own response headers).
  if (!isHomepage(url.pathname)) {
    return next();
  }

  const accept = request.headers.get("accept");

  if (request.method === "GET" && wantsMarkdown(accept)) {
    // Fetch the static markdown companion and serve it with the right type.
    const mdUrl = new URL("/index.md", url);
    const mdRes = await fetch(new Request(mdUrl.toString(), request));
    const body = await mdRes.text();
    const tokens = estimateTokens(body);
    return new Response(body, {
      status: mdRes.ok ? 200 : mdRes.status,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Language": "en",
        "Link": LINK_HEADER,
        "Vary": "Accept",
        // Bypass Cloudflare's edge cache so this negotiated response does not
        // get served to browsers (Free plan caches ignore `Vary: Accept`).
        "Cache-Control": "private, no-store",
        "CDN-Cache-Control": "no-store",
        "X-Markdown-Tokens": String(tokens),
      },
    });
  }

  // Default path: let the static asset pipeline serve index.html, then add
  // our Link + Vary headers on the way out.
  const res = await next();
  const headers = new Headers(res.headers);
  headers.set("Link", LINK_HEADER);
  // Append rather than overwrite in case upstream already set a Vary value.
  const existingVary = headers.get("Vary");
  if (!existingVary) {
    headers.set("Vary", "Accept");
  } else if (!/\baccept\b/i.test(existingVary)) {
    headers.set("Vary", `${existingVary}, Accept`);
  }
  // Prevent Cloudflare's edge cache from serving an HTML response to a later
  // agent request (the Free-plan cache does not key on `Accept`). The origin
  // is already fast; a static portfolio doesn't need edge caching on `/`.
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  headers.set("CDN-Cache-Control", "no-store");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};

// Rough token estimate: ~4 chars per token for English prose.
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
