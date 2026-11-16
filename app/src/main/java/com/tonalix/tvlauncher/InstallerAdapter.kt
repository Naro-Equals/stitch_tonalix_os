package com.tonalix.tvlauncher

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class InstallerAdapter(
    private val recommendedApps: List<RecommendedApp>,
    private val onInstallClick: (RecommendedApp) -> Unit
) : RecyclerView.Adapter<InstallerAdapter.InstallViewHolder>() {

    class InstallViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val ivIcon: ImageView = itemView.findViewById(R.id.ivRecIcon)
        val tvName: TextView = itemView.findViewById(R.id.tvRecName)
        val tvDesc: TextView = itemView.findViewById(R.id.tvRecDescription)
        val tvCategory: TextView = itemView.findViewById(R.id.tvRecCategory)
        val btnInstall: Button = itemView.findViewById(R.id.btnRecInstall)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InstallViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_recommended_app, parent, false)
        return InstallViewHolder(view)
    }

    override fun onBindViewHolder(holder: InstallViewHolder, position: Int) {
        val app = recommendedApps[position]
        holder.tvName.text = app.name
        holder.tvDesc.text = app.description
        holder.tvCategory.text = app.category

        if (!app.iconUrl.isNullOrBlank()) {
            com.bumptech.glide.Glide.with(holder.itemView.context)
                .load(app.iconUrl)
                .placeholder(app.iconResId)
                .error(app.iconResId)
                .into(holder.ivIcon)
        } else {
            holder.ivIcon.setImageResource(app.iconResId)
        }

        holder.btnInstall.setOnClickListener {
            onInstallClick(app)
        }
    }

    override fun getItemCount(): Int = recommendedApps.size
}