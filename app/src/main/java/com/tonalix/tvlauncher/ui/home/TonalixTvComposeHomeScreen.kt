package com.tonalix.tvlauncher.ui.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tonalix.tvlauncher.DeviceProfiler

enum class TvPresetLayout(val label: String) {
    TONALIX_DOCK("Tonalix Dock"),
    FIRE_TV("Fire TV Stick"),
    ANDROID_TV("Android TV Clásico"),
    SOLO_APPS("Solo Apps Ligero"),
    DOCK_ZEN("Dock Zen Minimal"),
    SIDEBAR_PRO("Barra Lateral Pro"),
    CINE_COMPACTO("Cine Compacto")
}

data class TvAppItem(
    val id: String,
    val name: String,
    val subtitle: String,
    val category: String,
    val colorHex: Long,
    val icon: ImageVector,
    val packageName: String = ""
)

val SAMPLE_TV_APPS = listOf(
    TvAppItem("youtube", "YouTube", "Vídeos, directos y canales 4K", "streaming", 0xFFFF0033, Icons.Default.OndemandVideo, "com.google.android.youtube.tv"),
    TvAppItem("vlc", "VLC Media", "Reproductor USB & Red", "utilidades", 0xFFFF8800, Icons.Default.PlayCircle, "org.videolan.vlc"),
    TvAppItem("ytmusic", "YouTube Music", "Música y videoclips 4K", "streaming", 0xFFFF1744, Icons.Default.MusicNote, "com.google.android.apps.youtube.music"),
    TvAppItem("netflix", "Netflix", "Series, cine y documentales", "streaming", 0xFFE50914, Icons.Default.Movie, "com.netflix.ninja"),
    TvAppItem("prime", "Prime Video", "Cine, series y deportes", "streaming", 0xFF00A8E1, Icons.Default.LiveTv, "com.amazon.avod"),
    TvAppItem("spotify", "Spotify", "Música y podcasts", "streaming", 0xFF1DB954, Icons.Default.Radio, "com.spotify.tv.android"),
    TvAppItem("vix", "ViX", "Novelas, cine y TV en vivo", "streaming", 0xFFFF5A1F, Icons.Default.Tv, "com.tova.vix"),
    TvAppItem("smarttube", "SmartTube", "Reproductor ligero sin pausas", "streaming", 0xFFE11D48, Icons.Default.PlayArrow, "org.smarttube.tv"),
    TvAppItem("stremio", "Stremio", "Centro de catálogo multimedia", "streaming", 0xFF8A5CF5, Icons.Default.VideoLibrary, "com.stremio.one"),
    TvAppItem("kodi", "Kodi", "Centro multimedia local", "streaming", 0xFF17B2E7, Icons.Default.FolderSpecial, "org.xbmc.kodi"),
    TvAppItem("xbox", "Xbox Cloud", "Juegos de consola en nube", "juegos", 0xFF107C10, Icons.Default.SportsEsports, "com.microsoft.xboxone.smartglass"),
    TvAppItem("retroarch", "RetroArch", "Emulación clásica multi-consola", "juegos", 0xFF334155, Icons.Default.Games, "com.retroarch"),
    TvAppItem("moonlight", "Moonlight", "Streaming PC a TV en 4K 60fps", "juegos", 0xFF0284C7, Icons.Default.Tv, "com.limelight"),
    TvAppItem("steamlink", "Steam Link", "Transmite tu librería de Steam", "juegos", 0xFF0F172A, Icons.Default.Computer, "com.valvesoftware.steamlink")
)

/**
 * TonalixTvHomeScreen: Pantalla Principal ADAPTATIVA SEGÚN DISPOSITIVO.
 * Detecta automáticamente el hardware (Fire TV, Xiaomi, Google TV, Shield) y ajusta
 * de forma dinámica los presets, efectos visuales, presupuesto de RAM y telemetría.
 */
