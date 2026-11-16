package com.tonalix.tvlauncher

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log

class LocalFirewallService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    companion object {
        private const val TAG = "LocalFirewallService"
        const val ACTION_START_FIREWALL = "com.tonalix.tvlauncher.START_FIREWALL"
        const val ACTION_STOP_FIREWALL = "com.tonalix.tvlauncher.STOP_FIREWALL"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_FIREWALL -> startFirewall()
            ACTION_STOP_FIREWALL -> stopFirewall()
            else -> startFirewall()
        }
        return START_STICKY
    }

    private fun startFirewall() {
        if (isRunning) return
        try {
            val prepareIntent = prepare(this)
            if (prepareIntent != null) {
                Log.w(TAG, "VPN permission not granted by user yet. Cannot start Local Firewall.")
                return
            }

            val builder = Builder()
                .setSession("TonalixTVLocalFirewall")
                .addAddress("10.1.10.1", 24)
                .addRoute("0.0.0.0", 0)

            vpnInterface = builder.establish()
            if (vpnInterface != null) {
                isRunning = true
                Log.i(TAG, "Local VPN Firewall started successfully.")
            } else {
                Log.w(TAG, "VpnService.Builder establish returned null.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start Local VPN Firewall safely", e)
        }
    }

    private fun stopFirewall() {
        if (!isRunning) return
        try {
            vpnInterface?.close()
            vpnInterface = null
            isRunning = false
            stopSelf()
            Log.i(TAG, "Local VPN Firewall stopped.")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping firewall", e)
        }
    }

    override fun onDestroy() {
        stopFirewall()
        super.onDestroy()
    }
}
