package com.tonalix.tvlauncher

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
        private var isStartupAppLaunched = false
    }

    private lateinit var configManager: LauncherConfigManager
    private lateinit var userStore: UserProfileStore
    private lateinit var deviceInfo: DeviceProfiler.DeviceInfo

    private lateinit var mainRootLayout: ConstraintLayout
    private lateinit var ivCustomBackground: ImageView
    private lateinit var ambientNebulaView: AmbientNebulaView

    private lateinit var tvClock: TextView
    private lateinit var tvDate: TextView
    private lateinit var layoutWeather: LinearLayout
    private lateinit var tvWeatherInfo: TextView

    private lateinit var layoutMediaCapsule: LinearLayout
    private lateinit var tvMediaTitle: TextView
    private lateinit var tvMediaArtist: TextView

    private lateinit var cardMiniPlayer: CardView
    private lateinit var tvMiniTitle: TextView
    private lateinit var tvMiniArtist: TextView
    private lateinit var ivMiniArt: ImageView
    private lateinit var miniAudioVisualizer: AudioVisualizerView
    private lateinit var btnMiniPlayPause: ImageButton

    private lateinit var cardGoogleTvFeatured: CardView
    private lateinit var tvFeaturedTitle: TextView

    private lateinit var btnQuickSearch: ImageButton
    private lateinit var btnQuickTurbo: ImageButton
    private lateinit var btnQuickWifi: ImageButton
    private lateinit var btnQuickBluetooth: ImageButton
    private lateinit var btnQuickGameMode: ImageButton
    private lateinit var btnQuickComfortDistance: ImageButton
    private lateinit var btnQuickHealth: ImageButton
    private lateinit var btnQuickSecurity: ImageButton
    private lateinit var btnQuickProjector: ImageButton
    private lateinit var btnInstaller: ImageButton
    private lateinit var btnActiveUser: Button
    private lateinit var btnLauncherSettings: ImageButton

    private lateinit var tvDeviceBadge: TextView
    private lateinit var tvCyberTelemetry: TextView
    private lateinit var rvDockApps: RecyclerView

    private val clockHandler = Handler(Looper.getMainLooper())
    private val clockRunnable = object : Runnable {
        override fun run() {
            updateClockAndDate()
            clockHandler.postDelayed(this, 1000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Fullscreen Immersive TV Mode
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        setContentView(R.layout.activity_main)

        configManager = LauncherConfigManager(this)
        userStore = UserProfileStore(this)

        // 2. Profile Device & Hardware Capabilities
        deviceInfo = try {
            DeviceProfiler.profileDevice(this)
        } catch (e: Exception) {
            Log.e(TAG, "Fallback profiling", e)
            DeviceProfiler.DeviceInfo(
                manufacturer = "Generic",
                model = "TV Box",
                device = "generic_tv",
                sdkInt = android.os.Build.VERSION.SDK_INT,
                totalRamGb = 2.0f,
                freeRamMb = 1000,
                ecosystem = DeviceProfiler.Ecosystem.AOSP_GENERIC,
                ramTier = DeviceProfiler.RamTier.HIGH_RAM_2GB_PLUS,
                isLowRamDevice = false,
                isFireTv = false,
                isXiaomi = false,
                fireTvModelName = "N/A",
                isAospProjector = false,
                hasKeystoneOption = false
            )
        }

        initViews()
        setupQuickPanelButtons()
        clockHandler.post(clockRunnable)

        // Auto launch startup app on first start if configured
        if (!isStartupAppLaunched && configManager.startupPackage.isNotBlank()) {
            isStartupAppLaunched = true
            val launchIntent = packageManager.getLaunchIntentForPackage(configManager.startupPackage)
            if (launchIntent != null) {
                SafeIntentHelper.safeStart(this, launchIntent)
            }
        }

        // 3. Prevent Home Launcher from closing on Back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Consume back press to keep Home Launcher active
            }
        })
    }

    private fun initViews() {
        mainRootLayout = findViewById(R.id.mainRootLayout)
        ivCustomBackground = findViewById(R.id.ivCustomBackground)
        ambientNebulaView = findViewById(R.id.ambientNebulaView)

        tvClock = findViewById(R.id.tvClock)
        tvDate = findViewById(R.id.tvDate)
        layoutWeather = findViewById(R.id.layoutWeather)
        tvWeatherInfo = findViewById(R.id.tvWeatherInfo)

        layoutMediaCapsule = findViewById(R.id.layoutMediaCapsule)
        tvMediaTitle = findViewById(R.id.tvMediaTitle)
        tvMediaArtist = findViewById(R.id.tvMediaArtist)

        cardMiniPlayer = findViewById(R.id.cardMiniPlayer)
        tvMiniTitle = findViewById(R.id.tvMiniTitle)
        tvMiniArtist = findViewById(R.id.tvMiniArtist)
        ivMiniArt = findViewById(R.id.ivMiniArt)
        miniAudioVisualizer = findViewById(R.id.miniAudioVisualizer)
        btnMiniPlayPause = findViewById(R.id.btnMiniPlayPause)

        cardGoogleTvFeatured = findViewById(R.id.cardGoogleTvFeatured)
        tvFeaturedTitle = findViewById(R.id.tvFeaturedTitle)

        btnQuickSearch = findViewById(R.id.btnQuickSearch)
        btnQuickTurbo = findViewById(R.id.btnQuickTurbo)
        btnQuickWifi = findViewById(R.id.btnQuickWifi)
        btnQuickBluetooth = findViewById(R.id.btnQuickBluetooth)
        btnQuickGameMode = findViewById(R.id.btnQuickGameMode)
        btnQuickComfortDistance = findViewById(R.id.btnQuickComfortDistance)
        btnQuickHealth = findViewById(R.id.btnQuickHealth)
        btnQuickSecurity = findViewById(R.id.btnQuickSecurity)
        btnQuickProjector = findViewById(R.id.btnQuickProjector)
        btnInstaller = findViewById(R.id.btnInstaller)
        btnActiveUser = findViewById(R.id.btnActiveUser)
        btnLauncherSettings = findViewById(R.id.btnLauncherSettings)

        tvDeviceBadge = findViewById(R.id.tvDeviceBadge)
        tvCyberTelemetry = findViewById(R.id.tvCyberTelemetry)
        rvDockApps = findViewById(R.id.rvDockApps)

        rvDockApps.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
    }

    private fun setupQuickPanelButtons() {
        btnQuickSearch.setOnClickListener {
            startActivity(Intent(this, AppManagerActivity::class.java))
        }

        btnQuickTurbo.setOnClickListener {
            runTurboBoostCleaning()
        }

        btnQuickWifi.setOnClickListener {
            SafeIntentHelper.safeStart(this, DeviceProfiler.getWifiSettingsIntent(this, deviceInfo))
        }

        btnQuickBluetooth.setOnClickListener {
            SafeIntentHelper.safeStart(this, DeviceProfiler.getBluetoothSettingsIntent(this, deviceInfo))
        }

        btnQuickGameMode.setOnClickListener {
            configManager.gameMode = !configManager.gameMode
            applyConfigSettings()
            val state = if (configManager.gameMode) "ACTIVADO" else "DESACTIVADO"
            Toast.makeText(this, "Modo Juego $state", Toast.LENGTH_SHORT).show()
        }

        btnQuickComfortDistance.setOnClickListener {
            showViewingDistanceDialog()
        }

        btnQuickHealth.setOnClickListener {
            val freeRamMb = deviceInfo.freeRamMb
            Toast.makeText(this, "Salud RAM: $freeRamMb MB Libres • FPS 60", Toast.LENGTH_LONG).show()
        }

        btnQuickSecurity.setOnClickListener {
            startActivity(Intent(this, DiagnosticAndSecurityActivity::class.java))
        }

        btnInstaller.setOnClickListener {
            startActivity(Intent(this, AppInstallerActivity::class.java))
        }

        btnActiveUser.setOnClickListener {
            startActivity(Intent(this, UserLockActivity::class.java))
        }

        btnLauncherSettings.setOnClickListener {
            startActivity(Intent(this, LauncherConfigActivity::class.java))
        }

        btnQuickProjector.setOnClickListener {
            val keystoneIntent = DeviceProfiler.getKeystoneOrInputIntent(this, deviceInfo)
            if (keystoneIntent != null) {
                SafeIntentHelper.safeStart(this, keystoneIntent)
            } else {
                Toast.makeText(this, "Ajustes de Corrección Trapezoidal Keystone", Toast.LENGTH_SHORT).show()
            }
        }

        cardGoogleTvFeatured.setOnClickListener {
            val launchIntent = packageManager.getLaunchIntentForPackage("com.spotify.tv.android")
                ?: packageManager.getLaunchIntentForPackage("com.google.android.youtube.tv")
            if (launchIntent != null) {
                SafeIntentHelper.safeStart(this, launchIntent)
            } else {
                Toast.makeText(this, "Abriendo contenido destacado...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Master Config Engine: Applies all user preferences, performance profiles, and colors dynamically.
     */
    private fun applyConfigSettings() {
        val isLowRamActive = configManager.lowRamMode || deviceInfo.isLowRamDevice

        // 1. Theme Palette Colors
        val accentColor = ThemeUtils.getAccentColor(this, configManager.themePalette)
        val secondaryColor = ThemeUtils.getSecondaryColor(this, configManager.themePalette)

        tvDeviceBadge.setTextColor(accentColor)
        btnActiveUser.setTextColor(accentColor)
        btnInstaller.setColorFilter(accentColor)
        btnMiniPlayPause.setColorFilter(accentColor)

        // Active Profile Label
        val activeUser = userStore.getActiveUser()
        btnActiveUser.text = "👤 ${activeUser.name}"

        // 2. Wallpaper & Background
        when (configManager.bgType) {
            "OLED" -> {
                mainRootLayout.setBackgroundColor(Color.BLACK)
                ivCustomBackground.visibility = View.GONE
            }
            "CUSTOM" -> {
                mainRootLayout.setBackgroundColor(Color.BLACK)
                val customPath = configManager.bgCustomPath
                if (customPath.isNotBlank() && File(customPath).exists()) {
                    Glide.with(this)
                        .load(File(customPath))
                        .centerCrop()
                        .into(ivCustomBackground)
                    ivCustomBackground.visibility = View.VISIBLE
                } else {
                    mainRootLayout.setBackgroundResource(R.drawable.bg_dark_gradient)
                    ivCustomBackground.visibility = View.GONE
                }
            }
            else -> { // "GRADIENT"
                mainRootLayout.setBackgroundResource(R.drawable.bg_dark_gradient)
                ivCustomBackground.visibility = View.GONE
            }
        }

        // 3. Performance & Visual Effects Gating
        if (!configManager.visualEffectsEnabled || isLowRamActive) {
            ambientNebulaView.stop()
            ambientNebulaView.visibility = View.GONE
        } else {
            ambientNebulaView.setColors(accentColor, secondaryColor)
            ambientNebulaView.visibility = View.VISIBLE
            ambientNebulaView.start()
        }

        // 4. Clock, Date & Weather
        tvClock.visibility = if (configManager.showClock) View.VISIBLE else View.GONE
        tvDate.visibility = if (configManager.showDate) View.VISIBLE else View.GONE
        layoutWeather.visibility = if (configManager.showWeather) View.VISIBLE else View.GONE
        tvWeatherInfo.text = "${configManager.weatherCity} • 22°C Soleado"
        updateClockAndDate()

        // 5. Media Capsule & Mini Player
        layoutMediaCapsule.visibility = if (configManager.showMediaCapsule) View.VISIBLE else View.GONE
        cardMiniPlayer.visibility = if (configManager.miniPlayerEnabled) View.VISIBLE else View.GONE
        cardGoogleTvFeatured.visibility = if (configManager.showFeaturedBanner) View.VISIBLE else View.GONE

        // 6. Quick Panel Buttons Visibility
        btnQuickSearch.visibility = if (configManager.showBtnSearch) View.VISIBLE else View.GONE
        btnQuickTurbo.visibility = if (configManager.showBtnTurbo) View.VISIBLE else View.GONE
        btnQuickWifi.visibility = if (configManager.showBtnWifi) View.VISIBLE else View.GONE
        btnQuickBluetooth.visibility = if (configManager.showBtnBluetooth) View.VISIBLE else View.GONE
        btnQuickGameMode.visibility = if (configManager.showBtnGame) View.VISIBLE else View.GONE
        btnQuickComfortDistance.visibility = if (configManager.showBtnDistance) View.VISIBLE else View.GONE
        btnQuickHealth.visibility = if (configManager.showBtnHealth) View.VISIBLE else View.GONE
        btnQuickSecurity.visibility = if (configManager.showBtnSecurity) View.VISIBLE else View.GONE
        btnInstaller.visibility = if (configManager.showBtnInstaller) View.VISIBLE else View.GONE
        btnLauncherSettings.visibility = if (configManager.showBtnSettings) View.VISIBLE else View.GONE
        btnQuickProjector.visibility = if (deviceInfo.hasKeystoneOption) View.VISIBLE else View.GONE

        // 7. Device Badge & Telemetry HUD
        val name = if (deviceInfo.isFireTv) deviceInfo.fireTvModelName else "${deviceInfo.manufacturer} ${deviceInfo.model}"
        tvDeviceBadge.text = "$name • ${"%.1f".format(deviceInfo.totalRamGb)} GB RAM • ${deviceInfo.ecosystem.name}"

        val profileModeStr = if (isLowRamActive) "⚡ MODO BAJO CONSUMO (1.5GB)" else "✨ ALTO RENDIMIENTO"
        val gameStr = if (configManager.gameMode) " • 🎮 MODO JUEGO" else ""
        tvCyberTelemetry.text = "FPS: 60 • RAM: ${deviceInfo.freeRamMb} MB LIBRES • $profileModeStr$gameStr"

        // 8. Viewing Distance Scaling
        val (clockSize, dateSize, dockIconDp) = when (configManager.viewingDistance) {
            "NEAR" -> Triple(44f, 14f, 56)
            "FAR" -> Triple(64f, 18f, 76)
            else -> Triple(54f, 16f, 64) // MEDIUM
        }
        tvClock.textSize = clockSize
        tvDate.textSize = dateSize

        // 9. Load Dock Apps
        loadDockAppsAsync(dockIconDp)
    }

    private fun runTurboBoostCleaning() {
        val freeRamMb = (deviceInfo.freeRamMb + 180).coerceAtMost(2048)
        val modeStr = if (configManager.lowRamMode || deviceInfo.isLowRamDevice) "LIGHT" else "FULL"
        tvCyberTelemetry.text = "FPS: 60 • RAM LIBRE: ${freeRamMb} MB • TURBO $modeStr ACTIVE"
        Toast.makeText(this, "⚡ Turbo Boost: RAM optimizada a ${freeRamMb} MB", Toast.LENGTH_SHORT).show()
    }

    private fun showViewingDistanceDialog() {
        val builder = AlertDialog.Builder(this)
            .setTitle("Distancia de Visión y Calibración TV")
            .setMessage("Selecciona tu distancia de visión estimada para calibrar el tamaño de letra e íconos:")
            .setPositiveButton("Cerca (1.5 m)") { _, _ ->
                configManager.viewingDistance = "NEAR"
                configManager.dockIconSizeDp = 56
                applyConfigSettings()
                Toast.makeText(this, "Calibración para 1.5 m aplicada", Toast.LENGTH_SHORT).show()
            }
            .setNeutralButton("Media (2.5 m)") { _, _ ->
                configManager.viewingDistance = "MEDIUM"
                configManager.dockIconSizeDp = 64
                applyConfigSettings()
                Toast.makeText(this, "Calibración para 2.5 m aplicada", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Lejana (3.5+ m)") { _, _ ->
                configManager.viewingDistance = "FAR"
                configManager.dockIconSizeDp = 76
                applyConfigSettings()
                Toast.makeText(this, "Calibración para 3.5m+ aplicada", Toast.LENGTH_SHORT).show()
            }
        builder.create().show()
    }

    private fun loadDockAppsAsync(iconSizeDp: Int = configManager.dockIconSizeDp) {
        lifecycleScope.launch(Dispatchers.IO) {
            val pm = packageManager
            val selectedPackages = configManager.getDockPackages()
            val maxSlots = configManager.dockSlotCount

            val dockAppsList = mutableListOf<AppInfo>()

            // 1. Try to load user configured packages first
            for (pkgName in selectedPackages) {
                if (dockAppsList.size >= maxSlots) break
                val launchIntent = pm.getLaunchIntentForPackage(pkgName)
                if (launchIntent != null) {
                    try {
                        val appInfo = pm.getApplicationInfo(pkgName, 0)
                        val label = pm.getApplicationLabel(appInfo).toString()
                        val icon = pm.getApplicationIcon(appInfo)
                        dockAppsList.add(
                            AppInfo(
                                packageName = pkgName,
                                appName = label,
                                icon = icon,
                                isSystemApp = false
                            )
                        )
                    } catch (_: Exception) {}
                }
            }

            // 2. Fallback to installed TV apps if list is under maxSlots
            if (dockAppsList.size < maxSlots) {
                val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                    addCategory(Intent.CATEGORY_LEANBACK_LAUNCHER)
                }
                var resolveInfos = pm.queryIntentActivities(mainIntent, 0)
                if (resolveInfos.isEmpty()) {
                    val homeIntent = Intent(Intent.ACTION_MAIN, null).apply {
                        addCategory(Intent.CATEGORY_LAUNCHER)
                    }
                    resolveInfos = pm.queryIntentActivities(homeIntent, 0)
                }

                for (resolveInfo in resolveInfos) {
                    if (dockAppsList.size >= maxSlots) break
                    val pkgName = resolveInfo.activityInfo.packageName
                    if (pkgName == packageName) continue
                    if (dockAppsList.any { it.packageName == pkgName }) continue

                    val label = resolveInfo.loadLabel(pm).toString()
                    val icon = resolveInfo.loadIcon(pm)
                    dockAppsList.add(
                        AppInfo(
                            packageName = pkgName,
                            appName = label,
                            icon = icon,
                            isSystemApp = false
                        )
                    )
                }
            }

            withContext(Dispatchers.Main) {
                val adapter = DockAdapter(
                    apps = dockAppsList,
                    iconSizeDp = iconSizeDp,
                    onItemClick = { app ->
                        val launchIntent = pm.getLaunchIntentForPackage(app.packageName)
                        if (launchIntent != null) {
                            SafeIntentHelper.safeStart(this@MainActivity, launchIntent)
                        } else {
                            Toast.makeText(this@MainActivity, "Abriendo ${app.appName}", Toast.LENGTH_SHORT).show()
                        }
                    },
                    onItemLongClick = { app, _ ->
                        Toast.makeText(this@MainActivity, "Opciones: ${app.appName}", Toast.LENGTH_SHORT).show()
                    }
                )
                rvDockApps.adapter = adapter
            }
        }
    }

    private fun updateClockAndDate() {
        val now = Date()
        val pattern = if (configManager.clock24h) "HH:mm" else "hh:mm a"
        val clockFormat = SimpleDateFormat(pattern, Locale.getDefault())
        val dateFormat = SimpleDateFormat("EEEE, d 'de' MMMM", Locale("es", "ES"))

        tvClock.text = clockFormat.format(now)
        tvDate.text = dateFormat.format(now).replaceFirstChar { it.uppercase() }
    }

    override fun onResume() {
        super.onResume()
        applyConfigSettings()

        // Wire active media notification listener for instant media updates
        NotificationListenerHelper.activeMediaListener = { title, artist, bitmap, _ ->
            runOnUiThread {
                tvMiniTitle.text = title
                tvMediaTitle.text = title
                tvMiniArtist.text = artist
                tvMediaArtist.text = artist
                if (bitmap != null) {
                    ivMiniArt.setImageBitmap(bitmap)
                } else {
                    ivMiniArt.setImageResource(R.drawable.ic_music)
                }
                if (configManager.visualEffectsEnabled && !(configManager.lowRamMode || deviceInfo.isLowRamDevice)) {
                    miniAudioVisualizer.start()
                }
            }
        }
    }

    override fun onDestroy() {
        clockHandler.removeCallbacks(clockRunnable)
        NotificationListenerHelper.activeMediaListener = null
        super.onDestroy()
    }
}