@Composable
fun TonalixTvHomeScreen(
    deviceInfo: DeviceProfiler.DeviceInfo? = null,
    activeUserLabel: String = "Inicio Principal",
    onLaunchApp: (TvAppItem) -> Unit = {},
    onOpenSettings: () -> Unit = {},
    onLockSession: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val configuration = LocalConfiguration.current
    val screenWidth = configuration.screenWidthDp.dp
    val screenHeight = configuration.screenHeightDp.dp

    // Autodetectar preset óptimo según perfil de hardware
    val initialPreset = remember(deviceInfo) {
        when {
            deviceInfo?.isFireTv == true && deviceInfo.ramTier == DeviceProfiler.RamTier.LOW_RAM_1_5GB -> TvPresetLayout.TONALIX_DOCK
            deviceInfo?.isFireTv == true -> TvPresetLayout.FIRE_TV
            deviceInfo?.isXiaomi == true || deviceInfo?.ecosystem == DeviceProfiler.Ecosystem.OFFICIAL_ANDROID_TV -> TvPresetLayout.ANDROID_TV
            else -> TvPresetLayout.FIRE_TV
        }
    }

    var selectedPreset by remember { mutableStateOf(initialPreset) }
    var activeTab by remember { mutableStateOf("Inicio") }
    var ramUsedMb by remember { mutableIntStateOf((deviceInfo?.freeRamMb?.toInt() ?: 386)) }
    var focusedApp by remember { mutableStateOf(SAMPLE_TV_APPS[3]) } // Prime Video default

    // Dimensiones proporcionales calculadas una sola vez
    val overscanPadding = remember(screenWidth) { (screenWidth * 0.025f).coerceIn(16.dp, 36.dp) }
    val heroBannerHeight = remember(screenHeight) { (screenHeight * 0.32f).coerceIn(180.dp, 280.dp) }
    val cardWidth = remember(screenWidth) { (screenWidth * 0.15f).coerceIn(160.dp, 220.dp) }
    val cardHeight = remember(cardWidth) { (cardWidth * 0.60f).coerceIn(96.dp, 132.dp) }

    // Listas filtradas memoizadas
    val featuredApps = remember { SAMPLE_TV_APPS.take(7) }
    val streamingApps = remember { SAMPLE_TV_APPS.filter { it.category == "streaming" } }
    val gameApps = remember { SAMPLE_TV_APPS.filter { it.category == "juegos" } }

    val bgGradient = remember {
        Brush.radialGradient(
            colors = listOf(
                Color(0xFF111723),
                Color(0xFF080B10),
                Color(0xFF040508)
            ),
            radius = 1800f
        )
    }

    val ambientGlowBrush = remember(focusedApp.colorHex) {
        Brush.radialGradient(
            colors = listOf(
                Color(focusedApp.colorHex).copy(alpha = 0.20f),
                Color.Transparent
            )
        )
    }

    // Identificador dinámico de telemetría de dispositivo
    val deviceTelemetryText = remember(deviceInfo) {
        if (deviceInfo != null) {
            val name = if (deviceInfo.isFireTv) deviceInfo.fireTvModelName else "${deviceInfo.manufacturer} ${deviceInfo.model}"
            val ramStr = "%.1f GB RAM".format(deviceInfo.totalRamGb)
            "$name • $ramStr • ${deviceInfo.ecosystem.name}"
        } else {
            "TV Box • 1.5-2 GB RAM • Android TV 11"
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgGradient)
            .padding(horizontal = overscanPadding, vertical = overscanPadding / 1.5f)
    ) {
        // Dynamic Ambient Glow (Desactivado automáticamente en dispositivos Low-RAM para garantizar 60 FPS)
        if (deviceInfo?.ramTier != DeviceProfiler.RamTier.LOW_RAM_1_5GB) {
            Box(
                modifier = Modifier
                    .size(screenWidth * 0.5f, screenHeight * 0.4f)
                    .align(Alignment.TopCenter)
                    .background(ambientGlowBrush)
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // 1. BARRA SUPERIOR TOPBAR
            TonalixResponsiveTopBar(
                activeTab = activeTab,
                activeUserLabel = activeUserLabel,
                ramUsedMb = ramUsedMb,
                onTabSelect = { activeTab = it },
                onTurboBoost = { ramUsedMb = 195 },
                onOpenSettings = onOpenSettings,
                onLockSession = onLockSession
            )

            Spacer(modifier = Modifier.height(14.dp))

            // 2. TIRA DE PRESETS Y TELEMETRÍA DINÁMICA DE DISPOSITIVO
            TonalixResponsivePresetStrip(
                selectedPreset = selectedPreset,
                deviceTelemetryText = deviceTelemetryText,
                onPresetSelect = { selectedPreset = it }
            )

            Spacer(modifier = Modifier.height(18.dp))

            // 3. HERO BANNER CINEMÁTICO (Visualmente personalizado según layout preset)
            if (selectedPreset == TvPresetLayout.FIRE_TV || selectedPreset == TvPresetLayout.ANDROID_TV || selectedPreset == TvPresetLayout.CINE_COMPACTO) {
                TonalixHeroBannerResponsive(
                    bannerHeight = heroBannerHeight,
                    title = if (deviceInfo?.isFireTv == true) "Experiencia Fire TV Stick 4K" else "Horizonte de Obsidiana",
                    subtitle = if (deviceInfo?.isFireTv == true) "AMAZON FIRE OS · RECOMENDADO PARA TU DISPOSITIVO" else "FIRE TV · AHORA EN STREAMING EN PLEX",
                    meta = "Película · 4K HDR · Dolby Atmos · 42 min restantes",
                    onPlayClick = {
                        onLaunchApp(focusedApp)
                    }
                )
                Spacer(modifier = Modifier.height(22.dp))
            }

            // 4. FILAS HORIZONTALES ADAPTABLES
            TvAppRowResponsive(
                title = "Tus aplicaciones",
                cardWidth = cardWidth,
                cardHeight = cardHeight,
                apps = featuredApps,
                onFocusedChange = { focusedApp = it },
                onLaunchApp = onLaunchApp
            )

            Spacer(modifier = Modifier.height(20.dp))

            TvAppRowResponsive(
                title = "Streaming y TV en vivo",
                cardWidth = cardWidth,
                cardHeight = cardHeight,
                apps = streamingApps,
                onFocusedChange = { focusedApp = it },
                onLaunchApp = onLaunchApp
            )

            Spacer(modifier = Modifier.height(20.dp))

            TvAppRowResponsive(
                title = "Juegos y nube",
                cardWidth = cardWidth,
                cardHeight = cardHeight,
                apps = gameApps,
                onFocusedChange = { focusedApp = it },
                onLaunchApp = onLaunchApp
            )

            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}

@Composable
fun TonalixResponsiveTopBar(
    activeTab: String,
    activeUserLabel: String,
    ramUsedMb: Int,
    onTabSelect: (String) -> Unit,
    onTurboBoost: () -> Unit,
    onOpenSettings: () -> Unit,
    onLockSession: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(48.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Branding Logo & Navigation Tabs
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Tonalix TV",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                letterSpacing = (-0.5).sp
            )

            Spacer(modifier = Modifier.width(28.dp))

            listOf("Inicio", "Aplicaciones", "Entradas").forEach { tab ->
                val isActive = tab == activeTab
                val interactionSource = remember { MutableInteractionSource() }
                val isFocused by interactionSource.collectIsFocusedAsState()

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .height(44.dp)
                        .padding(horizontal = 12.dp)
                        .clickable(interactionSource = interactionSource, indication = null) { onTabSelect(tab) }
                        .focusable(interactionSource = interactionSource),
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = tab,
                        fontSize = 15.sp,
                        fontWeight = if (isActive || isFocused) FontWeight.Bold else FontWeight.Medium,
                        color = when {
                            isActive -> Color.White
                            isFocused -> Color(0xFF00E5FF)
                            else -> Color(0xFF90A4AE)
                        }
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(
                        modifier = Modifier
                            .height(3.dp)
                            .width(if (isActive) 28.dp else if (isFocused) 16.dp else 0.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(if (isActive) Color(0xFFFBBF24) else Color(0xFF00E5FF))
                    )
                }
            }
        }

        // Quick System Bar Icons (Target Mínimo 44dp x 44dp)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            IconButton44(icon = Icons.Default.Search, contentDescription = "Buscar")

            // RAM Turbo Boost Badge
            Box(
                modifier = Modifier
                    .height(42.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF161C24))
                    .border(1.dp, Color(0xFF26323D), RoundedCornerShape(10.dp))
                    .clickable { onTurboBoost() }
                    .padding(horizontal = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.FlashOn, contentDescription = null, tint = Color(0xFF34D399), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "$ramUsedMb MB", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }

            IconButton44(icon = Icons.Default.SportsEsports, contentDescription = "Modo Juego")
            IconButton44(icon = Icons.Default.Tv, contentDescription = "Entradas HDMI")
            IconButton44(icon = Icons.Default.Wifi, contentDescription = "Wi-Fi 5 GHz")
            IconButton44(icon = Icons.Default.Bluetooth, contentDescription = "Bluetooth")
            IconButton44(icon = Icons.Default.QrCode, contentDescription = "Compartir QR")

            // User Lock Profile Pill
            Box(
                modifier = Modifier
                    .height(42.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF00E5FF).copy(alpha = 0.15f))
                    .border(1.dp, Color(0xFF00E5FF), RoundedCornerShape(20.dp))
                    .clickable { onLockSession() }
                    .padding(horizontal = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .background(Color(0xFF00E5FF), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "I", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Black)
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = activeUserLabel, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.Lock, contentDescription = "Bloquear", tint = Color(0xFF00E5FF), modifier = Modifier.size(13.dp))
                }
            }

            IconButton44(icon = Icons.Default.Settings, contentDescription = "Ajustes", onClick = onOpenSettings)
            IconButton44(icon = Icons.Default.PowerSettingsNew, contentDescription = "Apagar TV", tint = Color(0xFFFF4A5A), onClick = onLockSession)

            Text(
                text = "22:43",
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                modifier = Modifier.padding(start = 6.dp)
            )
        }
    }
}

