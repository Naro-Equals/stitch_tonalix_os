package com.tonalix.tvlauncher

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch

class AppInstallerActivity : AppCompatActivity() {

    private lateinit var installerManager: AppInstallerManager
    private lateinit var pbDownload: ProgressBar
    private lateinit var tvStatus: TextView
    private lateinit var rvApps: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_installer)

        installerManager = AppInstallerManager(this)
        pbDownload = findViewById(R.id.pbGlobalDownload)
        tvStatus = findViewById(R.id.tvDownloadStatus)
        rvApps = findViewById(R.id.rvRecommendedApps)

        val deviceInfo = DeviceProfiler.profileDevice(this)
        val recommendedApps = installerManager.getRecommendedApps(deviceInfo)

        val adapter = InstallerAdapter(recommendedApps) { app ->
            startApkDownload(app)
        }
        rvApps.adapter = adapter
    }

    private fun startApkDownload(app: RecommendedApp) {
        pbDownload.visibility = View.VISIBLE
        tvStatus.visibility = View.VISIBLE
        pbDownload.progress = 0
        tvStatus.text = "Iniciando descarga de ${app.name}..."

        lifecycleScope.launch {
            val fileName = "${app.packageName}.apk"
            val success = installerManager.downloadAndInstallApk(app.downloadUrl, fileName) { progress ->
                pbDownload.progress = progress
                tvStatus.text = "Descargando ${app.name}: $progress%"
            }

            if (!success) {
                pbDownload.visibility = View.GONE
                tvStatus.text = "Error al descargar ${app.name}"
                Toast.makeText(this@AppInstallerActivity, "Error al descargar APK", Toast.LENGTH_SHORT).show()
            }
        }
    }
}