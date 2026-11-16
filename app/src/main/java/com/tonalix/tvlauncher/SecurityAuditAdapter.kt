package com.tonalix.tvlauncher

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class SecurityAuditAdapter(
    private val auditItems: List<SecurityAuditItem>,
    private val onManageClick: (SecurityAuditItem) -> Unit
) : RecyclerView.Adapter<SecurityAuditAdapter.AuditViewHolder>() {

    class AuditViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivAuditIcon)
        val tvName: TextView = itemView.findViewById(R.id.tvAuditAppName)
        val tvPermissions: TextView = itemView.findViewById(R.id.tvAuditPermissions)
        val btnManage: Button = itemView.findViewById(R.id.btnAuditManage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AuditViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_security_app, parent, false)
        return AuditViewHolder(view)
    }

    override fun onBindViewHolder(holder: AuditViewHolder, position: Int) {
        val item = auditItems[position]
        holder.tvName.text = item.appName
        holder.tvPermissions.text = "Permisos (${item.riskLevel}): " + item.permissions.joinToString(", ")
        if (item.icon != null) {
            holder.ivIcon.setImageDrawable(item.icon)
        } else {
            holder.ivIcon.setImageResource(R.mipmap.ic_launcher)
        }

        holder.btnManage.setOnClickListener {
            onManageClick(item)
        }
    }

    override fun getItemCount(): Int = auditItems.size
}