@Composable
fun IconButton44(
    icon: ImageVector,
    contentDescription: String,
    tint: Color = Color(0xFF90A4AE),
    onClick: () -> Unit = {}
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()

    Box(
        modifier = Modifier
            .size(42.dp)
            .clip(CircleShape)
            .background(if (isFocused) Color(0xFF00E5FF).copy(alpha = 0.2f) else Color.Transparent)
            .border(if (isFocused) 1.5.dp else 0.dp, if (isFocused) Color(0xFF00E5FF) else Color.Transparent, CircleShape)
            .clickable(interactionSource = interactionSource, indication = null) { onClick() }
            .focusable(interactionSource = interactionSource),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = if (isFocused) Color.White else tint,
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
fun TonalixResponsivePresetStrip(
    selectedPreset: TvPresetLayout,
    deviceTelemetryText: String,
    onPresetSelect: (TvPresetLayout) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Layout Presets Chips
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            TvPresetLayout.values().forEach { preset ->
                val isSelected = preset == selectedPreset
                val interactionSource = remember { MutableInteractionSource() }
                val isFocused by interactionSource.collectIsFocusedAsState()

                Box(
                    modifier = Modifier
                        .height(42.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            when {
                                isSelected -> Color(0xFFFBBF24)
                                isFocused -> Color(0xFF26323D)
                                else -> Color(0xFF12161F)
                            }
                        )
                        .border(
                            width = if (isSelected || isFocused) 1.5.dp else 1.dp,
                            color = if (isSelected) Color(0xFFFBBF24) else if (isFocused) Color(0xFF00E5FF) else Color(0xFF26323D),
                            shape = RoundedCornerShape(10.dp)
                        )
                        .clickable(interactionSource = interactionSource, indication = null) { onPresetSelect(preset) }
                        .focusable(interactionSource = interactionSource)
                        .padding(horizontal = 14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = preset.label,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected || isFocused) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.Black else Color.White
                    )
                }
            }
        }

        // Telemetría Dinámica detectada en tiempo real
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = Color(0xFFFBBF24).copy(alpha = 0.15f),
                shape = RoundedCornerShape(6.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFBBF24).copy(alpha = 0.4f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.NightsStay, contentDescription = null, tint = Color(0xFFFBBF24), modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Modo Noche cálido", fontSize = 11.sp, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                }
            }

            Text(
                text = deviceTelemetryText,
                fontSize = 11.sp,
                color = Color(0xFF90A4AE),
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun TonalixHeroBannerResponsive(
    bannerHeight: Dp,
    title: String,
    subtitle: String,
    meta: String,
    onPlayClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF101622)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF26323D)),
        modifier = Modifier
            .fillMaxWidth()
            .height(bannerHeight)
            .shadow(16.dp, spotColor = Color(0x66000000))
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Gradient Vignette Scrim
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF080B10),
                                Color(0xFF080B10).copy(alpha = 0.88f),
                                Color(0xFF080B10).copy(alpha = 0.35f),
                                Color.Transparent
                            )
                        )
                    )
            )

            // Content Container
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .widthIn(max = 580.dp)
                    .padding(horizontal = 28.dp, vertical = 20.dp),
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = subtitle,
                    fontSize = 12.sp,
                    color = Color(0xFF00E5FF),
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = title,
                    fontSize = 30.sp,
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    lineHeight = 36.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = meta,
                    fontSize = 13.sp,
                    color = Color(0xFF90A4AE),
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Button(
                        onClick = onPlayClick,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFBBF24)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.height(46.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Más información", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp)
                    }

                    OutlinedButton(
                        onClick = {},
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF90A4AE)),
                        modifier = Modifier.height(46.dp)
                    ) {
                        Text(text = "Siguiente", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun TvAppRowResponsive(
    title: String,
    cardWidth: Dp,
    cardHeight: Dp,
    apps: List<TvAppItem>,
    onFocusedChange: (TvAppItem) -> Unit,
    onLaunchApp: (TvAppItem) -> Unit
) {
    Column {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 10.dp)
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(end = 24.dp)
        ) {
            items(items = apps, key = { it.id }) { app ->
                TvAppCardResponsiveItem(
                    app = app,
                    cardWidth = cardWidth,
                    cardHeight = cardHeight,
                    onFocus = { onFocusedChange(app) },
                    onLaunch = { onLaunchApp(app) }
                )
            }
        }
    }
}

