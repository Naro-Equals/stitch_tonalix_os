package com.tonalix.tvlauncher

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

class LauncherConfigManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "tonalix_tv_launcher_prefs"

        const val KEY_BG_TYPE = "bg_type" // "GRADIENT", "OLED", "CUSTOM"
        const val KEY_BG_CUSTOM_PATH = "bg_custom_path"

        const val KEY_SHOW_CLOCK = "show_clock"
        const val KEY_CLOCK_24H = "clock_24h"
        const val KEY_SHOW_DATE = "show_date"
        const val KEY_SHOW_WEATHER = "show_weather"
        const val KEY_WEATHER_CITY = "weather_city"

        const val KEY_SHOW_MEDIA_CAPSULE = "show_media_capsule"
        const val KEY_MUSIC_BG_ENABLED = "music_bg_enabled"
        const val KEY_MINI_PLAYER_ENABLED = "mini_player_enabled"
        const val KEY_VISUAL_EFFECTS_ENABLED = "visual_effects_enabled"

        const val KEY_DOCK_SLOT_COUNT = "dock_slot_count"
        const val KEY_DOCK_ICON_SIZE_DP = "dock_icon_size_dp"
        const val KEY_DOCK_PACKAGES = "dock_packages"

        const val KEY_ADB_ENABLED = "adb_enabled"
        const val KEY_FIREWALL_ENABLED = "firewall_enabled"
        const val KEY_CURSOR_ENABLED = "cursor_enabled"

        const val KEY_VIEWING_DISTANCE = "viewing_distance" // "NEAR", "MEDIUM", "FAR"
        const val KEY_THEME_PALETTE = "theme_palette" // "CYAN", "PURPLE", "EMERALD", "SUNSET", "CRIMSON", "GOLD"
        const val KEY_GAME_MODE = "game_mode"
        const val KEY_GAME_DOCK_AUTO = "game_dock_auto"
        const val KEY_STARTUP_PACKAGE = "startup_package"
        const val KEY_LOW_RAM_MODE = "low_ram_mode"

        const val KEY_SHOW_BTN_SEARCH = "show_btn_search"
        const val KEY_SHOW_BTN_TURBO = "show_btn_turbo"
        const val KEY_SHOW_BTN_WIFI = "show_btn_wifi"
        const val KEY_SHOW_BTN_BLUETOOTH = "show_btn_bluetooth"
        const val KEY_SHOW_BTN_GAME = "show_btn_game"
        const val KEY_SHOW_BTN_DISTANCE = "show_btn_distance"
        const val KEY_SHOW_BTN_HEALTH = "show_btn_health"
        const val KEY_SHOW_BTN_SECURITY = "show_btn_security"
        const val KEY_SHOW_BTN_INSTALLER = "show_btn_installer"
        const val KEY_SHOW_BTN_SETTINGS = "show_btn_settings"
        const val KEY_SHOW_FEATURED_BANNER = "show_featured_banner"
        const val KEY_USE_COMPOSE_UI = "use_compose_ui"
        const val KEY_NIGHT_MODE_ENABLED = "night_mode_enabled"
        const val KEY_NIGHT_MODE_START = "night_mode_start"
        const val KEY_NIGHT_MODE_END = "night_mode_end"
    }

    var useComposeUi: Boolean
        get() = prefs.getBoolean(KEY_USE_COMPOSE_UI, true)
        set(value) = prefs.edit().putBoolean(KEY_USE_COMPOSE_UI, value).apply()

    var nightModeEnabled: Boolean
        get() = prefs.getBoolean(KEY_NIGHT_MODE_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_NIGHT_MODE_ENABLED, value).apply()

    var nightModeStart: String
        get() = prefs.getString(KEY_NIGHT_MODE_START, "21:00") ?: "21:00"
        set(value) = prefs.edit().putString(KEY_NIGHT_MODE_START, value).apply()

    var nightModeEnd: String
        get() = prefs.getString(KEY_NIGHT_MODE_END, "07:00") ?: "07:00"
        set(value) = prefs.edit().putString(KEY_NIGHT_MODE_END, value).apply()

    var startupPackage: String
        get() = prefs.getString(KEY_STARTUP_PACKAGE, "") ?: ""
        set(value) = prefs.edit().putString(KEY_STARTUP_PACKAGE, value).apply()

    var lowRamMode: Boolean
        get() = prefs.getBoolean(KEY_LOW_RAM_MODE, false)
        set(value) = prefs.edit().putBoolean(KEY_LOW_RAM_MODE, value).apply()

    var showBtnSearch: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_SEARCH, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_SEARCH, value).apply()
    var showBtnTurbo: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_TURBO, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_TURBO, value).apply()
    var showBtnWifi: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_WIFI, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_WIFI, value).apply()
    var showBtnBluetooth: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_BLUETOOTH, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_BLUETOOTH, value).apply()
    var showBtnGame: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_GAME, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_GAME, value).apply()
    var showBtnDistance: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_DISTANCE, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_DISTANCE, value).apply()
    var showBtnHealth: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_HEALTH, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_HEALTH, value).apply()
    var showBtnSecurity: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_SECURITY, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_SECURITY, value).apply()
    var showBtnInstaller: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_INSTALLER, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_INSTALLER, value).apply()
    var showBtnSettings: Boolean
        get() = prefs.getBoolean(KEY_SHOW_BTN_SETTINGS, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_BTN_SETTINGS, value).apply()
    var showFeaturedBanner: Boolean
        get() = prefs.getBoolean(KEY_SHOW_FEATURED_BANNER, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_FEATURED_BANNER, value).apply()

    var bgType: String
        get() = prefs.getString(KEY_BG_TYPE, "GRADIENT") ?: "GRADIENT"
        set(value) = prefs.edit().putString(KEY_BG_TYPE, value).apply()

    var bgCustomPath: String
        get() = prefs.getString(KEY_BG_CUSTOM_PATH, "") ?: ""
        set(value) = prefs.edit().putString(KEY_BG_CUSTOM_PATH, value).apply()

    var showClock: Boolean
        get() = prefs.getBoolean(KEY_SHOW_CLOCK, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_CLOCK, value).apply()

    var clock24h: Boolean
        get() = prefs.getBoolean(KEY_CLOCK_24H, true)
        set(value) = prefs.edit().putBoolean(KEY_CLOCK_24H, value).apply()

    var showDate: Boolean
        get() = prefs.getBoolean(KEY_SHOW_DATE, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_DATE, value).apply()

    var showWeather: Boolean
        get() = prefs.getBoolean(KEY_SHOW_WEATHER, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_WEATHER, value).apply()

    var weatherCity: String
        get() = prefs.getString(KEY_WEATHER_CITY, "Madrid") ?: "Madrid"
        set(value) = prefs.edit().putString(KEY_WEATHER_CITY, value).apply()

    var showMediaCapsule: Boolean
        get() = prefs.getBoolean(KEY_SHOW_MEDIA_CAPSULE, true)
        set(value) = prefs.edit().putBoolean(KEY_SHOW_MEDIA_CAPSULE, value).apply()

    var musicBgEnabled: Boolean
        get() = prefs.getBoolean(KEY_MUSIC_BG_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_MUSIC_BG_ENABLED, value).apply()

    var miniPlayerEnabled: Boolean
        get() = prefs.getBoolean(KEY_MINI_PLAYER_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_MINI_PLAYER_ENABLED, value).apply()

    var visualEffectsEnabled: Boolean
        get() = prefs.getBoolean(KEY_VISUAL_EFFECTS_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_VISUAL_EFFECTS_ENABLED, value).apply()

    var dockSlotCount: Int
        get() = prefs.getInt(KEY_DOCK_SLOT_COUNT, 6).coerceIn(3, 8)
        set(value) = prefs.edit().putInt(KEY_DOCK_SLOT_COUNT, value.coerceIn(3, 8)).apply()

    var dockIconSizeDp: Int
        get() = prefs.getInt(KEY_DOCK_ICON_SIZE_DP, 64)
        set(value) = prefs.edit().putInt(KEY_DOCK_ICON_SIZE_DP, value).apply()

    var adbEnabled: Boolean
        get() = prefs.getBoolean(KEY_ADB_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_ADB_ENABLED, value).apply()

    var firewallEnabled: Boolean
        get() = prefs.getBoolean(KEY_FIREWALL_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_FIREWALL_ENABLED, value).apply()

    var cursorEnabled: Boolean
        get() = prefs.getBoolean(KEY_CURSOR_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_CURSOR_ENABLED, value).apply()

    var viewingDistance: String
        get() = prefs.getString(KEY_VIEWING_DISTANCE, "MEDIUM") ?: "MEDIUM"
        set(value) = prefs.edit().putString(KEY_VIEWING_DISTANCE, value).apply()

    var themePalette: String
        get() = prefs.getString(KEY_THEME_PALETTE, "CYAN") ?: "CYAN"
        set(value) = prefs.edit().putString(KEY_THEME_PALETTE, value).apply()

    var gameMode: Boolean
        get() = prefs.getBoolean(KEY_GAME_MODE, false)
        set(value) = prefs.edit().putBoolean(KEY_GAME_MODE, value).apply()

    var gameDockAuto: Boolean
        get() = prefs.getBoolean(KEY_GAME_DOCK_AUTO, true)
        set(value) = prefs.edit().putBoolean(KEY_GAME_DOCK_AUTO, value).apply()

    fun getDockPackages(): List<String> {
        if (gameMode && gameDockAuto) {
            return getGameDockPackages()
        }
        val raw = prefs.getString(KEY_DOCK_PACKAGES, null)
        if (raw == null || raw.trim().isEmpty()) {
            return listOf(
                "com.google.android.youtube.tv",
                "org.videolan.vlc",
                "com.netflix.ninja",
                "com.amazon.avod",
                "org.smarttube.tv",
                "com.tonalix.tvlauncher"
            )
        }
        return raw.split(",").filter { it.isNotBlank() }
    }

    fun getGameDockPackages(): List<String> {
        return listOf(
            "com.retroarch",
            "com.valvesoftware.steamlink",
            "com.limelight",
            "com.ppsspp.ppsspp",
            "com.google.android.youtube.tv",
            "com.tonalix.tvlauncher"
        )
    }

    fun setDockPackages(packages: List<String>) {
        val raw = packages.joinToString(",")
        prefs.edit().putString(KEY_DOCK_PACKAGES, raw).apply()
    }

    fun toSyncJson(): JSONObject {
        return JSONObject()
            .put("bgType", bgType)
            .put("bgCustomPath", bgCustomPath)
            .put("showClock", showClock)
            .put("clock24h", clock24h)
            .put("showDate", showDate)
            .put("showWeather", showWeather)
            .put("weatherCity", weatherCity)
            .put("showMediaCapsule", showMediaCapsule)
            .put("musicBgEnabled", musicBgEnabled)
            .put("miniPlayerEnabled", miniPlayerEnabled)
            .put("visualEffectsEnabled", visualEffectsEnabled)
            .put("dockSlotCount", dockSlotCount)
            .put("dockIconSizeDp", dockIconSizeDp)
            .put("dockPackages", getDockPackages().joinToString(","))
            .put("viewingDistance", viewingDistance)
            .put("themePalette", themePalette)
            .put("gameMode", gameMode)
            .put("gameDockAuto", gameDockAuto)
            .put("startupPackage", startupPackage)
            .put("lowRamMode", lowRamMode)
            .put("showFeaturedBanner", showFeaturedBanner)
            .put("showBtnSearch", showBtnSearch)
            .put("showBtnTurbo", showBtnTurbo)
            .put("showBtnWifi", showBtnWifi)
            .put("showBtnBluetooth", showBtnBluetooth)
            .put("showBtnGame", showBtnGame)
            .put("showBtnDistance", showBtnDistance)
            .put("showBtnHealth", showBtnHealth)
            .put("showBtnSecurity", showBtnSecurity)
    }

    fun applySyncJson(json: JSONObject) {
        if (json.has("bgType")) bgType = json.optString("bgType", bgType)
        if (json.has("showClock")) showClock = json.optBoolean("showClock", showClock)
        if (json.has("clock24h")) clock24h = json.optBoolean("clock24h", clock24h)
        if (json.has("showDate")) showDate = json.optBoolean("showDate", showDate)
        if (json.has("showWeather")) showWeather = json.optBoolean("showWeather", showWeather)
        if (json.has("weatherCity")) weatherCity = json.optString("weatherCity", weatherCity)
        if (json.has("showMediaCapsule")) showMediaCapsule = json.optBoolean("showMediaCapsule", showMediaCapsule)
        if (json.has("musicBgEnabled")) musicBgEnabled = json.optBoolean("musicBgEnabled", musicBgEnabled)
        if (json.has("miniPlayerEnabled")) miniPlayerEnabled = json.optBoolean("miniPlayerEnabled", miniPlayerEnabled)
        if (json.has("visualEffectsEnabled")) visualEffectsEnabled = json.optBoolean("visualEffectsEnabled", visualEffectsEnabled)
        if (json.has("dockSlotCount")) dockSlotCount = json.optInt("dockSlotCount", dockSlotCount)
        if (json.has("dockIconSizeDp")) dockIconSizeDp = json.optInt("dockIconSizeDp", dockIconSizeDp)
        if (json.has("dockPackages")) {
            val pkgs = json.optString("dockPackages", "")
            if (pkgs.isNotBlank()) setDockPackages(pkgs.split(",").filter { it.isNotBlank() })
        }
        if (json.has("viewingDistance")) viewingDistance = json.optString("viewingDistance", viewingDistance)
        if (json.has("themePalette")) themePalette = json.optString("themePalette", themePalette)
        if (json.has("gameMode")) gameMode = json.optBoolean("gameMode", gameMode)
        if (json.has("gameDockAuto")) gameDockAuto = json.optBoolean("gameDockAuto", gameDockAuto)
        if (json.has("startupPackage")) startupPackage = json.optString("startupPackage", startupPackage)
        if (json.has("lowRamMode")) lowRamMode = json.optBoolean("lowRamMode", lowRamMode)
        if (json.has("showFeaturedBanner")) showFeaturedBanner = json.optBoolean("showFeaturedBanner", showFeaturedBanner)
        if (json.has("showBtnSearch")) showBtnSearch = json.optBoolean("showBtnSearch", showBtnSearch)
        if (json.has("showBtnTurbo")) showBtnTurbo = json.optBoolean("showBtnTurbo", showBtnTurbo)
        if (json.has("showBtnWifi")) showBtnWifi = json.optBoolean("showBtnWifi", showBtnWifi)
        if (json.has("showBtnBluetooth")) showBtnBluetooth = json.optBoolean("showBtnBluetooth", showBtnBluetooth)
        if (json.has("showBtnGame")) showBtnGame = json.optBoolean("showBtnGame", showBtnGame)
        if (json.has("showBtnDistance")) showBtnDistance = json.optBoolean("showBtnDistance", showBtnDistance)
        if (json.has("showBtnHealth")) showBtnHealth = json.optBoolean("showBtnHealth", showBtnHealth)
        if (json.has("showBtnSecurity")) showBtnSecurity = json.optBoolean("showBtnSecurity", showBtnSecurity)
    }
}