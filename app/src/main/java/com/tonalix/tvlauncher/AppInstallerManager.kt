package com.tonalix.tvlauncher

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File

class AppInstallerManager(private val context: Context) {

    companion object {
        private const val TAG = "AppInstallerManager"
    }

    private val client = OkHttpClient()

    fun getRecommendedApps(deviceInfo: DeviceProfiler.DeviceInfo): List<RecommendedApp> {
        val list = mutableListOf<RecommendedApp>()

        // Universal TV Apps
        list.add(
            RecommendedApp(
                name = "SmartTube Next",
                packageName = "org.smarttube.tv",
                description = "Cliente YouTube para Android TV sin anuncios ni patrocinadores con SponsorBlock integrados.",
                downloadUrl = "https://github.com/yuliskov/SmartTube/releases/download/latest/smarttube_stable.apk",
                category = "Streaming / Universal TV",
                iconUrl = "https://raw.githubusercontent.com/yuliskov/SmartTube/master/common/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
            )
        )

        list.add(
            RecommendedApp(
                name = "VLC Media Player TV",
                packageName = "org.videolan.vlc",
                description = "Reproductor multimedia universal de código abierto compatible con todos los formatos de video.",
                downloadUrl = "https://get.videolan.org/vlc-android/3.5.4/VLC-Android-3.5.4-arm64-v8a.apk",
                category = "Multimedia / Universal TV",
                iconUrl = "https://images.videolan.org/images/icons-VLC/vlc.png"
            )
        )

        list.add(
            RecommendedApp(
                name = "Kodi TV Matrix",
                packageName = "org.xbmc.kodi",
                description = "Centro multimedia completo para streaming local e iptv en pantallas de gran tamaño.",
                downloadUrl = "https://mirrors.kodi.tv/releases/android/arm64-v8a/kodi-20.2-Nexus-arm64-v8a.apk",
                category = "Centro Multimedia",
                iconUrl = "https://kodi.tv/images/kodi-logo.png"
            )
        )

        // Gaming / Emulators (Para TV Stick de juegos)
        list.add(
            RecommendedApp(
                name = "RetroArch TV",
                packageName = "com.retroarch",
                description = "Centro de emulación integral para juegos retro (PSX, N64, SNES, Arcade) con soporte de mandos.",
                downloadUrl = "https://buildbot.libretro.com/stable/1.19.1/android/RetroArch_ra32.apk",
                category = "🎮 Juegos / Emuladores TV",
                iconUrl = "https://www.retroarch.com/images/retroarch-logo.png"
            )
        )

        list.add(
            RecommendedApp(
                name = "PPSSPP - PSP Emulator TV",
                packageName = "com.ppsspp.ppsspp",
                description = "Emulador de PlayStation Portable de alto rendimiento a 1080p y 60 FPS con mando bluetooth.",
                downloadUrl = "https://www.ppsspp.org/files/1_17_1/ppsspp.apk",
                category = "🎮 Juegos / Emuladores TV",
                iconUrl = "https://www.ppsspp.org/img/icon-512.png"
            )
        )

        list.add(
            RecommendedApp(
                name = "Moonlight Game Streaming",
                packageName = "com.limelight",
                description = "Transmite juegos de tu PC con tarjeta NVIDIA/AMD a tu TV Stick a 60/120 FPS sin latencia.",
                downloadUrl = "https://github.com/moonlight-stream/moonlight-android/releases/download/v12.1/moonlight-android-v12.1.apk",
                category = "🎮 Juegos / Cloud Streaming",
                iconUrl = "https://raw.githubusercontent.com/moonlight-stream/moonlight-android/master/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
            )
        )

        list.add(
            RecommendedApp(
                name = "Steam Link TV",
                packageName = "com.valvesoftware.steamlink",
                description = "Juega a tus títulos de Steam desde el sofá de tu salón transmitiendo directo a tu TV.",
                downloadUrl = "https://media.steampowered.com/apps/steamlink/android/steamlink-android.apk",
                category = "🎮 Juegos / Cloud Streaming"
            )
        )

        // Fire TV Exclusive Remap Tool
        if (deviceInfo.isFireTv) {
            list.add(
                0, // Priority on top
                RecommendedApp(
                    name = "Launcher Manager (Fire TV)",
                    packageName = "de.d4mi.firetv.launchermanager",
                    description = "Herramienta especializada para remapear botones y fijar Tonalix TV como launcher por defecto en FireOS.",
                    downloadUrl = "https://github.com/Tonalix/TVLauncher/releases/download/v1.0/LauncherManagerFireTV.apk",
                    category = "Exclusivo FireOS",
                    targetEcosystem = DeviceProfiler.Ecosystem.AMAZON_FIRE_OS
                )
            )
        }

        // AOSP Projectors Tools
        if (deviceInfo.isAospProjector) {
            list.add(
                RecommendedApp(
                    name = "Keystone & Input Quick Switcher",
                    packageName = "com.softwinner.projectortools",
                    description = "Utilidad rápida para ajuste trapezoidal y cambio de fuentes HDMI en proyectores AOSP.",
                    downloadUrl = "https://github.com/Tonalix/TVLauncher/releases/download/v1.0/ProjectorTools.apk",
                    category = "Exclusivo Proyectores AOSP",
                    targetEcosystem = DeviceProfiler.Ecosystem.AOSP_GENERIC
                )
            )
        }

        return list
    }

    suspend fun downloadAndInstallApk(
        url: String,
        fileName: String,
        onProgress: (Int) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder().url(url).build()
            val response = client.newCall(request).execute()

            if (!response.isSuccessful) {
                Log.e(TAG, "Download HTTP error code: ${response.code}")
                return@withContext false
            }

            val body = response.body ?: return@withContext false
            val contentLength = body.contentLength()

            val apkFile = File(context.cacheDir, fileName)
            if (apkFile.exists()) apkFile.delete()

            body.byteStream().use { input ->
                apkFile.outputStream().use { output ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    var totalRead = 0L

                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        totalRead += bytesRead
                        if (contentLength > 0) {
                            val progress = ((totalRead * 100) / contentLength).toInt()
                            withContext(Dispatchers.Main) {
                                onProgress(progress)
                            }
                        }
                    }
                }
            }

            withContext(Dispatchers.Main) {
                installApk(context, apkFile)
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading or installing APK", e)
            false
        }
    }

    fun installApk(context: Context, apkFile: File) {
        if (!apkFile.exists()) return

        val apkUri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            apkFile
        )

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}