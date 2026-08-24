"use client";

import { ROUTES } from "@/config/routes";
import {
  completeVideoAction,
  getDownloadUrlAction,
  getVideoAction,
  issueUploadUrlAction,
} from "@/actions/videoActions";
import {
  extractActionError,
  extractUploadUrlFromActionResult,
  extractVideoUuidFromActionResult,
} from "@/lib/video/actionPayload";
import { DEFAULT_UPLOAD_CONTENT_TYPE } from "@/lib/video/constants";
import { putPresignedUpload } from "@/lib/video/putPresigned";
import { useRef, useState } from "react";

type LogEntry = {
  id: number;
  label: string;
  payload: unknown;
};

type StatusMessage = {
  kind: "success" | "error";
  text: string;
};

export function VideoApiLabSection() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [videoUuid, setVideoUuid] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [putDone, setPutDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function appendLog(label: string, payload: unknown) {
    setLogs((prev) => [{ id: Date.now(), label, payload }, ...prev].slice(0, 10));
  }

  function applyActionResult(label: string, payload: unknown) {
    appendLog(label, payload);

    const nextVideoUuid = extractVideoUuidFromActionResult(payload);
    if (nextVideoUuid) {
      setVideoUuid(nextVideoUuid);
    }

    const nextUploadUrl = extractUploadUrlFromActionResult(payload);
    if (nextUploadUrl) {
      setUploadUrl(nextUploadUrl);
      setPutDone(false);
    }

    const error = extractActionError(payload);
    if (error) {
      setStatus({ kind: "error", text: error });
      return;
    }

    if (nextVideoUuid && label === "issueUploadUrlAction") {
      setStatus({
        kind: "success",
        text: `videoUuid·uploadUrl 준비됨. 2. mp4 선택 후 PUT 실행`,
      });
      return;
    }

    setStatus({ kind: "success", text: `${label} 성공` });
  }

  async function run(label: string, task: () => Promise<unknown>) {
    setBusy(true);
    setStatus(null);

    try {
      const result = await task();
      applyActionResult(label, result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      applyActionResult(label, { ok: false, error: message });
      return { ok: false as const, error: message };
    } finally {
      setBusy(false);
    }
  }

  async function handleIssueUploadUrl() {
    await run("issueUploadUrlAction", () => issueUploadUrlAction("video/mp4"));
  }

  async function handlePutToS3() {
    if (!uploadUrl.trim()) {
      applyActionResult("putPresignedUpload", {
        ok: false,
        error: "uploadUrl이 비어 있습니다. 1. upload-url을 먼저 실행하세요.",
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      applyActionResult("putPresignedUpload", {
        ok: false,
        error: "mp4/mov 파일을 선택하세요.",
      });
      return;
    }

    setBusy(true);
    setStatus(null);

    try {
      const result = await putPresignedUpload(
        uploadUrl.trim(),
        file,
        DEFAULT_UPLOAD_CONTENT_TYPE,
      );
      appendLog("putPresignedUpload", { ok: true, data: { result } });
      setPutDone(true);
      setStatus({ kind: "success", text: `S3 PUT 성공 (${result})` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      appendLog("putPresignedUpload", { ok: false, error: message });
      setStatus({ kind: "error", text: message });
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    if (!videoUuid.trim()) {
      applyActionResult("completeVideoAction", {
        ok: false,
        error: "videoUuid가 비어 있습니다. 1. upload-url을 먼저 실행하세요.",
      });
      return;
    }

    if (!putDone) {
      applyActionResult("completeVideoAction", {
        ok: false,
        error: "2. PUT을 먼저 실행하세요. complete는 S3에 파일이 있어야 합니다.",
      });
      return;
    }

    await run("completeVideoAction", () =>
      completeVideoAction(videoUuid.trim(), "Phase 0-F lab caption"),
    );
  }

  async function handleGetVideo() {
    if (!videoUuid.trim()) {
      applyActionResult("getVideoAction", {
        ok: false,
        error: "videoUuid가 비어 있습니다.",
      });
      return;
    }

    await run("getVideoAction", () => getVideoAction(videoUuid.trim()));
  }

  async function handleGetDownloadUrl() {
    if (!videoUuid.trim()) {
      applyActionResult("getDownloadUrlAction", {
        ok: false,
        error: "videoUuid가 비어 있습니다.",
      });
      return;
    }

    await run("getDownloadUrlAction", () => getDownloadUrlAction(videoUuid.trim()));
  }

  const putDisabled = busy || uploadUrl.trim().length === 0;
  const completeDisabled = busy || !putDone;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6 font-mono text-sm">
      <header>
        <h1 className="text-lg font-semibold">Video API Lab (Day 1)</h1>
        <p className="text-black/60">
          로그인 필수. Server Actions는 세션 JWT의 userUuid만 사용합니다.
        </p>
        <p className="text-xs text-black/50">
          순서: upload-url → S3 PUT → complete → GET detail → GET download-url. 촬영 UI는{" "}
          <a href={ROUTES.capture.video} className="underline">
            {ROUTES.capture.video}
          </a>
          .
        </p>
      </header>

      {status ? (
        <p
          className={`rounded px-3 py-2 text-xs ${
            status.kind === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
          role="status"
        >
          {status.text}
        </p>
      ) : null}

      <label className="flex flex-col gap-1">
        <span>videoUuid</span>
        <input
          className="rounded border px-3 py-2"
          value={videoUuid}
          onChange={(event) => setVideoUuid(event.target.value)}
          placeholder="1. upload-url 클릭 시 자동 입력"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>2. PUT용 mp4/mov</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="text-xs"
          disabled={putDisabled}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={busy}
          onClick={handleIssueUploadUrl}
        >
          1. upload-url
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={putDisabled}
          onClick={handlePutToS3}
        >
          2. PUT S3
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={completeDisabled}
          onClick={handleComplete}
        >
          3. complete
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={busy}
          onClick={handleGetVideo}
        >
          4. GET detail
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2 disabled:opacity-50"
          disabled={busy}
          onClick={handleGetDownloadUrl}
        >
          5. GET download-url
        </button>
      </div>

      <p className="text-xs text-black/50">
        download-url은 가공 전이면 202 PROCESSING이 정상입니다. PUT stub(AWS_ENABLED=false)이면
        skipped-stub 후 complete 가능합니다.
      </p>

      <ol className="list-decimal space-y-2 pl-5 text-black/70">
        {logs.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.label}</strong>
            <pre className="mt-1 overflow-x-auto rounded bg-black/5 p-2 text-xs">
              {JSON.stringify(entry.payload, null, 2)}
            </pre>
          </li>
        ))}
      </ol>
    </section>
  );
}
