package com.tonalix.tvlauncher

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import org.json.JSONObject

class LauncherConfigActivity : AppCompatActivity() {

    private lateinit var configManager: LauncherConfigManager
    private lateinit var userStore: UserProfileStore
    private lateinit var tvConfigDeviceSummary: TextView

    private lateinit var btnBgGradient: Button
    private lateinit var btnBgOled: Button
    private lateinit var btnBgCustom: Button
    private lateinit var btnBgQrTransfer: Button

    private lateinit var cbShowClock: CheckBox
    private lateinit var cbClock24h: CheckBox
    private lateinit var cbShowWeather: CheckBox
    private lateinit var cbShowMediaCapsule: CheckBox
    private lateinit var cbMusicBg: CheckBox
    private lateinit var cbMiniPlayer: CheckBox
    private lateinit var cbVisualEffects: CheckBox
    private lateinit var cbLowRamMode: CheckBox

    private lateinit var cbShowFeaturedBanner: CheckBox
    private lateinit var cbShowBtnSearch: CheckBox
    private lateinit var cbShowBtnTurbo: CheckBox
    private lateinit var cbShowBtnWifi: CheckBox
    private lateinit var cbShowBtnBluetooth: CheckBox
    private lateinit var cbShowBtnGame: CheckBox
    private lateinit var cbShowBtnDistance: CheckBox
    private lateinit var cbShowBtnHealth: CheckBox
    private lateinit var cbShowBtnSecurity: CheckBox
    private lateinit var btnFireTvHelp: Button
    private lateinit var btnSetDefaultLauncher: Button
    private lateinit var tvActiveUserLabel: TextView
    private lateinit var btnSwitchUser: Button
    private lateinit var btnEditUser: Button
    private lateinit var btnCreateUser: Button
    private lateinit var btnSyncExportQr: Button
    private lateinit var btnSyncImport: Button

    private lateinit var btnDockMinus: Button
    private lateinit var btnDockPlus: Button
    private lateinit var tvDockSlotCount: TextView
    private lateinit var btnSelectDockApps: Button
    private lateinit var btnConfigStartupApp: Button

    private lateinit var btnConfigGameMode: Button
    private lateinit var btnConfigViewingDistance: Button
    private lateinit var btnConfigPalette: Button
    private lateinit var cbGameDockAuto: CheckBox

