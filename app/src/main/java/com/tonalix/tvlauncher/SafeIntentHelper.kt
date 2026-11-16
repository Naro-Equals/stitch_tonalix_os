package com.tonalix.tvlauncher

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.widget.Toast
import android.util.Log

object SafeIntentHelper {
    private const val TAG = "SafeIntentHelper"

    fun safeStart(context: Context, intent: Intent, fallbackMessage: String = "Función no disponible en este dispositivo") {
        try {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            val resolveInfo = context.packageManager.resolveActivity(intent, 0)
            if (resolveInfo != null) {
                context.startActivity(intent)
            } else {
                Log.w(TAG, "Activity not resolved for intent: ${intent.action}, falling back to general settings.")
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(fallbackIntent)
                Toast.makeText(context, fallbackMessage, Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting intent safely", e)
            try {
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(fallbackIntent)
            } catch (_: Exception) {
                Toast.makeText(context, "Error al abrir la configuración: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
