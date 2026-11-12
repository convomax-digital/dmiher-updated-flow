import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../config/api";
import { getNonce } from "../context/NonceContext";

const fetchWidgetSettings = async () => {
  const { data } = await api.get("/site/settings");
  return data;
};

const NIAA_STYLES = `
  /* Niaa face icon — far right */
  #__eechatIcon {
    bottom: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
  }

  /* Hide Niaa greeting text */
  #eeChatIndicator .indicator {
    display: none !important;
  }

  /* Desktop: Geta WhatsApp — left of Niaa (row layout) */
  #geta_widget {
    bottom: 10px !important;
    right: 85px !important;
    z-index: 2147483646 !important;
  }

  /* Custom WhatsApp button — left of Niaa icon */
  .niaa-whatsapp-btn {
    position: fixed;
    bottom: 20px;
    right: 85px;
    z-index: 2147483646;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #25D366;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .niaa-whatsapp-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
  .niaa-whatsapp-btn svg {
    width: 30px;
    height: 30px;
    fill: #ffffff;
  }

  /* Hide panel while we wait for auto-open to settle */
  .npf_ai_agents.niaa-settling {
    opacity: 0 !important;
    pointer-events: none !important;
    transition: none !important;
  }

  /* Niaa chatbot panel styling */
  .npf_ai_agents.active {
    display: block !important;
    position: fixed !important;
    bottom: 80px !important;
    right: 20px !important;
    max-height: 520px !important;
    height: 520px !important;
    max-width: 380px !important;
    width: 380px !important;
    z-index: 2147483645 !important;
    padding: 0 !important;
    background: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18) !important;
    overflow: hidden !important;
  }
  .npf_ai_agents iframe#chatbox_frame {
    max-height: 520px !important;
    height: 520px !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: #ffffff !important;
    display: block !important;
  }

  /* Tablet */
  @media (max-width: 768px) {
    #__eechatIcon {
      bottom: 15px !important;
      right: 15px !important;
    }
    #geta_widget {
      bottom: 5px !important;
      right: 75px !important;
    }
    .niaa-whatsapp-btn {
      bottom: 15px;
      right: 75px;
      width: 48px;
      height: 48px;
    }
    .niaa-whatsapp-btn svg {
      width: 27px;
      height: 27px;
    }
    .npf_ai_agents.active {
      bottom: 75px !important;
      right: 10px !important;
      max-height: 460px !important;
      height: 460px !important;
      max-width: 350px !important;
      width: 350px !important;
    }
    .npf_ai_agents iframe#chatbox_frame {
      max-height: 460px !important;
      height: 460px !important;
    }
  }

  /* Mobile — column layout: WP on top, Niaa on bottom */
  @media (max-width: 480px) {
    #__eechatIcon {
      bottom: 15px !important;
      right: 15px !important;
    }
    #geta_widget {
      bottom: 80px !important;
      right: 15px !important;
    }
    .niaa-whatsapp-btn {
      bottom: 80px;
      right: 15px;
      width: 48px;
      height: 48px;
    }
    .niaa-whatsapp-btn svg {
      width: 27px;
      height: 27px;
    }
    .npf_ai_agents.active {
      bottom: 70px !important;
      right: 8px !important;
      left: 8px !important;
      max-height: 75vh !important;
      height: 75vh !important;
      max-width: none !important;
      width: auto !important;
    }
    .npf_ai_agents iframe#chatbox_frame {
      max-height: 75vh !important;
      height: 75vh !important;
    }
  }
`;

