import { useEffect } from "react";

export const SEO_DEFAULT_TITLE =
  "Tide Focus | Focus timer for deep work and calmer workdays";

export const SEO_DEFAULT_DESCRIPTION =
  "Tide Focus is a focus timer for deep work with timer and stopwatch sessions, wave-based categories, ambient sound, and lightweight session review.";

type DocumentMetadata = {
  title?: string;
  description?: string;
  robots?: string;
  path?: string;
};

const upsertMetaTag = (
  selector: string,
  attributes: Record<string, string>
) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const upsertLinkTag = (
  selector: string,
  attributes: Record<string, string>
) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

export const useDocumentMetadata = ({
  title,
  description,
  robots,
  path,
}: DocumentMetadata) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMetaTag('meta[property="og:title"]', {
        property: "og:title",
        content: title,
      });
      upsertMetaTag('meta[name="twitter:title"]', {
        name: "twitter:title",
        content: title,
      });
    }

    if (description) {
      upsertMetaTag('meta[name="description"]', {
        name: "description",
        content: description,
      });
      upsertMetaTag('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
      upsertMetaTag('meta[name="twitter:description"]', {
        name: "twitter:description",
        content: description,
      });
    }

    if (robots) {
      upsertMetaTag('meta[name="robots"]', {
        name: "robots",
        content: robots,
      });
    }

    if (path) {
      const url = new URL(path, window.location.origin).toString();

      upsertMetaTag('meta[property="og:url"]', {
        property: "og:url",
        content: url,
      });
      upsertLinkTag('link[rel="canonical"]', {
        rel: "canonical",
        href: url,
      });
    }
  }, [description, path, robots, title]);
};
