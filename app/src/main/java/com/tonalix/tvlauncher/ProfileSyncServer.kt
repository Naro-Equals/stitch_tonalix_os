package com.tonalix.tvlauncher

import android.util.Log
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * Servidor LAN efímero para sync de perfil vía QR (token + AES).
 * El QR solo lleva IP, puerto, token y clave — no el JSON completo.
 */
class ProfileSyncServer(
    private val port: Int = 8091
) {
    companion object {
        private const val TAG = "ProfileSyncServer"
        private const val TTL_MS = 5 * 60 * 1000L
    }

    private var serverSocket: ServerSocket? = null
    private val isRunning = AtomicBoolean(false)
    private val executor = Executors.newCachedThreadPool()
    private val session = AtomicReference<SyncSession?>(null)

    data class SyncSession(
        val token: String,
        val keyBase64: String,
        val encryptedPayload: String,
        val createdAt: Long = System.currentTimeMillis()
    ) {
        fun isExpired(): Boolean = System.currentTimeMillis() - createdAt > TTL_MS
    }

    fun startWithPayload(plainJson: String): SyncSession? {
        val token = ProfileSyncCrypto.newToken()
        val key = ProfileSyncCrypto.newKeyBase64()
        val encrypted = ProfileSyncCrypto.encrypt(plainJson, key)
        val sync = SyncSession(token, key, encrypted)
        session.set(sync)

        if (isRunning.get()) return sync

        return try {
            serverSocket = ServerSocket(port)
            isRunning.set(true)
            executor.execute {
                while (isRunning.get() && serverSocket != null && !serverSocket!!.isClosed) {
                    try {
                        val client = serverSocket!!.accept()
                        executor.execute { handleClient(client) }
                    } catch (e: Exception) {
                        if (isRunning.get()) Log.w(TAG, "accept: ${e.message}")
                    }
                }
            }
            Log.i(TAG, "Profile sync server on $port")
            sync
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start sync server", e)
            session.set(null)
            null
        }
    }

    fun stop() {
        isRunning.set(false)
        session.set(null)
        try {
            serverSocket?.close()
        } catch (_: Exception) {
        }
        serverSocket = null
        executor.shutdownNow()
    }

    fun buildQrPayload(ip: String, sync: SyncSession): String {
        return "tonalix://sync?h=$ip&p=$port&t=${sync.token}&k=${sync.keyBase64}"
    }

    fun buildHttpUrl(ip: String, sync: SyncSession): String {
        return "http://$ip:$port/?t=${sync.token}&k=${sync.keyBase64}"
    }

    private fun handleClient(socket: Socket) {
        try {
            socket.soTimeout = 12000
            val input = BufferedInputStream(socket.getInputStream())
            val output = BufferedOutputStream(socket.getOutputStream())

            val headerBytes = ByteArrayOutputStream()
            var prev1 = -1
            var prev2 = -1
            var prev3 = -1
            var b: Int
            while (input.read().also { b = it } != -1) {
                headerBytes.write(b)
                if (prev3 == '\r'.code && prev2 == '\n'.code && prev1 == '\r'.code && b == '\n'.code) break
                prev3 = prev2
                prev2 = prev1
                prev1 = b
            }

            val headerStr = headerBytes.toString("UTF-8")
            val requestLine = headerStr.lineSequence().firstOrNull().orEmpty()
            val method = requestLine.substringBefore(" ")
            val uri = requestLine.substringAfter(" ").substringBefore(" ")

            val current = session.get()
            if (current == null || current.isExpired()) {
                writeText(output, 410, "text/plain", "Sesión expirada")
                return
            }

            if (!method.equals("GET", true)) {
                writeText(output, 405, "text/plain", "Method not allowed")
                return
            }

            when {
                uri.startsWith("/sync/profile") -> {
                    val q = uri.substringAfter("?", "")
                    val params = q.split("&").associate {
                        val parts = it.split("=", limit = 2)
                        parts[0] to parts.getOrElse(1) { "" }
                    }
                    val t = params["t"].orEmpty()
                    if (t != current.token) {
                        writeText(output, 403, "text/plain", "Token inválido")
                        return
                    }
                    val body = JSONObject()
                        .put("v", 1)
                        .put("payload", current.encryptedPayload)
                        .toString()
                    writeText(output, 200, "application/json", body)
                    // One-time use
                    session.set(null)
                }
                else -> writeHtml(output, current)
            }
        } catch (e: Exception) {
            Log.w(TAG, "client error", e)
        } finally {
            try {
                socket.close()
            } catch (_: Exception) {
            }
        }
    }

    private fun writeHtml(output: BufferedOutputStream, sync: SyncSession) {
        val html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <title>Tonalix TV · Sync perfil</title>
              <style>
                body{margin:0;font-family:system-ui,sans-serif;background:#0B1120;color:#F8FAFC;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
                .card{max-width:440px;width:100%;background:rgba(30,41,59,.75);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:24px}
                h1{color:#00E5FF;font-size:22px;margin:0 0 8px}
                p{color:#94A3B8;font-size:14px;line-height:1.45}
                button{width:100%;margin-top:16px;border:0;border-radius:12px;padding:14px;font-weight:700;background:linear-gradient(135deg,#00E5FF,#0091EA);color:#0B1120}
                pre{margin-top:12px;white-space:pre-wrap;word-break:break-all;font-size:11px;background:#020617;padding:12px;border-radius:10px;color:#CBD5E1}
                .ok{color:#22C55E}.err{color:#EF4444}
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Sync de perfil</h1>
                <p>Descarga el perfil cifrado de esta TV. En otra Tonalix TV usa <b>Importar perfil</b> y pega el JSON descifrado o el código QR.</p>
                <button onclick="downloadProfile()">Descargar perfil cifrado</button>
                <p id="status"></p>
                <pre id="out" hidden></pre>
              </div>
              <script>
                async function downloadProfile(){
                  const status=document.getElementById('status');
                  const out=document.getElementById('out');
                  status.textContent='Descargando…';
                  try{
                    const res=await fetch('/sync/profile?t=${sync.token}');
                    if(!res.ok) throw new Error('HTTP '+res.status);
                    const data=await res.json();
                    out.hidden=false;
                    out.textContent=JSON.stringify(data);
                    const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
                    const a=document.createElement('a');
                    a.href=URL.createObjectURL(blob);
                    a.download='tonalix-profile-sync.json';
                    a.click();
                    status.className='ok';
                    status.textContent='Listo. Ábrelo en la otra TV o pégalo en Importar.';
                  }catch(e){
                    status.className='err';
                    status.textContent='Error: '+e.message;
                  }
                }
              </script>
            </body>
            </html>
        """.trimIndent()
        writeText(output, 200, "text/html; charset=utf-8", html)
    }

    private fun writeText(output: BufferedOutputStream, code: Int, contentType: String, body: String) {
        val bytes = body.toByteArray(Charsets.UTF_8)
        val status = when (code) {
            200 -> "OK"
            403 -> "Forbidden"
            405 -> "Method Not Allowed"
            410 -> "Gone"
            else -> "Error"
        }
        val header = "HTTP/1.1 $code $status\r\n" +
            "Content-Type: $contentType\r\n" +
            "Content-Length: ${bytes.size}\r\n" +
            "Connection: close\r\n\r\n"
        output.write(header.toByteArray(Charsets.UTF_8))
        output.write(bytes)
        output.flush()
    }
}
