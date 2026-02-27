import { useEffect } from "react";

declare global {
  interface Window {
    ymConfig?: Record<string, string>;
    YellowMessenger?: any;
    attachEvent?: (event: string, fn: () => void) => void;
  }
}

export default function YellowAiChatbot() {
  useEffect(() => {
    // Skip if already loaded
    if (window.YellowMessenger && typeof window.YellowMessenger === "function") {
      window.YellowMessenger("reattach_activator");
      window.YellowMessenger("update", window.ymConfig);
      return;
    }

    window.ymConfig = {
      bot: "x1770380239009",
      host: "https://r4.cloud.yellow.ai",
    };

    const i: any = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (e: any) {
      i.q.push(e);
    };
    window.YellowMessenger = i;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js";
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  return null;
}
