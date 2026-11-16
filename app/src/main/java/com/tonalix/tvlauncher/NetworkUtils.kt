package com.tonalix.tvlauncher

import java.net.Inet4Address
import java.net.NetworkInterface
import java.util.Collections

object NetworkUtils {
    /**
     * Finds the local IPv4 address of the device on Wi-Fi or Ethernet.
     * Prioritizes wlan0 and eth0, ignores loopback and VPN interfaces.
     */
    fun getLocalIpAddress(): String? {
        try {
            val interfaces = Collections.list(NetworkInterface.getNetworkInterfaces())
            // First check Wi-Fi and Ethernet interfaces
            val preferredInterfaces = interfaces.filter { iface ->
                !iface.isLoopback && iface.isUp && (iface.name.startsWith("wlan") || iface.name.startsWith("eth"))
            }

            for (iface in preferredInterfaces) {
                val addresses = Collections.list(iface.inetAddresses)
                for (addr in addresses) {
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        val host = addr.hostAddress
                        if (host != null && !host.startsWith("127.")) {
                            return host
                        }
                    }
                }
            }

            // Fallback: any non-loopback active IPv4 interface
            for (iface in interfaces) {
                if (iface.isLoopback || !iface.isUp) continue
                val addresses = Collections.list(iface.inetAddresses)
                for (addr in addresses) {
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        val host = addr.hostAddress
                        if (host != null && !host.startsWith("127.")) {
                            return host
                        }
                    }
                }
            }
        } catch (_: Exception) {}
        return null
    }
}
