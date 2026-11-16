package com.tonalix.tvlauncher

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.CheckBox
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import java.io.File

class DiagnosticAndSecurityActivity : AppCompatActivity() {

    private lateinit var configManager: LauncherConfigManager
    private lateinit var tvDeviceInfo: TextView
    private lateinit var tvPermLocation: TextView
    private lateinit var tvPermNotification: TextView
    private lateinit var tvPermQueryPackages: TextView
    private lateinit var tvPermInstallPackages: TextView
    private lateinit var tvPermDefaultLauncher: TextView
    private lateinit var btnGrantPermissions: Button
    private lateinit var btnOpenAppManager: Button

    private lateinit var cbAdb: CheckBox
    private lateinit var cbFirewall: CheckBox
    private lateinit var cbCursor: CheckBox
    private lateinit var rvAuditApps: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_diagnostic)

        configManager = LauncherConfigManager(this)

        tvDeviceInfo = findViewById(R.id.tvDiagDeviceInfo)
        tvPermLocation = findViewById(R.id.tvPermLocation)
        tvPermNotification = findViewById(R.id.tvPermNotification)
        tvPermQueryPackages = findViewById(R.id.tvPermQueryPackages)
        tvPermInstallPackages = findViewById(R.id.tvPermInstallPackages)
        tvPermDefaultLauncher = findViewById(R.id.tvPermDefaultLauncher)
        btnGrantPermissions = findViewById(R.id.btnGrantPermissions)
        btnOpenAppManager = findViewById(R.id.btnOpenAppManager)

        btnOpenAppManager.setOnClickListener {
            startActivity(Intent(this, AppManagerActivity::class.java))
        }

        cbAdb = findViewById(R.id.cbAdbToggle)
        cbFirewall = findViewById(R.id.cbFirewallToggle)
        cbCursor = findViewById(R.id.cbCursorToggle)
        rvAuditApps = findViewById(R.id.rvSecurityAuditApps)

        setupHealthCheck()
        setupSecurityAudit()
    }

    override fun onResume() {
        super.onResume()
        updatePermissionsStatus()
    }

    private fun setupHealthCheck() {
        val deviceInfo = DeviceProfiler.profileDevice(this)

        val ramProfileText = if (deviceInfo.ramTier == DeviceProfiler.RamTier.LOW_RAM_1_5GB) {
            "Bajo Consumo (≤1.5GB RAM - Blur & Sombras Desactivadas)"
        } else {
            "Alto Rendimiento (>2GB RAM - Animaciones Fluidas & Gradientes)"
        }

        val infoText = """
            Modelo: ${deviceInfo.manufacturer} ${deviceInfo.model}
            Dispositivo: ${deviceInfo.device}
            SDK Android: ${deviceInfo.sdkInt}
            Ecosistema Detectado: ${deviceInfo.ecosystem.name} ${if (deviceInfo.isFireTv) "(${deviceInfo.fireTvModelName})" else ""}
            RAM Total: ${"%.2f".format(deviceInfo.totalRamGb)} GB | Libre: ${deviceInfo.freeRamMb} MB
            Perfil Gráfico: $ramProfileText
        """.trimIndent()

        tvDeviceInfo.text = infoText

        btnGrantPermissions.setOnClickListener {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", packageName, null)
            }
            DeviceProfiler.safeStartActivity(this, intent)
        }

        tvPermNotification.setOnClickListener {
            try {
                val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
                DeviceProfiler.safeStartActivity(this, intent)
            } catch (_: Exception) {
                try {
                    val intent2 = Intent(Settings.ACTION_SETTINGS)
                    DeviceProfiler.safeStartActivity(this, intent2)
                } catch (_: Exception) {}
            }
            androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Permiso de Notificaciones / Media")
                .setMessage("Para que Tonalix TV detecte Spotify y YouTube:\n\n1. En la pantalla de ajustes que se abre, busca **Tonalix TV** y actívalo.\n\n*Nota en FireTV / TV Box:* Si no aparece directo, ve a Ajustes del Sistema -> Aplicaciones / Privacidad / Accesos especiales -> Acceso a notificaciones.")
                .setPositiveButton("Entendido", null)
                .show()
        }
    }

    private fun updatePermissionsStatus() {
        // Location / Weather
        val hasLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        tvPermLocation.text = if (hasLocation) "✅ Ubicación / Clima: Concedido" else "⚠️ Ubicación / Clima: Pendiente"
        tvPermLocation.setTextColor(if (hasLocation) ContextCompat.getColor(this, R.color.status_ok) else ContextCompat.getColor(this, R.color.status_warning))

        // Notification Access
        val enabledListeners = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        val hasNotification = enabledListeners?.contains(packageName) == true
        tvPermNotification.text = if (hasNotification) "✅ Notificaciones / Media: Concedido" else "⚠️ Notificaciones / Media: Pendiente"
        tvPermNotification.setTextColor(if (hasNotification) ContextCompat.getColor(this, R.color.status_ok) else ContextCompat.getColor(this, R.color.status_warning))

        // Query All Packages
        tvPermQueryPackages.text = "✅ Acceso a Apps (QUERY_ALL_PACKAGES): Habilitado"
        tvPermQueryPackages.setTextColor(ContextCompat.getColor(this, R.color.status_ok))

        // Install Packages
        val canInstall = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            packageManager.canRequestPackageInstalls()
        } else {
            true
        }
        tvPermInstallPackages.text = if (canInstall) "✅ Instalación de APKs (REQUEST_INSTALL_PACKAGES): Habilitado" else "⚠️ Instalación de APKs: Pendiente"
        tvPermInstallPackages.setTextColor(if (canInstall) ContextCompat.getColor(this, R.color.status_ok) else ContextCompat.getColor(this, R.color.status_warning))

        // Default Launcher
        val deviceInfo = DeviceProfiler.profileDevice(this)
        if (deviceInfo.isFireTv) {
            tvPermDefaultLauncher.text = "⚠️ Launcher Predeterminado: Bloqueado por FireOS (Usa Launcher Manager)"
            tvPermDefaultLauncher.setTextColor(ContextCompat.getColor(this, R.color.status_warning))
        } else {
            tvPermDefaultLauncher.text = "✅ Launcher Predeterminado: Configurable desde Ajustes"
            tvPermDefaultLauncher.setTextColor(ContextCompat.getColor(this, R.color.status_ok))
        }
    }

    private fun setupSecurityAudit() {
        cbAdb.isChecked = configManager.adbEnabled
        cbFirewall.isChecked = configManager.firewallEnabled
        cbCursor.isChecked = configManager.cursorEnabled

        cbAdb.setOnCheckedChangeListener { _, isChecked ->
            configManager.adbEnabled = isChecked
            toggleNetworkAdb(isChecked)
        }

        cbFirewall.setOnCheckedChangeListener { _, isChecked ->
            configManager.firewallEnabled = isChecked
            toggleLocalFirewall(isChecked)
        }

        cbCursor.setOnCheckedChangeListener { _, isChecked ->
            configManager.cursorEnabled = isChecked
            if (isChecked) {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                DeviceProfiler.safeStartActivity(this, intent)
                Toast.makeText(this, "Activa 'Puntero Seguro Tonalix TV' en Accesibilidad", Toast.LENGTH_LONG).show()
            }
        }

        // Scan installed apps for intrusive permissions
        scanSensitivePermissionApps()
    }

    private fun toggleNetworkAdb(enable: Boolean) {
        try {
            val command = if (enable) "setprop service.adb.tcp.port 5555" else "setprop service.adb.tcp.port -1"
            Runtime.getRuntime().exec(command)
            Toast.makeText(this, if (enable) "ADB por red activado (Puerto 5555)" else "ADB por red desactivado", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Se requiere permiso ADB / Root para cambiar puerto ADB por consola", Toast.LENGTH_SHORT).show()
        }
    }

    private fun toggleLocalFirewall(enable: Boolean) {
        val intent = Intent(this, LocalFirewallService::class.java).apply {
            action = if (enable) LocalFirewallService.ACTION_START_FIREWALL else LocalFirewallService.ACTION_STOP_FIREWALL
        }
        startService(intent)
        Toast.makeText(this, if (enable) "Firewall Local Activado" else "Firewall Local Desactivado", Toast.LENGTH_SHORT).show()
    }

    private fun scanSensitivePermissionApps() {
        val pm = packageManager
        val packages = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
        val auditList = mutableListOf<SecurityAuditItem>()

        for (pkg in packages) {
            if (pkg.packageName == packageName) continue
            val requestedPerms = pkg.requestedPermissions ?: continue

            val sensitivePerms = mutableListOf<String>()
            for (perm in requestedPerms) {
                when (perm) {
                    Manifest.permission.CAMERA -> sensitivePerms.add("CÁMARA")
                    Manifest.permission.RECORD_AUDIO -> sensitivePerms.add("MICRÓFONO")
                    Manifest.permission.SYSTEM_ALERT_WINDOW -> sensitivePerms.add("VENTANA FLOTANTE")
                    Manifest.permission.WRITE_SETTINGS -> sensitivePerms.add("MODIFICAR AJUSTES")
                }
            }

            if (sensitivePerms.isNotEmpty()) {
                val appName = pkg.applicationInfo?.loadLabel(pm)?.toString() ?: pkg.packageName
                val icon = pkg.applicationInfo?.loadIcon(pm)
                val risk = if (sensitivePerms.contains("CÁMARA") || sensitivePerms.contains("MICRÓFONO")) "ALTO" else "MEDIO"

                auditList.add(
                    SecurityAuditItem(
                        appName = appName,
                        packageName = pkg.packageName,
                        icon = icon,
                        permissions = sensitivePerms,
                        riskLevel = risk
                    )
                )
            }
        }

        val adapter = SecurityAuditAdapter(auditList) { item ->
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", item.packageName, null)
            }
            DeviceProfiler.safeStartActivity(this, intent)
        }
        rvAuditApps.adapter = adapter
    }
}