const NiaaChatbot = () => {
  // Defer the settings fetch + chatbot script injection until the browser is
  // idle. The floating chat widget is not part of the initial view, so loading
  // it during first paint only steals main-thread time and bandwidth from the
  // content that matters (LCP/TBT). requestIdleCallback (falling back to a
  // timeout) lets the home page settle first.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(() => setReady(true), { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchWidgetSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: ready,
  });

  const niaa = settings?.niaa;
  const whatsapp = settings?.whatsapp;

  // ── Inject shared styles once ──
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("niaa-wp-styles")) return;

    const style = document.createElement("style");
    style.id = "niaa-wp-styles";
    style.textContent = NIAA_STYLES;
    const nonce = getNonce?.();
    if (nonce) style.setAttribute("nonce", nonce);
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) document.head.removeChild(style);
    };
  }, []);

  // ── Niaa Chatbot script injection ──
  useEffect(() => {
    if (!niaa?.enabled || !niaa?.widget_id || !niaa?.script_url) return;
    if (typeof document === "undefined") return;

    // The agent script locates its mount point with
    // jQuery(".npf_ai_agents").data("w") — the class name and the data-w
    // attribute below are its contract, not ours. (The older generation of
    // this widget used .npf_chatbots; the current one never looks for it.)
    const container = document.createElement("div");
    container.className = "npf_ai_agents";
    container.setAttribute("data-w", niaa.widget_id);
    container.style.display = "none";
    document.body.appendChild(container);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = niaa.script_url;
    const nonce = getNonce?.();
    if (nonce) script.setAttribute("nonce", nonce);
    document.body.appendChild(script);

    // Strategy: Hide panel invisibly, wait for script to auto-open,
    // then programmatically click icon to close it. Remove the hide.
    // Now script is in "closed" state and user clicks work perfectly.
    container.classList.add("niaa-settling");

    const observer = new MutationObserver(() => {
      if (container.classList.contains("active")) {
        // Script auto-opened — click icon to close it (while invisible)
        observer.disconnect();
        const niaaIcon = document.getElementById("__eechatIcon");
        if (niaaIcon) {
          niaaIcon.click();
        }
        // Small delay then remove the invisibility
        setTimeout(() => {
          container.classList.remove("niaa-settling");
        }, 300);
      }
    });
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Fallback: if script never auto-opens within 15s, just remove settling
    const fallbackTimer = setTimeout(() => {
      observer.disconnect();
      container.classList.remove("niaa-settling");
    }, 15000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
      if (script.parentNode) document.body.removeChild(script);
      if (container.parentNode) document.body.removeChild(container);
    };
  }, [niaa?.enabled, niaa?.widget_id, niaa?.script_url]);

  // ── WhatsApp Button (only if enabled) ──
  const showWhatsApp = whatsapp?.enabled && whatsapp?.number;

  if (!showWhatsApp) return null;

  const waUrl = `https://wa.me/${whatsapp.number}${
    whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : ""
  }`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="niaa-whatsapp-btn"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 0C7.165 0 .003 7.16.003 16c0 2.822.736 5.577 2.136 8.004L0 32l8.188-2.088A15.93 15.93 0 0016.004 32C24.843 32 32 24.84 32 16S24.843 0 16.004 0zm0 29.39a13.36 13.36 0 01-6.817-1.864l-.488-.29-5.065 1.328 1.352-4.94-.318-.506A13.3 13.3 0 012.614 16c0-7.39 6.01-13.39 13.39-13.39S29.394 8.61 29.394 16s-6.01 13.39-13.39 13.39zm7.337-10.027c-.402-.201-2.378-1.174-2.747-1.308-.369-.134-.638-.201-.906.201-.268.402-1.04 1.308-1.275 1.576-.235.268-.47.302-.872.1-.402-.2-1.698-.625-3.234-1.995-1.195-1.066-2.002-2.382-2.236-2.784-.235-.402-.025-.62.176-.82.18-.18.402-.47.603-.704.201-.235.268-.402.402-.67.134-.268.067-.503-.033-.704-.1-.201-.906-2.184-1.241-2.99-.327-.784-.66-.678-.906-.69-.235-.012-.503-.015-.771-.015s-.704.1-1.073.503c-.369.402-1.408 1.375-1.408 3.356 0 1.98 1.441 3.893 1.642 4.161.201.268 2.836 4.331 6.874 6.073.96.415 1.71.663 2.295.849.964.306 1.842.263 2.535.16.773-.116 2.378-.972 2.714-1.911.335-.94.335-1.745.235-1.911-.1-.168-.369-.268-.771-.47z" />
      </svg>
    </a>
  );
};

export default NiaaChatbot;
