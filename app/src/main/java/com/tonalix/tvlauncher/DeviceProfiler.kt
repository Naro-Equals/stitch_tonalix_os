package com.tonalix.tvlauncher

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.bumptech.glide.GlideBuilder
import com.bumptech.glide.annotation.GlideModule
import com.bumptech.glide.load.DecodeFormat
import com.bumptech.glide.module.AppGlideModule
import com.bumptech.glide.request.RequestOptions

object DeviceProfiler {

    private const val TAG = "DeviceProfiler"

    enum class Ecosystem {
        AMAZON_FIRE_OS,
        OFFICIAL_ANDROID_TV,
        AOSP_GENERIC
    }

    enum class RamTier {
        LOW_RAM_1_5GB,
        HIGH_RAM_2GB_PLUS
    }

    data class DeviceInfo(
        val manufacturer: String,
        val model: String,
        val device: String,
        val sdkInt: Int,
        val totalRamGb: Float,
        val freeRamMb: Long,
        val ecosystem: Ecosystem,
        val ramTier: RamTier,
        val isLowRamDevice: Boolean,
        val isFireTv: Boolean,
        val isXiaomi: Boolean,
        val fireTvModelName: String,
        val isAospProjector: Boolean,
        val hasKeystoneOption: Boolean
    )

    fun profileDevice(context: Context): DeviceInfo {
        val manufacturer = Build.MANUFACTURER ?: "Unknown"
        val model = Build.MODEL ?: "Unknown"
        val device = Build.DEVICE ?: "Unknown"
        val sdkInt = Build.VERSION.SDK_INT

        // RAM Calculation
        val actManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        actManager.getMemoryInfo(memInfo)

        val totalRamBytes = memInfo.totalMem
        val totalRamGb = totalRamBytes.toFloat() / (1024 * 1024 * 1024)
        val freeRamMb = memInfo.availMem / (1024 * 1024)
        val isLowRamDevice = actManager.isLowRamDevice || totalRamGb <= 1.6f || memInfo.lowMemory

        // Ecosystem Detection
        val isFireTv = manufacturer.equals("Amazon", ignoreCase = true) ||
                model.startsWith("AFT", ignoreCase = true) ||
                device.startsWith("AFT", ignoreCase = true)

        val isXiaomi = manufacturer.equals("Xiaomi", ignoreCase = true) ||
                manufacturer.equals("Xiaomi Corporation", ignoreCase = true) ||
                model.contains("Mi Box", ignoreCase = true) ||
                model.contains("MIBOX", ignoreCase = true) ||
                model.contains("MDZ-", ignoreCase = true) ||
                device.contains("once", ignoreCase = true) ||
                device.contains("aquaman", ignoreCase = true) ||
                !getSystemProperty("ro.miui.ui.version.name").isNullOrBlank()

        val fireTvModelName = if (isFireTv) detectFireTvModel(model) else "N/A"

        val isOfficialTv = !isFireTv && (
                context.packageManager.hasSystemFeature("android.software.leanback") ||
                        isXiaomi ||
                        manufacturer.equals("Google", ignoreCase = true) ||
                        model.contains("SHIELD", ignoreCase = true) ||
                        model.contains("onn", ignoreCase = true)
                )

        val isAospProjector = !isFireTv && !isOfficialTv ||
                model.contains("HY300", ignoreCase = true) ||
                manufacturer.contains("Allwinner", ignoreCase = true) ||
                manufacturer.contains("Rockchip", ignoreCase = true) ||
                device.contains("sunxi", ignoreCase = true)

        val ecosystem = when {
            isFireTv -> Ecosystem.AMAZON_FIRE_OS
            isOfficialTv -> Ecosystem.OFFICIAL_ANDROID_TV
            else -> Ecosystem.AOSP_GENERIC
        }

        // RAM Tiering (Zero-Crash Guarantee: <= 1.5GB RAM forces Low RAM profile)
        val ramTier = if (isLowRamDevice) RamTier.LOW_RAM_1_5GB else RamTier.HIGH_RAM_2GB_PLUS

        val hasKeystoneOption = isAospProjector || isKeystoneIntentAvailable(context)

        Log.i(TAG, "Device Profiled: $manufacturer $model (Ecosystem: $ecosystem, RAM: ${"%.2f".format(totalRamGb)}GB, Tier: $ramTier, LowRam: $isLowRamDevice)")

        return DeviceInfo(
            manufacturer = manufacturer,
            model = model,
            device = device,
            sdkInt = sdkInt,
            totalRamGb = totalRamGb,
            freeRamMb = freeRamMb,
            ecosystem = ecosystem,
            ramTier = ramTier,
            isLowRamDevice = isLowRamDevice,
            isFireTv = isFireTv,
            isXiaomi = isXiaomi,
            fireTvModelName = fireTvModelName,
            isAospProjector = isAospProjector,
            hasKeystoneOption = hasKeystoneOption
        )
    }

