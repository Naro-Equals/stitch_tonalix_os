package com.tonalix.tvlauncher

import android.content.Context
import android.util.Log
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class QrWallpaperServer(
    private val context: Context,
    private val port: Int = 8090
) {
    companion object {
        private const val TAG = "QrWallpaperServer"
    }

    private var serverSocket: ServerSocket? = null
    private val isRunning = AtomicBoolean(false)
    private val executor = Executors.newFixedThreadPool(4)
    private var onWallpaperListener: ((File) -> Unit)? = null

    fun start(onWallpaperReceived: (File) -> Unit): Boolean {
        if (isRunning.get()) return true
        onWallpaperListener = onWallpaperReceived

        return try {
            serverSocket = ServerSocket(port)
            isRunning.set(true)

            executor.execute {
                while (isRunning.get() && serverSocket != null && !serverSocket!!.isClosed) {
                    try {
                        val client = serverSocket!!.accept()
                        executor.execute { handleClient(client) }
                    } catch (e: Exception) {
                        if (isRunning.get()) {
                            Log.w(TAG, "Socket accept error: ${e.message}")
                        }
                    }
                }
            }
            Log.i(TAG, "QR Wallpaper Server started on port $port")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start server on port $port", e)
            false
        }
    }

    fun stop() {
        isRunning.set(false)
        try {
            serverSocket?.close()
        } catch (_: Exception) {}
        serverSocket = null
        executor.shutdownNow()
        Log.i(TAG, "QR Wallpaper Server stopped")
    }

    private fun handleClient(socket: Socket) {
        try {
            socket.soTimeout = 15000
            val input = BufferedInputStream(socket.getInputStream())
            val output = BufferedOutputStream(socket.getOutputStream())

            // Read HTTP request header
            val headerBytes = ByteArrayOutputStream()
            var prev1 = -1
            var prev2 = -1
            var prev3 = -1
            var b: Int

            while (input.read().also { b = it } != -1) {
                headerBytes.write(b)
                if (prev3 == '\r'.code && prev2 == '\n'.code && prev1 == '\r'.code && b == '\n'.code) {
                    break // Reached \r\n\r\n (end of HTTP headers)
                }
                prev3 = prev2
                prev2 = prev1
                prev1 = b
            }

            val headerStr = headerBytes.toString("UTF-8")
            val lines = headerStr.split("\r\n")
            if (lines.isEmpty()) {
                socket.close()
                return
            }

            val requestLine = lines[0]
            val method = requestLine.substringBefore(" ")
            val uri = requestLine.substringAfter(" ").substringBefore(" ")

            var contentLength = 0
            var isMultipart = false
            var boundary = ""

            for (line in lines) {
                val lower = line.lowercase()
                if (lower.startsWith("content-length:")) {
                    contentLength = line.substringAfter(":").trim().toIntOrNull() ?: 0
                }
                if (lower.startsWith("content-type:") && lower.contains("multipart/form-data")) {
                    isMultipart = true
                    val bIndex = line.indexOf("boundary=")
                    if (bIndex != -1) {
                        boundary = line.substring(bIndex + 9).trim().trim('"')
                    }
                }
            }

            if (method.equals("GET", ignoreCase = true)) {
                sendHtmlResponse(output)
            } else if (method.equals("POST", ignoreCase = true) && uri.startsWith("/upload")) {
                handleUpload(input, output, contentLength, isMultipart, boundary)
            } else {
                val notFound = "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n"
                output.write(notFound.toByteArray())
                output.flush()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error handling client request", e)
        } finally {
            try { socket.close() } catch (_: Exception) {}
        }
    }

    private fun sendHtmlResponse(output: BufferedOutputStream) {
        val html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <title>Tonalix TV • Enviar Fondo de Pantalla</title>
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                body { background: #0B1120; color: #F8FAFC; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
                .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                h1 { font-size: 24px; font-weight: 700; color: #00E5FF; margin-bottom: 8px; }
                p.sub { font-size: 14px; color: #94A3B8; margin-bottom: 24px; }
                .upload-box { border: 2px dashed rgba(0, 229, 255, 0.4); border-radius: 16px; padding: 32px 16px; cursor: pointer; transition: all 0.2s; background: rgba(15, 23, 42, 0.5); }
                .upload-box:hover { border-color: #00E5FF; background: rgba(0, 229, 255, 0.05); }
                .preview-img { max-width: 100%; max-height: 240px; border-radius: 12px; margin-top: 16px; display: none; object-fit: cover; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
                .btn { background: linear-gradient(135deg, #00E5FF 0%, #0091EA 100%); color: #0B1120; font-size: 16px; font-weight: 700; border: none; border-radius: 14px; padding: 14px 28px; width: 100%; margin-top: 20px; cursor: pointer; display: none; transition: transform 0.1s; }
                .btn:active { transform: scale(0.98); }
                .status { margin-top: 16px; font-size: 14px; font-weight: 600; display: none; }
                .status.success { color: #22C55E; }
                .status.error { color: #EF4444; }
                .loader { display: none; width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.2); border-radius: 50%; border-top-color: #00E5FF; animation: spin 0.8s linear infinite; margin: 16px auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>📺 Tonalix TV</h1>
                <p class="sub">Envía cualquier imagen desde tu móvil para colocarla instantáneamente como fondo de pantalla en tu TV.</p>

                <div class="upload-box" onclick="document.getElementById('fileInput').click()">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p style="font-size: 15px; font-weight: 600;">Toca para seleccionar imagen</p>
                  <p style="font-size: 12px; color: #64748B; margin-top: 4px;">JPG, PNG, WEBP (Recomendado 1920x1080 o superior)</p>
                </div>
                <input type="file" id="fileInput" accept="image/*" style="display:none" onchange="previewFile(event)">

                <img id="preview" class="preview-img" alt="Vista previa">
                <div id="loader" class="loader"></div>
                <button id="sendBtn" class="btn" onclick="uploadWallpaper()">✨ Establecer en la TV</button>
                <div id="status" class="status"></div>
              </div>

              <script>
                let selectedFile = null;
                function previewFile(e) {
                  const file = e.target.files[0];
                  if (!file) return;
                  selectedFile = file;
                  const reader = new FileReader();
                  reader.onload = function(evt) {
                    const img = document.getElementById('preview');
                    img.src = evt.target.result;
                    img.style.display = 'block';
                    document.getElementById('sendBtn').style.display = 'block';
                    document.getElementById('status').style.display = 'none';
                  };
                  reader.readAsDataURL(file);
                }

                function uploadWallpaper() {
                  if (!selectedFile) return;
                  const btn = document.getElementById('sendBtn');
                  const loader = document.getElementById('loader');
                  const status = document.getElementById('status');
                  btn.style.display = 'none';
                  loader.style.display = 'block';
                  status.style.display = 'none';

                  fetch('/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': selectedFile.type || 'image/jpeg' },
                    body: selectedFile
                  })
                  .then(res => res.json())
                  .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                      status.className = 'status success';
                      status.innerText = '🎉 ¡Fondo aplicado con éxito en tu televisor!';
                      status.style.display = 'block';
                    } else {
                      status.className = 'status error';
                      status.innerText = '❌ Error al aplicar: ' + (data.error || 'Intenta de nuevo');
                      status.style.display = 'block';
                      btn.style.display = 'block';
                    }
                  })
                  .catch(err => {
                    loader.style.display = 'none';
                    status.className = 'status error';
                    status.innerText = '❌ Error de conexión con la TV';
                    status.style.display = 'block';
                    btn.style.display = 'block';
                  });
                }
              </script>
            </body>
            </html>
        """.trimIndent()

        val bytes = html.toByteArray(Charsets.UTF_8)
        val header = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: text/html; charset=UTF-8\r\n" +
                "Content-Length: ${bytes.size}\r\n" +
                "Connection: close\r\n\r\n"
        output.write(header.toByteArray())
        output.write(bytes)
        output.flush()
    }

    private fun handleUpload(
        input: BufferedInputStream,
        output: BufferedOutputStream,
        contentLength: Int,
        isMultipart: Boolean,
        boundary: String
    ) {
        val targetFile = File(context.filesDir, "custom_wallpaper.jpg")
        val tempFile = File(context.filesDir, "temp_upload.tmp")

        try {
            val fos = FileOutputStream(tempFile)
            val buffer = ByteArray(8192)
            var bytesRemaining = contentLength

            while (bytesRemaining > 0) {
                val toRead = minOf(buffer.size, bytesRemaining)
                val read = input.read(buffer, 0, toRead)
                if (read == -1) break
                fos.write(buffer, 0, read)
                bytesRemaining -= read
            }
            fos.flush()
            fos.close()

            // If it's multipart form-data, strip multipart boundary headers
            val finalFile = if (isMultipart && boundary.isNotEmpty()) {
                extractFromMultipart(tempFile, targetFile, boundary)
            } else {
                if (targetFile.exists()) targetFile.delete()
                tempFile.renameTo(targetFile)
                targetFile
            }

            if (finalFile.exists() && finalFile.length() > 1000) {
                // Success: Notify UI
                onWallpaperListener?.invoke(finalFile)

                val jsonResponse = "{\"success\":true,\"message\":\"Wallpaper updated\"}"
                val responseBytes = jsonResponse.toByteArray(Charsets.UTF_8)
                val responseHeader = "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: application/json; charset=UTF-8\r\n" +
                        "Content-Length: ${responseBytes.size}\r\n" +
                        "Access-Control-Allow-Origin: *\r\n" +
                        "Connection: close\r\n\r\n"
                output.write(responseHeader.toByteArray())
                output.write(responseBytes)
                output.flush()
            } else {
                sendErrorResponse(output, "Invalid image payload")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error saving uploaded wallpaper", e)
            sendErrorResponse(output, e.localizedMessage ?: "Upload failed")
        } finally {
            if (tempFile.exists()) tempFile.delete()
        }
    }

    private fun extractFromMultipart(source: File, destination: File, boundary: String): File {
        val bytes = source.readBytes()
        val boundaryHeader = "--$boundary".toByteArray(Charsets.US_ASCII)
        val headerEnd = "\r\n\r\n".toByteArray(Charsets.US_ASCII)

        // Find header end after boundary
        var bodyStartIndex = -1
        for (i in 0 until bytes.size - 4) {
            if (bytes[i] == headerEnd[0] && bytes[i + 1] == headerEnd[1] &&
                bytes[i + 2] == headerEnd[2] && bytes[i + 3] == headerEnd[3]
            ) {
                bodyStartIndex = i + 4
                break
            }
        }

        if (bodyStartIndex == -1) {
            source.copyTo(destination, overwrite = true)
            return destination
        }

        // Find closing boundary
        var bodyEndIndex = bytes.size
        for (i in bodyStartIndex until bytes.size - boundaryHeader.size) {
            var match = true
            for (j in boundaryHeader.indices) {
                if (bytes[i + j] != boundaryHeader[j]) {
                    match = false
                    break
                }
            }
            if (match) {
                bodyEndIndex = i - 2 // strip \r\n before boundary
                break
            }
        }

        val imageBytes = bytes.copyOfRange(bodyStartIndex, bodyEndIndex.coerceAtLeast(bodyStartIndex))
        destination.writeBytes(imageBytes)
        return destination
    }

    private fun sendErrorResponse(output: BufferedOutputStream, message: String) {
        val json = "{\"success\":false,\"error\":\"$message\"}"
        val bytes = json.toByteArray(Charsets.UTF_8)
        val header = "HTTP/1.1 400 Bad Request\r\n" +
                "Content-Type: application/json\r\n" +
                "Content-Length: ${bytes.size}\r\n" +
                "Connection: close\r\n\r\n"
        output.write(header.toByteArray())
        output.write(bytes)
        output.flush()
    }
}
