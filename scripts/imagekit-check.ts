/**
 * Kiểm tra kết nối ImageKit:  npm run imagekit:check
 * Tải một ảnh 1×1 thử lên → mở lại qua URL công khai → xóa ảnh thử.
 * Đọc IMAGEKIT_* từ .env.local (qua cờ --env-file trong package.json).
 */
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
const missing = [!privateKey && "IMAGEKIT_PRIVATE_KEY", !endpoint && "IMAGEKIT_URL_ENDPOINT"].filter(Boolean);
if (missing.length > 0) {
  console.error(`✗ Thiếu biến môi trường: ${missing.join(", ")} — xem docs/setup.md`);
  process.exit(1);
}
if (privateKey!.startsWith("public_")) {
  console.error("✗ IMAGEKIT_PRIVATE_KEY đang là PUBLIC key (bắt đầu bằng public_). Hãy dán Private key (bắt đầu bằng private_).");
  process.exit(1);
}

const auth = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
// Ảnh PNG 1×1 trong suốt
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

async function main() {
  const form = new FormData();
  form.append("file", new Blob([PNG], { type: "image/png" }), "kiem-tra.png");
  form.append("fileName", "kiem-tra.png");
  form.append("folder", "/webbanhang/healthcheck");
  form.append("useUniqueFileName", "true");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", headers: { Authorization: auth }, body: form });
  const data = (await res.json()) as { fileId?: string; url?: string; message?: string };
  if (!res.ok || !data.fileId || !data.url) {
    console.error(`✗ Tải ảnh thử thất bại (HTTP ${res.status}): ${data.message ?? "không rõ"}`);
    if (res.status === 401 || res.status === 403) console.error("  → Sai IMAGEKIT_PRIVATE_KEY.");
    process.exit(1);
  }
  console.log("✓ Tải ảnh thử lên ImageKit thành công");

  try {
    if (!data.url.startsWith(endpoint!.replace(/\/+$/, ""))) {
      console.warn(`! URL ảnh (${data.url}) không bắt đầu bằng IMAGEKIT_URL_ENDPOINT (${endpoint}) — kiểm tra lại URL endpoint.`);
      process.exitCode = 1;
    }
    const view = await fetch(data.url);
    if (view.ok) console.log(`✓ Mở được ảnh qua URL công khai: ${endpoint}`);
    else {
      console.warn(`! Không mở được ${data.url} (HTTP ${view.status})`);
      process.exitCode = 1;
    }
  } finally {
    const del = await fetch(`https://api.imagekit.io/v1/files/${data.fileId}`, { method: "DELETE", headers: { Authorization: auth } });
    console.log(del.ok ? "✓ Đã xóa ảnh thử" : `! Không xóa được ảnh thử (HTTP ${del.status}) — có thể xóa tay trong Media Library`);
  }
}

main().catch((error: unknown) => {
  console.error("✗ Lỗi:", error instanceof Error ? error.message : error);
  process.exit(1);
});
