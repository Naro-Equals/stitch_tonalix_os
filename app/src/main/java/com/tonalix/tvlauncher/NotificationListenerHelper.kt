package com.tonalix.tvlauncher

import android.app.Notification
import android.graphics.Bitmap
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * Service that reads active media notifications and sessions on Android TV / AOSP / FireOS
 * for instant Spotify and YouTube track detection (Proyectivy style).
 */
class NotificationListenerHelper : NotificationListenerService() {
    companion object {
        private const val TAG = "NotificationListener"
        var activeMediaListener: ((String, String, Bitmap?, String) -> Unit)? = null
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        try {
            if (sbn == null) return
            val pkg = sbn.packageName ?: return
            val isMediaApp = pkg.contains("spotify") ||
                    pkg.contains("youtube") ||
                    pkg.contains("vlc") ||
                    pkg.contains("kodi") ||
                    pkg.contains("music") ||
                    pkg.contains("pandora") ||
                    pkg.contains("amazon") ||
                    pkg.contains("netflix") ||
                    pkg.contains("disney")

            if (isMediaApp) {
                val extras = sbn.notification.extras
                val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
                val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
                val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()

                val artist = subText ?: text ?: "Reproduciendo"
                val songTitle = title ?: "Música / Streaming"

                var bitmap: Bitmap? = null
                try {
                    bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        extras.getParcelable(Notification.EXTRA_LARGE_ICON, Bitmap::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        extras.getParcelable(Notification.EXTRA_LARGE_ICON) as? Bitmap
                    }
                } catch (_: Exception) {}

                if (songTitle.isNotBlank()) {
                    activeMediaListener?.invoke(songTitle, artist, bitmap, pkg)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error parsing notification media: ${e.message}")
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "Notification listener connected - Media and notifications unlocked")
    }
}
