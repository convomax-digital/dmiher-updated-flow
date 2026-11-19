import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../config/api";
import { getNonce } from "../context/NonceContext";

/**
 * Injects the <head> tag code configured in the dashboard
 * (Settings → Google Tags).
 *
 * The static site hard-codes its Google Tag Manager / gtag.js snippets in
 * index.html; here the snippet is pasted into the dashboard, served by
 * /site/settings, and injected at runtime so it can be changed without a
 * redeploy. The endpoint returns null unless a snippet exists AND is switched
 * on, so a non-null value means "run this".
 *
 * WHY THE HTML IS REBUILT RATHER THAN ASSIGNED
 * --------------------------------------------
 * Setting innerHTML does not execute <script> elements — the HTML spec marks
 * scripts inserted that way as already-"started", so they are parsed and
 * ignored. The snippet is therefore parsed into a document and each script
 * re-created with document.createElement, which does run.
 */

const fetchSiteSettings = async () => {
  const { data } = await api.get("/site/settings");
  return data;
};

/**
 * Turn the pasted markup into live <script> elements in document.head.
 * Returns the nodes added, so they can be removed again on unmount.
 */
function injectSnippet(html, nonce) {
  const added = [];

  // A detached document: parsing here cannot run anything or touch the live
  // page, so we choose what executes rather than the parser deciding.
  const parsed = new DOMParser().parseFromString(
    `<!doctype html><html><head>${html}</head><body></body></html>`,
    "text/html"
  );

  // Scripts land in <head> or <body> depending on how the browser recovered
  // from the pasted markup, so collect from the whole parsed document.
  for (const old of parsed.querySelectorAll("script")) {
    const script = document.createElement("script");

    // Copy the author's attributes first (src, async, type, data-*), then set
    // the nonce, so a nonce written into the pasted code cannot override the
    // real per-request one and get itself blocked.
    for (const { name, value } of old.attributes) {
      try {
        script.setAttribute(name, value);
      } catch {
        // Ignore attribute names the DOM rejects; the rest of the tag is
        // still worth running.
      }
    }

    if (old.src) {
      script.async = old.async || true;
    } else {
      script.textContent = old.textContent;
    }

    if (nonce) script.setAttribute("nonce", nonce);

    document.head.appendChild(script);
    added.push(script);
  }

  // <noscript> is carried over as-is. It holds no executable code, and a
  // pasted GTM block often includes one; dropping it silently would look like
  // the paste was mangled.
  for (const old of parsed.querySelectorAll("noscript")) {
    const el = document.createElement("noscript");
    el.innerHTML = old.innerHTML;
    document.body.appendChild(el);
    added.push(el);
  }

  return added;
}

export default function GoogleTag() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const location = useLocation();

  const snippet = data?.analytics?.head_snippet || null;

  // Tag loaders can only be initialised once per page load, so the snippet is
  // injected a single time even if the query object changes identity. An edit
  // in the dashboard is picked up on the next full page load.
  const injected = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined" || !snippet) return;
    if (injected.current) return;
    injected.current = true;

    // dataLayer must exist before the snippet runs: every Google tag pushes
    // to it immediately, and the route-change effect below pushes to it too.
    window.dataLayer = window.dataLayer || [];

    let nodes = [];
    try {
      nodes = injectSnippet(snippet, getNonce?.());
    } catch (err) {
      // A malformed paste must never take the website down with it.
      console.error("[GoogleTag] could not inject the configured tag code", err);
    }

    return () => {
      for (const node of nodes) node.remove();
    };
  }, [snippet]);

  // This is a single-page app: a tag's own page-view fires once on load and
  // every later navigation would go unrecorded. Pushing a route change onto
  // the data layer gives Google Tag Manager a History Change / custom event
  // to trigger on, and gtag.js users a `page_view` they can forward.
  //
  // It runs on the first render too, which is harmless — the snippet's own
  // initial hit and this push are distinguishable by event name.
  useEffect(() => {
    if (!snippet || typeof window === "undefined") return;

    const path = location.pathname + location.search;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "spa_page_view",
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });

    // gtag() only exists when the pasted snippet was a gtag.js one; GTM-only
    // setups skip this and rely on the data-layer push above.
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [snippet, location.pathname, location.search]);

  return null;
}
