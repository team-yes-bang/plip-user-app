type ImageRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const DEFAULT_API_URL = "http://localhost:8000";
const LOCAL_OBJECTS_PATH = "/api/video/api/v1/local-objects/**";

function patternFromBaseUrl(baseUrl: string, pathname: string): ImageRemotePattern | null {
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname,
    };
  } catch {
    return null;
  }
}

/** next/image 허용 호스트 — video storage 모드에 맞춰 env에서 파생 */
export function buildImageRemotePatterns(): ImageRemotePattern[] {
  const patterns: ImageRemotePattern[] = [];

  const apiUrl = process.env.API_URL?.trim() || DEFAULT_API_URL;
  const localObjectsPattern = patternFromBaseUrl(apiUrl, LOCAL_OBJECTS_PATH);
  if (localObjectsPattern) {
    patterns.push(localObjectsPattern);
  }

  const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim();
  if (cdnBaseUrl) {
    const cdnPattern = patternFromBaseUrl(cdnBaseUrl, "/**");
    if (cdnPattern) {
      patterns.push(cdnPattern);
    }
  }

  return patterns;
}