    private var qrServer: QrWallpaperServer? = null
    private var profileSyncServer: ProfileSyncServer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_config)

        configManager = LauncherConfigManager(this)
        userStore = UserProfileStore(this)

        btnBgGradient = findViewById(R.id.btnBgGradient)
        btnBgOled = findViewById(R.id.btnBgOled)
        btnBgCustom = findViewById(R.id.btnBgCustom)
        btnBgQrTransfer = findViewById(R.id.btnBgQrTransfer)

        cbShowClock = findViewById(R.id.cbShowClock)
        cbClock24h = findViewById(R.id.cbClock24h)
        cbShowWeather = findViewById(R.id.cbShowWeather)
        cbShowMediaCapsule = findViewById(R.id.cbShowMediaCapsule)
        cbMusicBg = findViewById(R.id.cbMusicBg)
        cbMiniPlayer = findViewById(R.id.cbMiniPlayer)
        cbVisualEffects = findViewById(R.id.cbVisualEffects)
        cbLowRamMode = findViewById(R.id.cbLowRamMode)

        cbShowFeaturedBanner = findViewById(R.id.cbShowFeaturedBanner)
        cbShowBtnSearch = findViewById(R.id.cbShowBtnSearch)
        cbShowBtnTurbo = findViewById(R.id.cbShowBtnTurbo)
        cbShowBtnWifi = findViewById(R.id.cbShowBtnWifi)
        cbShowBtnBluetooth = findViewById(R.id.cbShowBtnBluetooth)
        cbShowBtnGame = findViewById(R.id.cbShowBtnGame)
        cbShowBtnDistance = findViewById(R.id.cbShowBtnDistance)
        cbShowBtnHealth = findViewById(R.id.cbShowBtnHealth)
        cbShowBtnSecurity = findViewById(R.id.cbShowBtnSecurity)
        btnFireTvHelp = findViewById(R.id.btnFireTvHelp)
        btnSetDefaultLauncher = findViewById(R.id.btnSetDefaultLauncher)
        tvActiveUserLabel = findViewById(R.id.tvActiveUserLabel)
        btnSwitchUser = findViewById(R.id.btnSwitchUser)
        btnEditUser = findViewById(R.id.btnEditUser)
        btnCreateUser = findViewById(R.id.btnCreateUser)
        btnSyncExportQr = findViewById(R.id.btnSyncExportQr)
        btnSyncImport = findViewById(R.id.btnSyncImport)

        btnDockMinus = findViewById(R.id.btnDockMinus)
        btnDockPlus = findViewById(R.id.btnDockPlus)
        tvDockSlotCount = findViewById(R.id.tvDockSlotCount)
        btnSelectDockApps = findViewById(R.id.btnSelectDockApps)
        btnConfigStartupApp = findViewById(R.id.btnConfigStartupApp)

        tvConfigDeviceSummary = findViewById(R.id.tvConfigDeviceSummary)
        btnConfigGameMode = findViewById(R.id.btnConfigGameMode)
        btnConfigViewingDistance = findViewById(R.id.btnConfigViewingDistance)
        btnConfigPalette = findViewById(R.id.btnConfigPalette)
        cbGameDockAuto = findViewById(R.id.cbGameDockAuto)

        setupListeners()
        loadCurrentConfig()
    }

    private fun loadCurrentConfig() {
        val deviceInfo = DeviceProfiler.profileDevice(this)
        val recProfile = if (deviceInfo.isLowRamDevice) "⚡ Bajo Consumo Recomendado (Dispositivo ≤1.5GB RAM)" else "✨ Alto Rendimiento (Dispositivo >2GB RAM)"
        tvConfigDeviceSummary.text = "📱 ${deviceInfo.manufacturer} ${deviceInfo.model} (${deviceInfo.ecosystem.name})\n💾 RAM: ${"%.2f".format(deviceInfo.totalRamGb)} GB | ${deviceInfo.freeRamMb} MB Libres\n⚙️ Perfil Automático: $recProfile"
        tvConfigDeviceSummary.setTextColor(ThemeUtils.getAccentColor(this, configManager.themePalette))

        cbShowClock.isChecked = configManager.showClock
        cbClock24h.isChecked = configManager.clock24h
        cbShowWeather.isChecked = configManager.showWeather
        cbShowMediaCapsule.isChecked = configManager.showMediaCapsule
        cbMusicBg.isChecked = configManager.musicBgEnabled
        cbMiniPlayer.isChecked = configManager.miniPlayerEnabled
        cbVisualEffects.isChecked = configManager.visualEffectsEnabled
        cbLowRamMode.isChecked = configManager.lowRamMode
        cbShowFeaturedBanner.isChecked = configManager.showFeaturedBanner
        cbShowBtnSearch.isChecked = configManager.showBtnSearch
        cbShowBtnTurbo.isChecked = configManager.showBtnTurbo
        cbShowBtnWifi.isChecked = configManager.showBtnWifi
        cbShowBtnBluetooth.isChecked = configManager.showBtnBluetooth
        cbShowBtnGame.isChecked = configManager.showBtnGame
        cbShowBtnDistance.isChecked = configManager.showBtnDistance
        cbShowBtnHealth.isChecked = configManager.showBtnHealth
        cbShowBtnSecurity.isChecked = configManager.showBtnSecurity
        tvDockSlotCount.text = configManager.dockSlotCount.toString()

        cbGameDockAuto.isChecked = configManager.gameDockAuto
        updateGameModeButtonText()
        refreshActiveUserLabel()
    }

    private fun refreshActiveUserLabel() {
        val user = userStore.getActiveUser()
        tvActiveUserLabel.text = "Perfil activo: ${user.name} · ${if (user.hasPin) "PIN" else "Libre"}"
    }

    private fun updateGameModeButtonText() {
        if (configManager.gameMode) {
            btnConfigGameMode.text = "🎮 Modo Juego: ACTIVADO"
            btnConfigGameMode.setTextColor(ContextCompat.getColor(this, R.color.theme_emerald))
        } else {
            btnConfigGameMode.text = "🎮 Modo Juego: DESACTIVADO"
            btnConfigGameMode.setTextColor(ContextCompat.getColor(this, R.color.text_primary))
        }
    }

    private fun setupListeners() {
        btnBgGradient.setOnClickListener {
            configManager.bgType = "GRADIENT"
            Toast.makeText(this, "Fondo: Degradado Oscuro", Toast.LENGTH_SHORT).show()
        }

        btnBgOled.setOnClickListener {
            configManager.bgType = "OLED"
            Toast.makeText(this, "Fondo: Negro OLED Puro", Toast.LENGTH_SHORT).show()
        }

        btnBgCustom.setOnClickListener {
            configManager.bgType = "CUSTOM"
            if (configManager.bgCustomPath.isBlank()) {
                Toast.makeText(this, "Sin fondo previo. Usa 'Enviar Fondo por QR' para transferir uno", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Fondo: Imagen Personalizada", Toast.LENGTH_SHORT).show()
            }
        }

        btnBgQrTransfer.setOnClickListener {
            showQrWallpaperDialog()
        }

        cbShowClock.setOnCheckedChangeListener { _, isChecked ->
            configManager.showClock = isChecked
        }

        cbClock24h.setOnCheckedChangeListener { _, isChecked ->
            configManager.clock24h = isChecked
        }

        cbShowWeather.setOnCheckedChangeListener { _, isChecked ->
            configManager.showWeather = isChecked
        }

        cbShowMediaCapsule.setOnCheckedChangeListener { _, isChecked ->
            configManager.showMediaCapsule = isChecked
        }

        cbMusicBg.setOnCheckedChangeListener { _, isChecked ->
            configManager.musicBgEnabled = isChecked
            Toast.makeText(this, if (isChecked) "Fondo dinámico con música activado" else "Fondo dinámico desactivado", Toast.LENGTH_SHORT).show()
        }

        cbMiniPlayer.setOnCheckedChangeListener { _, isChecked ->
            configManager.miniPlayerEnabled = isChecked
        }

        cbVisualEffects.setOnCheckedChangeListener { _, isChecked ->
            configManager.visualEffectsEnabled = isChecked
        }

        cbLowRamMode.setOnCheckedChangeListener { _, isChecked ->
            configManager.lowRamMode = isChecked
            Toast.makeText(this, if (isChecked) "Modo Rendimiento activado (Ideal para TV Boxes)" else "Efectos completos activados", Toast.LENGTH_SHORT).show()
        }

        cbShowFeaturedBanner.setOnCheckedChangeListener { _, isChecked -> configManager.showFeaturedBanner = isChecked }
        cbShowBtnSearch.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnSearch = isChecked }
        cbShowBtnTurbo.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnTurbo = isChecked }
        cbShowBtnWifi.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnWifi = isChecked }
        cbShowBtnBluetooth.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnBluetooth = isChecked }
        cbShowBtnGame.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnGame = isChecked }
        cbShowBtnDistance.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnDistance = isChecked }
        cbShowBtnHealth.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnHealth = isChecked }
        cbShowBtnSecurity.setOnCheckedChangeListener { _, isChecked -> configManager.showBtnSecurity = isChecked }

        btnFireTvHelp.setOnClickListener {
            showFireTvHelpDialog()
        }

        btnSetDefaultLauncher.setOnClickListener {
            openDefaultLauncherFlow()
        }

        btnSwitchUser.setOnClickListener {
            userStore.lockSession()
            startActivity(Intent(this, UserLockActivity::class.java))
            finish()
        }

        btnEditUser.setOnClickListener { showEditUserDialog() }
        btnCreateUser.setOnClickListener { showCreateUserDialog() }
        btnSyncExportQr.setOnClickListener { showProfileSyncExportDialog() }
        btnSyncImport.setOnClickListener { showProfileSyncImportDialog() }

        btnDockMinus.setOnClickListener {
            val current = configManager.dockSlotCount
            if (current > 3) {
                configManager.dockSlotCount = current - 1
                tvDockSlotCount.text = configManager.dockSlotCount.toString()
            }
        }

        btnDockPlus.setOnClickListener {
            val current = configManager.dockSlotCount
            if (current < 8) {
                configManager.dockSlotCount = current + 1
                tvDockSlotCount.text = configManager.dockSlotCount.toString()
            }
        }

        btnSelectDockApps.setOnClickListener {
            showAppSelectionDialog()
        }

        btnConfigStartupApp.setOnClickListener {
            showStartupAppSelectionDialog()
        }

        btnConfigGameMode.setOnClickListener {
            configManager.gameMode = !configManager.gameMode
            updateGameModeButtonText()
            val msg = if (configManager.gameMode) getString(R.string.game_mode_activated) else getString(R.string.game_mode_deactivated)
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }

        cbGameDockAuto.setOnCheckedChangeListener { _, isChecked ->
            configManager.gameDockAuto = isChecked
        }

        btnConfigViewingDistance.setOnClickListener {
            showViewingDistanceDialog()
        }

        btnConfigPalette.setOnClickListener {
            showColorPaletteDialog()
        }
    }

    private fun showViewingDistanceDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_viewing_distance, null)
        val btnNear = dialogView.findViewById<Button>(R.id.btnDistanceNear)
        val btnMedium = dialogView.findViewById<Button>(R.id.btnDistanceMedium)
        val btnFar = dialogView.findViewById<Button>(R.id.btnDistanceFar)
        val btnClose = dialogView.findViewById<Button>(R.id.btnDistanceClose)

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        btnNear.setOnClickListener {
            configManager.viewingDistance = "NEAR"
            configManager.dockIconSizeDp = 56
            Toast.makeText(this, "Distancia Cerca: Iconos y fuentes compactas", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        btnMedium.setOnClickListener {
            configManager.viewingDistance = "MEDIUM"
            configManager.dockIconSizeDp = 64
            Toast.makeText(this, "Distancia Media: Tamaño balanceado estándar", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        btnFar.setOnClickListener {
            configManager.viewingDistance = "FAR"
            configManager.dockIconSizeDp = 76
            Toast.makeText(this, "Distancia Lejos: Iconos y tipografía ampliada para lectura clara", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        btnClose.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
        btnMedium.requestFocus()
    }

    private fun showColorPaletteDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_color_palette, null)
        val btnCyan = dialogView.findViewById<Button>(R.id.btnThemeCyan)
        val btnPurple = dialogView.findViewById<Button>(R.id.btnThemePurple)
        val btnEmerald = dialogView.findViewById<Button>(R.id.btnThemeEmerald)
        val btnSunset = dialogView.findViewById<Button>(R.id.btnThemeSunset)
        val btnCrimson = dialogView.findViewById<Button>(R.id.btnThemeCrimson)
        val btnGold = dialogView.findViewById<Button>(R.id.btnThemeGold)
        val btnClose = dialogView.findViewById<Button>(R.id.btnPaletteClose)

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        fun selectPalette(palette: String, label: String) {
            configManager.themePalette = palette
            tvConfigDeviceSummary.setTextColor(ThemeUtils.getAccentColor(this, palette))
            Toast.makeText(this, "Acento cambiado a $label", Toast.LENGTH_SHORT).show()
            dialog.dismiss()
        }

        btnCyan.setOnClickListener { selectPalette("CYAN", "Cyan Neon") }
        btnPurple.setOnClickListener { selectPalette("PURPLE", "Cyber Purple") }
        btnEmerald.setOnClickListener { selectPalette("EMERALD", "Esmeralda") }
        btnSunset.setOnClickListener { selectPalette("SUNSET", "Sunset Orange") }
        btnCrimson.setOnClickListener { selectPalette("CRIMSON", "Crimson Red") }
        btnGold.setOnClickListener { selectPalette("GOLD", "Electric Gold") }

        btnClose.setOnClickListener { dialog.dismiss() }

        dialog.show()
        btnCyan.requestFocus()
    }

    private fun showQrWallpaperDialog() {
        val ip = NetworkUtils.getLocalIpAddress()
        if (ip == null) {
            Toast.makeText(this, "Conecta el televisor a Wi-Fi o Ethernet para transferir fondos", Toast.LENGTH_LONG).show()
            return
        }

        val url = "http://$ip:8090"
        val qrBitmap = QrCodeUtils.generateQrBitmap(url, 400)

        val dialogView = layoutInflater.inflate(R.layout.dialog_qr_wallpaper, null)
        val ivQr = dialogView.findViewById<ImageView>(R.id.ivQrCode)
        val tvUrl = dialogView.findViewById<TextView>(R.id.tvServerUrl)
        val tvStatus = dialogView.findViewById<TextView>(R.id.tvQrStatus)
        val btnClose = dialogView.findViewById<Button>(R.id.btnQrClose)

        if (qrBitmap != null) {
            ivQr.setImageBitmap(qrBitmap)
        }
        tvUrl.text = url

        val dialog = AlertDialog.Builder(this)
            .setView(dialogView)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        qrServer = QrWallpaperServer(this, 8090)
        qrServer?.start { receivedFile ->
            runOnUiThread {
                configManager.bgType = "CUSTOM"
                configManager.bgCustomPath = receivedFile.absolutePath
                tvStatus.text = getString(R.string.qr_wallpaper_success)
                tvStatus.setTextColor(ContextCompat.getColor(this, R.color.status_ok))
                Toast.makeText(this, "¡Nuevo fondo establecido con éxito!", Toast.LENGTH_SHORT).show()
            }
        }

        dialog.setOnDismissListener {
            qrServer?.stop()
            qrServer = null
        }

        btnClose.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
        btnClose.requestFocus()
    }

    private fun showAppSelectionDialog() {
        val pm = packageManager
        val mainIntent = android.content.Intent(android.content.Intent.ACTION_MAIN, null).apply {
            addCategory(android.content.Intent.CATEGORY_LAUNCHER)
        }
        val installedApps = pm.queryIntentActivities(mainIntent, 0)
        val appNames = installedApps.map { it.loadLabel(pm).toString() }.toTypedArray()
        val appPackages = installedApps.map { it.activityInfo.packageName }.toTypedArray()

        val selectedPackages = configManager.getDockPackages().toMutableList()
        val checkedItems = BooleanArray(appPackages.size) { i ->
            selectedPackages.contains(appPackages[i])
        }

        AlertDialog.Builder(this)
            .setTitle("Seleccionar Apps para el Dock")
            .setMultiChoiceItems(appNames, checkedItems) { _, which, isChecked ->
                val pkg = appPackages[which]
                if (isChecked) {
                    if (!selectedPackages.contains(pkg)) selectedPackages.add(pkg)
                } else {
                    selectedPackages.remove(pkg)
                }
            }
            .setPositiveButton("Guardar") { _, _ ->
                configManager.setDockPackages(selectedPackages)
                Toast.makeText(this, "Dock actualizado con ${selectedPackages.size} apps", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun showFireTvHelpDialog() {
        AlertDialog.Builder(this)
            .setTitle("🔥 Guía Definitiva Fire TV (SweenWolf / Launcher Manager)")
            .setMessage("""
                Para fijar Tonalix TV como launcher permanente en FireOS 7 / FireOS 8 sin que Amazon lo bloquee:

                1. **App Downloader:** Abre Downloader en tu Fire TV e introduce el código de descarga: **2370884** (Instala Launcher Manager de SweenWolf).
                2. **Permisos ADB (Opcional pero recomendado):** Ejecuta por ADB el comando:
                   `pm grant com.wolf.tn android.permission.WRITE_SECURE_SETTINGS`
                3. **Configuración en Launcher Manager:**
                   - Abre Launcher Manager.
                   - **Desactiva las actualizaciones OTA** para impedir que Amazon bloquee el launcher personalizado.
                   - Selecciona **Tonalix TV** como tu Launcher predeterminado.
                4. **Instalación de Tonalix TV:** Usa la función de transferencia QR o descarga local en Tonalix TV para tenerlo instalado. ¡Disfruta de tu nueva interfaz sin anuncios!
            """.trimIndent())
            .setPositiveButton("Entendido", null)
            .show()
    }

    private fun showStartupAppSelectionDialog() {
        val pm = packageManager
        val mainIntent = android.content.Intent(android.content.Intent.ACTION_MAIN, null).apply {
            addCategory(android.content.Intent.CATEGORY_LAUNCHER)
        }
        val installedApps = pm.queryIntentActivities(mainIntent, 0)
        val appNames = mutableListOf("Ninguna (Solo Lanzador)")
        val appPackages = mutableListOf("")
        for (resolveInfo in installedApps) {
            appNames.add(resolveInfo.loadLabel(pm).toString())
            appPackages.add(resolveInfo.activityInfo.packageName)
        }

        val currentStartup = configManager.startupPackage
        var checkedIndex = appPackages.indexOf(currentStartup)
        if (checkedIndex < 0) checkedIndex = 0

        AlertDialog.Builder(this)
            .setTitle("Seleccionar App de Arranque al Iniciar")
            .setSingleChoiceItems(appNames.toTypedArray(), checkedIndex) { dialog, which ->
                configManager.startupPackage = appPackages[which]
                val name = appNames[which]
                Toast.makeText(this, "App de arranque: $name", Toast.LENGTH_SHORT).show()
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun openDefaultLauncherFlow() {
        val deviceInfo = DeviceProfiler.profileDevice(this)
        when (val result = DeviceProfiler.openDefaultHomePicker(this, deviceInfo)) {
            DeviceProfiler.HomePickerResult.FIRE_TV_BLOCKED -> {
                AlertDialog.Builder(this)
                    .setTitle("🏠 Establecer Launcher en Fire TV")
                    .setMessage(
                        """
                        Amazon bloquea el cambio directo de launcher.

                        1. Usa Launcher Manager (FireOS).
                        2. O ADB:
                        adb shell cmd package set-home-activity com.tonalix.tvlauncher/.MainActivity
                        """.trimIndent()
                    )
                    .setPositiveButton("Entendido", null)
                    .show()
            }
            DeviceProfiler.HomePickerResult.ALREADY_DEFAULT ->
                Toast.makeText(this, "Tonalix TV ya es el launcher predeterminado", Toast.LENGTH_LONG).show()
            DeviceProfiler.HomePickerResult.NEED_MANUAL_XIAOMI,
            DeviceProfiler.HomePickerResult.NEED_MANUAL -> {
                AlertDialog.Builder(this)
                    .setTitle(R.string.xiaomi_home_help_title)
                    .setMessage(R.string.xiaomi_home_help_body)
                    .setPositiveButton("Abrir Ajustes") { _, _ ->
                        DeviceProfiler.safeStartActivity(
                            this,
                            Intent(android.provider.Settings.ACTION_SETTINGS)
                        )
                    }
                    .setNegativeButton("Cerrar", null)
                    .show()
            }
            else -> {
                val tip = when (result) {
                    DeviceProfiler.HomePickerResult.OPENED_ROLE -> "Confirma el rol Inicio para Tonalix TV"
                    DeviceProfiler.HomePickerResult.OPENED_CHOOSER -> "Elige Tonalix TV en la lista"
                    DeviceProfiler.HomePickerResult.OPENED_OEM -> "Busca Apps predeterminadas → Pantalla de inicio"
                    else -> "Selecciona Tonalix TV como inicio"
                }
                Toast.makeText(this, tip, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun showEditUserDialog() {
        val user = userStore.getActiveUser()
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val nameInput = EditText(this).apply {
            setText(user.name)
            hint = "Nombre del perfil"
            setTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_primary))
            setHintTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_secondary))
        }
        val pinInput = EditText(this).apply {
            hint = "PIN 4 dígitos (vacío = libre)"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or
                android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD
            setTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_primary))
            setHintTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_secondary))
        }
        val icons = UserProfile.AVATAR_ICONS
        var iconIndex = icons.indexOf(user.avatarIcon).coerceAtLeast(0)
        val iconBtn = Button(this).apply {
            text = "Icono: ${icons[iconIndex]}"
            setOnClickListener {
                iconIndex = (iconIndex + 1) % icons.size
                text = "Icono: ${icons[iconIndex]}"
            }
        }
        container.addView(nameInput)
        container.addView(pinInput)
        container.addView(iconBtn)

        AlertDialog.Builder(this)
            .setTitle("Configurar perfil (${user.name})")
            .setView(container)
            .setPositiveButton("Guardar") { _, _ ->
                val newName = nameInput.text.toString().trim().ifBlank { user.name }
                userStore.updateUser(
                    user.copy(
                        name = newName,
                        avatarIcon = icons[iconIndex]
                    )
                )
                userStore.setPin(user.id, pinInput.text.toString().trim())
                refreshActiveUserLabel()
                Toast.makeText(this, "Perfil actualizado", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun showCreateUserDialog() {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val nameInput = EditText(this).apply {
            hint = "Nombre (ej. Sala)"
            setTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_primary))
            setHintTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_secondary))
        }
        val pinInput = EditText(this).apply {
            hint = "PIN 4 dígitos (opcional)"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or
                android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD
            setTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_primary))
            setHintTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_secondary))
        }
        container.addView(nameInput)
        container.addView(pinInput)

        AlertDialog.Builder(this)
            .setTitle("Nueva sesión blindada")
            .setView(container)
            .setPositiveButton("Crear") { _, _ ->
                val name = nameInput.text.toString().trim()
                if (name.isBlank()) {
                    Toast.makeText(this, "Escribe un nombre", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val created = userStore.createUser(name, pinInput.text.toString().trim())
                userStore.unlockSession(created.id)
                refreshActiveUserLabel()
                Toast.makeText(this, "Creado: ${created.name}", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun showProfileSyncExportDialog() {
        val ip = NetworkUtils.getLocalIpAddress()
        if (ip.isNullOrBlank()) {
            Toast.makeText(this, "Sin IP local. Conecta Wi‑Fi o Ethernet.", Toast.LENGTH_LONG).show()
            return
        }

        profileSyncServer?.stop()
        val server = ProfileSyncServer(8091)
        profileSyncServer = server
        val plain = userStore.exportActiveProfileBundle(configManager).toString()
        val session = server.startWithPayload(plain)
        if (session == null) {
            Toast.makeText(this, "No se pudo abrir el servidor de sync", Toast.LENGTH_LONG).show()
            return
        }

        val qrContent = server.buildHttpUrl(ip, session)
        val qrBitmap = QrCodeUtils.generateQrBitmap(qrContent, 420)
        val dialogView = layoutInflater.inflate(R.layout.dialog_qr_wallpaper, null)
        val ivQr = dialogView.findViewById<ImageView>(R.id.ivQrCode)
        val tvStatus = dialogView.findViewById<TextView>(R.id.tvQrStatus)
        val btnClose = dialogView.findViewById<Button>(R.id.btnQrClose)
        dialogView.findViewById<TextView>(android.R.id.message)?.let { }

        if (qrBitmap != null) ivQr.setImageBitmap(qrBitmap)
        tvStatus.text = "Escanea con el móvil (misma Wi‑Fi).\n$qrContent\nExpira en 5 min · un solo uso."

        val dialog = AlertDialog.Builder(this)
            .setTitle("Enviar perfil por QR")
            .setView(dialogView)
            .setCancelable(false)
            .create()

        btnClose.setOnClickListener {
            profileSyncServer?.stop()
            profileSyncServer = null
            dialog.dismiss()
        }
        dialog.setOnDismissListener {
            profileSyncServer?.stop()
            profileSyncServer = null
        }
        dialog.show()
    }

    private fun showProfileSyncImportDialog() {
        val input = EditText(this).apply {
            hint = "Pega JSON de sync o tonalix://sync?..."
            minLines = 4
            setTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_primary))
            setHintTextColor(ContextCompat.getColor(this@LauncherConfigActivity, R.color.text_secondary))
        }
        val pad = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
            addView(input)
        }

        AlertDialog.Builder(this)
            .setTitle("Importar perfil")
            .setView(pad)
            .setPositiveButton("Aplicar") { _, _ ->
                val raw = input.text.toString().trim()
                if (raw.isBlank()) return@setPositiveButton
                try {
                    when {
                        raw.startsWith("{") -> {
                            val obj = JSONObject(raw)
                            if (obj.has("payload") && obj.has("v")) {
                                Toast.makeText(
                                    this,
                                    "Este JSON sigue cifrado. Ábrelo desde el móvil con la clave del QR o pega el perfil descifrado.",
                                    Toast.LENGTH_LONG
                                ).show()
                                return@setPositiveButton
                            }
                            if (obj.optString("type") == "tonalix_profile_sync" || obj.has("settings")) {
                                val imported = userStore.importProfileBundle(obj, configManager)
                                userStore.unlockSession(imported.id)
                                refreshActiveUserLabel()
                                Toast.makeText(this, "Perfil importado: ${imported.name}", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(this, "JSON no reconocido", Toast.LENGTH_SHORT).show()
                            }
                        }
                        raw.contains("tonalix://sync") || raw.contains("/?t=") -> {
                            importFromSyncUrl(raw)
                        }
                        else -> Toast.makeText(this, "Formato no válido", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this, "Error al importar: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun importFromSyncUrl(raw: String) {
        Thread {
            try {
                val uri = android.net.Uri.parse(
                    when {
                        raw.startsWith("tonalix://") ->
                            raw.replace("tonalix://sync?", "http://local/?")
                        else -> raw
                    }
                )
                val host = uri.getQueryParameter("h") ?: uri.host
                val port = uri.getQueryParameter("p") ?: uri.port.takeIf { it > 0 }?.toString() ?: "8091"
                val token = uri.getQueryParameter("t").orEmpty()
                val key = uri.getQueryParameter("k").orEmpty()
                require(host != null && token.isNotBlank() && key.isNotBlank()) { "URL incompleta" }

                val url = if (raw.startsWith("http")) {
                    val base = raw.substringBefore("?").trimEnd('/')
                    "$base/sync/profile?t=$token"
                } else {
                    "http://$host:$port/sync/profile?t=$token"
                }

                val client = okhttp3.OkHttpClient.Builder()
                    .callTimeout(12, java.util.concurrent.TimeUnit.SECONDS)
                    .build()
                val request = okhttp3.Request.Builder().url(url).get().build()
                client.newCall(request).execute().use { response ->
                    require(response.isSuccessful) { "HTTP ${response.code}" }
                    val body = response.body?.string().orEmpty()
                    val envelope = JSONObject(body)
                    val payload = envelope.getString("payload")
                    val plain = ProfileSyncCrypto.decrypt(payload, key)
                    val profileJson = JSONObject(plain)
                    runOnUiThread {
                        val imported = userStore.importProfileBundle(profileJson, configManager)
                        userStore.unlockSession(imported.id)
                        refreshActiveUserLabel()
                        Toast.makeText(this, "Sync OK: ${imported.name}", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this, "Sync falló: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        qrServer?.stop()
        qrServer = null
        profileSyncServer?.stop()
        profileSyncServer = null
    }
}
