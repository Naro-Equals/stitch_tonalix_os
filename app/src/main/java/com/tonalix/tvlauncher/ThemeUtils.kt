package com.tonalix.tvlauncher

import android.content.Context
import android.graphics.Color
import androidx.core.content.ContextCompat

object ThemeUtils {

    fun getAccentColor(context: Context, paletteName: String): Int {
        return when (paletteName.uppercase()) {
            "PURPLE" -> ContextCompat.getColor(context, R.color.theme_purple)
            "EMERALD" -> ContextCompat.getColor(context, R.color.theme_emerald)
            "SUNSET" -> ContextCompat.getColor(context, R.color.theme_sunset)
            "CRIMSON" -> ContextCompat.getColor(context, R.color.theme_crimson)
            "GOLD" -> ContextCompat.getColor(context, R.color.theme_gold)
            else -> ContextCompat.getColor(context, R.color.theme_cyan)
        }
    }

    fun getSecondaryColor(context: Context, paletteName: String): Int {
        return when (paletteName.uppercase()) {
            "PURPLE" -> Color.parseColor("#3B82F6") // Cyber Blue
            "EMERALD" -> Color.parseColor("#06B6D4") // Cyan
            "SUNSET" -> Color.parseColor("#EF4444") // Red
            "CRIMSON" -> Color.parseColor("#8B5CF6") // Violet
            "GOLD" -> Color.parseColor("#F97316") // Orange
            else -> Color.parseColor("#A855F7") // Purple
        }
    }
}
