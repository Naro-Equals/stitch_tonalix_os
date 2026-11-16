package com.tonalix.tvlauncher

import android.graphics.drawable.Drawable

data class AppInfo(
    val appName: String,
    val packageName: String,
    val icon: Drawable?,
    val isSystemApp: Boolean = false
)

data class RecommendedApp(
    val name: String,
    val packageName: String,
    val description: String,
    val downloadUrl: String,
    val category: String, // e.g., "Especial FireOS", "Universal TV", "Proyector / AOSP"
    val targetEcosystem: DeviceProfiler.Ecosystem? = null,
    val iconResId: Int = R.drawable.ic_apps,
    val iconUrl: String? = null
)

data class SecurityAuditItem(
    val appName: String,
    val packageName: String,
    val icon: Drawable?,
    val permissions: List<String>,
    val riskLevel: String // "ALTO", "MEDIO", "INFORMACIÓN"
)