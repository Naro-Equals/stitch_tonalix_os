package com.tonalix.tvlauncher

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class AppManagerActivity : AppCompatActivity() {

    private lateinit var rvManagedApps: RecyclerView
    private lateinit var btnClearAllCache: Button
    private lateinit var btnRefreshApps: Button

    data class ManagedAppItem(
        val appName: String,
        val packageName: String,
        val icon: android.graphics.drawable.Drawable?,
        val isSystem: Boolean
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_app_manager)

        rvManagedApps = findViewById(R.id.rvManagedApps)
        btnClearAllCache = findViewById(R.id.btnClearAllCache)
        btnRefreshApps = findViewById(R.id.btnRefreshApps)

        btnClearAllCache.setOnClickListener {
            Toast.makeText(this, "🧹 Limpieza general de caché iniciada...", Toast.LENGTH_SHORT).show()
            val intent = Intent(Settings.ACTION_SETTINGS)
            SafeIntentHelper.safeStart(this, intent)
        }

        btnRefreshApps.setOnClickListener {
            loadInstalledApps()
            Toast.makeText(this, "Lista de apps actualizada", Toast.LENGTH_SHORT).show()
        }

        loadInstalledApps()
    }

    private fun loadInstalledApps() {
        val pm = packageManager
        val packages = pm.getInstalledPackages(0)
        val appList = mutableListOf<ManagedAppItem>()

        for (pkg in packages) {
            val appInfo = pkg.applicationInfo ?: continue
            val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            val appName = appInfo.loadLabel(pm).toString()
            val icon = try { appInfo.loadIcon(pm) } catch (_: Exception) { null }

            appList.add(
                ManagedAppItem(
                    appName = appName,
                    packageName = pkg.packageName,
                    icon = icon,
                    isSystem = isSystem
                )
            )
        }

        // Sort user apps first, then system apps alphabetically
        appList.sortWith(compareBy({ it.isSystem }, { it.appName.lowercase() }))

        val adapter = ManagedAppAdapter(appList) { app ->
            showAppActionDialog(app)
        }
        rvManagedApps.adapter = adapter
    }

    private fun showAppActionDialog(app: ManagedAppItem) {
        val options = arrayOf(
            "🚀 Abrir Aplicación",
            "⚙️ Ver Información y Ajustes",
            "🗑️ Desinstalar / Borrar",
            "⚠️ Forzar Detención"
        )

        AlertDialog.Builder(this)
            .setTitle(app.appName)
            .setItems(options) { _, which ->
                when (which) {
                    0 -> {
                        val intent = packageManager.getLaunchIntentForPackage(app.packageName)
                        if (intent != null) {
                            SafeIntentHelper.safeStart(this, intent)
                        } else {
                            Toast.makeText(this, "Esta app no tiene interfaz de inicio", Toast.LENGTH_SHORT).show()
                        }
                    }
                    1 -> {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", app.packageName, null)
                        }
                        SafeIntentHelper.safeStart(this, intent)
                    }
                    2 -> {
                        if (app.isSystem) {
                            Toast.makeText(this, "Es una app del sistema. Usa ADB o Launcher Manager para congelarla.", Toast.LENGTH_LONG).show()
                        } else {
                            val intent = Intent(Intent.ACTION_DELETE).apply {
                                data = Uri.parse("package:${app.packageName}")
                            }
                            SafeIntentHelper.safeStart(this, intent)
                        }
                    }
                    3 -> {
                        Toast.makeText(this, "Ve a Información de la app para Forzar Detención", Toast.LENGTH_LONG).show()
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", app.packageName, null)
                        }
                        SafeIntentHelper.safeStart(this, intent)
                    }
                }
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    class ManagedAppAdapter(
        private val apps: List<ManagedAppItem>,
        private val onClick: (ManagedAppItem) -> Unit
    ) : RecyclerView.Adapter<ManagedAppAdapter.ViewHolder>() {

        class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val ivIcon: ImageView = view.findViewById(R.id.ivAppIcon)
            val tvName: TextView = view.findViewById(R.id.tvAppName)
            val tvPkg: TextView = view.findViewById(R.id.tvAppPackage)
            val btnAction: Button = view.findViewById(R.id.btnAppAction)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context).inflate(R.layout.item_managed_app, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val app = apps[position]
            holder.tvName.text = "${app.appName} ${if (app.isSystem) "⚙️ [Sistema]" else ""}"
            holder.tvPkg.text = app.packageName
            if (app.icon != null) {
                holder.ivIcon.setImageDrawable(app.icon)
            } else {
                holder.ivIcon.setImageResource(R.mipmap.ic_launcher)
            }

            holder.itemView.setOnClickListener { onClick(app) }
            holder.btnAction.setOnClickListener { onClick(app) }
        }

        override fun getItemCount() = apps.size
    }
}
