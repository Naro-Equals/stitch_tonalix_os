package com.tonalix.tvlauncher

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class DockAdapter(
    private val apps: List<AppInfo>,
    private val iconSizeDp: Int,
    private val onItemClick: (AppInfo) -> Unit,
    private val onItemLongClick: (AppInfo, Int) -> Unit
) : RecyclerView.Adapter<DockAdapter.DockViewHolder>() {

    class DockViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivAppIcon)
        val tvName: TextView = itemView.findViewById(R.id.tvAppName)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DockViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_dock_app, parent, false)
        return DockViewHolder(view)
    }

    override fun onBindViewHolder(holder: DockViewHolder, position: Int) {
        val app = apps[position]
        holder.tvName.text = app.appName
        if (app.icon != null) {
            holder.ivIcon.setImageDrawable(app.icon)
        } else {
            holder.ivIcon.setImageResource(R.mipmap.ic_launcher)
        }

        // Dynamic Icon Size DP scaling
        val density = holder.itemView.context.resources.displayMetrics.density
        val iconSizePx = (iconSizeDp * density).toInt()
        val layoutParams = holder.ivIcon.layoutParams
        layoutParams.width = iconSizePx
        layoutParams.height = iconSizePx
        holder.ivIcon.layoutParams = layoutParams

        // D-Pad Focus Animation (Zoom 1.15x + smooth elevation shift)
        holder.itemView.onFocusChangeListener = View.OnFocusChangeListener { v, hasFocus ->
            if (hasFocus) {
                v.animate()
                    .scaleX(1.15f)
                    .scaleY(1.15f)
                    .translationZ(8f)
                    .setDuration(150)
                    .start()
            } else {
                v.animate()
                    .scaleX(1.0f)
                    .scaleY(1.0f)
                    .translationZ(0f)
                    .setDuration(150)
                    .start()
            }
        }

        holder.itemView.setOnClickListener {
            onItemClick(app)
        }

        holder.itemView.setOnLongClickListener {
            onItemLongClick(app, position)
            true
        }
    }

    override fun getItemCount(): Int = apps.size
}