    private fun getSystemProperty(key: String): String? {
        return try {
            val clazz = Class.forName("android.os.SystemProperties")
            val get = clazz.getMethod("get", String::class.java)
            (get.invoke(null, key) as? String)?.takeIf { it.isNotBlank() }
        } catch (_: Exception) {
            null
        }
    }

    private fun detectFireTvModel(model: String): String {
        return when (model.uppercase()) {
            "AFTN" -> "Fire TV Stick 4K (1st Gen)"
            "AFTKRT" -> "Fire TV Stick Lite"
            "AFTSS" -> "Fire TV Stick (3rd Gen)"
            "AFTKA" -> "Fire TV Stick 4K Max (1st Gen)"
            "AFTKMST" -> "Fire TV Stick 4K Max (2nd Gen)"
            "AFTT" -> "Fire TV Stick (2nd Gen)"
            "AFTEU011" -> "Fire TV Cube (1st Gen)"
            "AFTEGR001" -> "Fire TV Cube (2nd Gen)"
            "AFTEGA001" -> "Fire TV Cube (3rd Gen)"
            else -> if (model.startsWith("AFT")) "Fire TV Device ($model)" else "Amazon Device ($model)"
        }
    }

    private fun isKeystoneIntentAvailable(context: Context): Boolean {
        val keystoneIntent = Intent("com.softwinner.action.KEYSTONE")
        return context.packageManager.queryIntentActivities(keystoneIntent, PackageManager.MATCH_DEFAULT_ONLY).isNotEmpty()
    }

