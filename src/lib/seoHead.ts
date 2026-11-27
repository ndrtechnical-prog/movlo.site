const SITE_ORIGIN = "https://movlo.site";

function setMetaTag(attrName: "name" | "property", attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonicalLink(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLdGraph(graph: object[]) {
  let script = document.getElementById("movlo-jsonld");
  if (!script) {
    script = document.createElement("script");
    script.id = "movlo-jsonld";
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph
  });
}

export function applySeoHead(params: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  imageUrl?: string;
  noindex?: boolean;
  jsonLdGraph?: object[];
}) {
  document.title = params.title;
  const canonical = `${SITE_ORIGIN}${params.path.startsWith("/") ? params.path : `/${params.path}`}`;
  const absoluteImage = params.imageUrl
    ? params.imageUrl.startsWith("http")
      ? params.imageUrl
      : `${SITE_ORIGIN}${params.imageUrl.startsWith("/") ? params.imageUrl : `/${params.imageUrl}`}`
    : `${SITE_ORIGIN}/assets/editorial/ai-computing.jpg`;

  setMetaTag("name", "description", params.description);
  setMetaTag(
    "name",
    "robots",
    params.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"
  );
  setMetaTag("property", "og:title", params.title);
  setMetaTag("property", "og:description", params.description);
  setMetaTag("property", "og:type", params.ogType || "website");
  setMetaTag("property", "og:url", canonical);
  setMetaTag("property", "og:image", absoluteImage);
  setMetaTag("name", "twitter:title", params.title);
  setMetaTag("name", "twitter:description", params.description);
  setMetaTag("name", "twitter:image", absoluteImage);
  setCanonicalLink(canonical);

  if (params.jsonLdGraph && params.jsonLdGraph.length > 0) {
    setJsonLdGraph(params.jsonLdGraph);
  }
}