/**
 * Tarjeta de Aplicación ADAPTABLE con reciclaje de vistas instantáneo.
 */
@Composable
fun TvAppCardResponsiveItem(
    app: TvAppItem,
    cardWidth: Dp,
    cardHeight: Dp,
    onFocus: () -> Unit,
    onLaunch: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()

    LaunchedEffect(isFocused) {
        if (isFocused) onFocus()
    }

    val cardScale by animateFloatAsState(
        targetValue = if (isFocused) 1.06f else 1.0f,
        animationSpec = tween(durationMillis = 150)
    )

    val cardBgGradient = remember(app.colorHex) {
        Brush.verticalGradient(
            colors = listOf(
                Color(app.colorHex).copy(alpha = 0.35f),
                Color(0xFF0A0E17)
            )
        )
    }

    Column(
        modifier = Modifier
            .width(cardWidth)
            .scale(cardScale),
        horizontalAlignment = Alignment.Start
    ) {
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color(app.colorHex).copy(alpha = 0.28f)),
            border = androidx.compose.foundation.BorderStroke(
                width = if (isFocused) 2.5.dp else 1.dp,
                color = if (isFocused) Color(0xFFFBBF24) else Color(0xFF26323D)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .height(cardHeight)
                .clickable(interactionSource = interactionSource, indication = null) { onLaunch() }
                .focusable(interactionSource = interactionSource)
                .shadow(if (isFocused) 16.dp else 2.dp, spotColor = if (isFocused) Color(0xFFFBBF24) else Color.Transparent)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(cardBgGradient)
                    .padding(12.dp),
                contentAlignment = Alignment.Center
            ) {
                if (isFocused) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Opciones M",
                        tint = Color(0xFFFBBF24),
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .size(18.dp)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = app.icon,
                            contentDescription = app.name,
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = app.name,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = app.name,
            color = if (isFocused) Color.White else Color(0xFF90A4AE),
            fontSize = 12.sp,
            fontWeight = if (isFocused) FontWeight.Bold else FontWeight.Medium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@androidx.compose.ui.tooling.preview.Preview(device = "id:tv_1080p", showBackground = true)
@Composable
fun TonalixTvHomeScreenPreview() {
    TonalixTvHomeScreen(
        activeUserLabel = "Inicio Principal"
    )
}