    // Safe Intent Launcher with zero-crash fallback logic
    fun safeStartActivity(context: Context, intent: Intent?): Boolean {
        if (intent == null) return false
        return try {
            val resolveInfo = context.packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
            if (resolveInfo != null) {
                context.startActivity(intent)
                true
            } else {
                Log.w(TAG, "Primary intent not resolvable: ${intent.action}. Falling back to default settings.")
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(fallbackIntent)
                true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start activity safely", e)
            try {
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(fallbackIntent)
                true
            } catch (ex: Exception) {
                Log.e(TAG, "Fatal fallback settings failed", ex)
                false
            }
        }
    }

    fun getManufacturerSettingsIntent(context: Context, deviceInfo: DeviceInfo): Intent {
        return when (deviceInfo.ecosystem) {
            Ecosystem.AMAZON_FIRE_OS -> {
                Intent().apply {
                    setClassName("com.amazon.tv.settings", "com.amazon.tv.settings.v2.MainSettingsActivity")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
            Ecosystem.OFFICIAL_ANDROID_TV -> {
                Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
            Ecosystem.AOSP_GENERIC -> {
                Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
        }
    }

    fun getWifiSettingsIntent(context: Context, deviceInfo: DeviceInfo): Intent {
        return if (deviceInfo.isFireTv) {
            Intent().apply {
                setClassName("com.amazon.tv.settings", "com.amazon.tv.settings.network.NetworkActivity")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        } else {
            Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
    }

    fun getBluetoothSettingsIntent(context: Context, deviceInfo: DeviceInfo): Intent {
        return if (deviceInfo.isFireTv) {
            Intent().apply {
                setClassName("com.amazon.tv.settings", "com.amazon.tv.settings.bluetooth.BluetoothActivity")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        } else {
            Intent(Settings.ACTION_BLUETOOTH_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
    }

    fun getKeystoneOrInputIntent(context: Context, deviceInfo: DeviceInfo): Intent? {
        val intentsToTry = listOf(
            Intent("com.softwinner.action.KEYSTONE"),
            Intent("com.rockchip.action.DISPLAY_SETTINGS"),
            Intent("android.intent.action.TV_INPUT"),
            Intent().setClassName("com.softwinner.settings", "com.softwinner.settings.KeystoneActivity"),
            Intent().setClassName("com.mstar.tv.tvplayer.ui", "com.mstar.tv.tvplayer.ui.RootActivity")
        )

        for (intent in intentsToTry) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (context.packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY).isNotEmpty()) {
                return intent
            }
        }
        return null
    }

    fun getFireTvRemapToolIntent(context: Context): Intent? {
        val remapPackages = listOf(
            "de.d4mi.firetv.launchermanager",
            "com.spocky.projotools",
            "com.amazon.tv.launcher"
        )
        for (pkg in remapPackages) {
            val intent = context.packageManager.getLaunchIntentForPackage(pkg)
            if (intent != null) return intent
        }
        return null
    }

    /**
     * Xiaomi / Google TV often open an empty "Seleccionar" screen with ACTION_HOME_SETTINGS.
     * Try RoleManager → HOME chooser → OEM default-apps → HOME_SETTINGS → manual guide.
     */
    fun openDefaultHomePicker(activity: android.app.Activity, deviceInfo: DeviceInfo): HomePickerResult {
        if (deviceInfo.isFireTv) return HomePickerResult.FIRE_TV_BLOCKED

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                val roleManager = activity.getSystemService(android.app.role.RoleManager::class.java)
                if (roleManager != null && roleManager.isRoleAvailable(android.app.role.RoleManager.ROLE_HOME)) {
                    if (!roleManager.isRoleHeld(android.app.role.RoleManager.ROLE_HOME)) {
                        val intent = roleManager.createRequestRoleIntent(android.app.role.RoleManager.ROLE_HOME)
                        activity.startActivity(intent)
                        return HomePickerResult.OPENED_ROLE
                    } else {
                        return HomePickerResult.ALREADY_DEFAULT
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "RoleManager HOME failed", e)
            }
        }

        val homeChooser = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val resolvers = activity.packageManager.queryIntentActivities(
            homeChooser,
            PackageManager.MATCH_DEFAULT_ONLY
        )
        if (resolvers.size > 1) {
            try {
                val chooser = Intent.createChooser(homeChooser, "Elige Tonalix TV como inicio")
                activity.startActivity(chooser)
                return HomePickerResult.OPENED_CHOOSER
            } catch (e: Exception) {
                Log.w(TAG, "HOME chooser failed", e)
            }
        }

        if (deviceInfo.isXiaomi) {
            val xiaomiIntents = listOf(
                Intent().setClassName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                ),
                Intent("miui.intent.action.APP_PERM_EDITOR"),
                Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS),
                Intent(Settings.ACTION_HOME_SETTINGS)
            )
            for (intent in xiaomiIntents) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                if (activity.packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null) {
                    try {
                        activity.startActivity(intent)
                        return HomePickerResult.OPENED_OEM
                    } catch (_: Exception) {
                    }
                }
            }
            return HomePickerResult.NEED_MANUAL_XIAOMI
        }

        try {
            val intent = Intent(Settings.ACTION_HOME_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (activity.packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY) != null) {
                activity.startActivity(intent)
                return HomePickerResult.OPENED_HOME_SETTINGS
            }
        } catch (e: Exception) {
            Log.w(TAG, "HOME_SETTINGS failed", e)
        }

        return HomePickerResult.NEED_MANUAL
    }

    enum class HomePickerResult {
        OPENED_ROLE,
        OPENED_CHOOSER,
        OPENED_OEM,
        OPENED_HOME_SETTINGS,
        ALREADY_DEFAULT,
        FIRE_TV_BLOCKED,
        NEED_MANUAL_XIAOMI,
        NEED_MANUAL
    }
}