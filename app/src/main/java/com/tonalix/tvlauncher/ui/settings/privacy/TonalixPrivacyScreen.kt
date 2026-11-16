package com.tonalix.tvlauncher.ui.settings.privacy

import android.widget.Toast
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.collectLatest

// ============================================================================
// TONALIX TV - PALETA DE COLORES (Obsidian & Cyan Neon)
// ============================================================================
object TonalixColors {
    val Background = Color(0xFF090F15)
    val Surface = Color(0xFF0E141A)
    val SurfaceCard = Color(0xFF131A22)
    val SurfaceCardHover = Color(0xFF1B2430)
    val SurfaceBorder = Color(0xFF222D39)
    val PrimaryCyan = Color(0xFF00E5FF)
    val PrimaryCyanGlow = Color(0x3300E5FF)
    val AccentEmerald = Color(0xFF00F2C3)
    val AccentEmeraldBg = Color(0x1F00F2C3)
    val TextPrimary = Color(0xFFFFFFFF)
    val TextSecondary = Color(0xFF8E9BAE)
    val TextMuted = Color(0xFF556577)
    val WarningAmber = Color(0xFFFFB300)
    val DangerRed = Color(0xFFFF5252)
}

enum class SettingsCategory(val title: String, val subtitle: String, val icon: ImageVector) {
    NETWORK("Red e Internet", "Wi-Fi 6 Conectado (5GHz)", Icons.Default.Wifi),
    DISPLAY("Pantalla y Video", "4K HDR10+ • 120Hz", Icons.Default.Tv),
    AUDIO("Audio y Salida", "Dolby Atmos • HDMI eARC", Icons.Default.VolumeUp),
    PRIVACY("Privacidad y Seguridad", "Bloqueo telemetría activo [ON]", Icons.Default.Security),
    PERFORMANCE("Modo Rendimiento", "Optimización Ultra-Lite", Icons.Default.FlashOn),
    ABOUT("Acerca de", "Android TV 12 Custom ROM", Icons.Default.Info)
}

@Composable
fun TonalixPrivacyRoute(
    viewModel: TonalixPrivacyViewModel = viewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(viewModel) {
        viewModel.uiEffect.collectLatest { effect ->
            when (effect) {
                is PrivacyUiEffect.ShowToast -> {
                    Toast.makeText(context, effect.message, Toast.LENGTH_SHORT).show()
                }
                is PrivacyUiEffect.PlaySound -> {}
                is PrivacyUiEffect.NavigateBack -> {
                    onNavigateBack()
                }
            }
        }
    }

    TonalixPrivacyScreen(
        uiState = uiState,
        onAction = viewModel::onAction,
        onNavigateBack = onNavigateBack
    )
}

@Composable
fun TonalixPrivacyScreen(
    uiState: PrivacyUiState,
    onAction: (PrivacyUserAction) -> Unit,
    onNavigateBack: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(TonalixColors.Background)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            TonalixTopBar(telemetry = uiState.telemetry)

            Row(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                TonalixSettingsSidebar(
                    selectedCategory = SettingsCategory.PRIVACY,
                    onSelectCategory = {}
                )

                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(1.dp)
                        .background(TonalixColors.SurfaceBorder)
                )

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 26.dp, vertical = 20.dp),
                        verticalArrangement = Arrangement.spacedBy(18.dp)
                    ) {
                        item {
                            PrivacyHeaderSection(
                                isApplying = uiState.isApplyingSettings,
                                onFlushCache = { onAction(PrivacyUserAction.FlushDnsCache) },
                                onApplySettings = { onAction(PrivacyUserAction.ApplyPrivacySettings) }
                            )
                        }

                        item {
                            SecurityDetectionBanner(telemetry = uiState.telemetry, totalBlocked = uiState.totalBlockedQueries)
                        }

                        item {
                            DnsProvidersSection(
                                selectedProvider = uiState.selectedDnsProvider,
                                onSelectProvider = { onAction(PrivacyUserAction.SelectDnsProvider(it)) }
                            )
                        }

                        item {
                            AdBlockAndTelemetryShieldCard(
                                adBlockGlobal = uiState.adBlockGlobalEnabled,
                                onToggleAdBlock = { onAction(PrivacyUserAction.ToggleAdBlockGlobal(it)) },
                                telemetryOem = uiState.telemetryBlockOemEnabled,
                                onToggleTelemetryOem = { onAction(PrivacyUserAction.ToggleTelemetryBlockOem(it)) },
                                smartTubeShield = uiState.smartTubeAdFreeShield,
                                onToggleSmartTube = { onAction(PrivacyUserAction.ToggleSmartTubeShield(it)) },
                                selectedLevel = uiState.selectedBlockingLevel,
                                onSelectLevel = { onAction(PrivacyUserAction.SelectBlockingLevel(it)) },
                                onUpdateRules = { onAction(PrivacyUserAction.UpdateBlocklists) },
                                isUpdatingRules = uiState.isUpdatingBlocklists,
                                activeRulesCount = uiState.telemetry.activeRulesCount
                            )
                        }

                        item {
                            ArmoredSessionAndLeaksCard(
                                isolateSession = uiState.isolateArmoredSession,
                                onToggleIsolate = { onAction(PrivacyUserAction.ToggleArmoredSession(it)) },
                                preventLeak = uiState.preventDnsLeak,
                                onTogglePreventLeak = { onAction(PrivacyUserAction.TogglePreventDnsLeak(it)) },
                                anonymizeMac = uiState.anonymizeMacAddress,
                                onToggleAnonymizeMac = { onAction(PrivacyUserAction.ToggleMacAnonymization(it)) },
                                selectedEncryption = uiState.selectedEncryption,
                                onSelectEncryption = { onAction(PrivacyUserAction.SelectEncryption(it)) }
                            )
                        }
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .width(1.dp)
                        .background(TonalixColors.SurfaceBorder)
                )

                TonalixPrivacyDiagnosticsSidebar(
                    telemetry = uiState.telemetry,
                    isTestingLeak = uiState.isTestingDnsLeak,
                    onRunLeakTest = { onAction(PrivacyUserAction.RunDnsLeakTest) },
                    onResetDefaults = { onAction(PrivacyUserAction.ResetPrivacyDefaults) }
                )
            }

            TonalixBottomBar()
        }
    }
}

@Composable
private fun TonalixTopBar(telemetry: PrivacyTelemetry) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .background(TonalixColors.Surface)
            .border(width = 1.dp, color = TonalixColors.SurfaceBorder)
            .padding(horizontal = 24.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(TonalixColors.PrimaryCyan),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Tv, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
            }
            Spacer(modifier = Modifier.width(10.dp))
            Text(text = "Tonalix", color = TonalixColors.TextPrimary, fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Text(text = "TV", color = TonalixColors.PrimaryCyan, fontWeight = FontWeight.Bold, fontSize = 17.sp)

            Spacer(modifier = Modifier.width(36.dp))

            listOf("Inicio", "Aplicaciones", "Entradas", "Ajustes").forEach { tab ->
                val isSelected = tab == "Ajustes"
                Box(
                    modifier = Modifier
                        .padding(horizontal = 8.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(if (isSelected) TonalixColors.PrimaryCyanGlow else Color.Transparent)
                        .border(1.dp, if (isSelected) TonalixColors.PrimaryCyan else Color.Transparent, RoundedCornerShape(6.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = tab,
                        color = if (isSelected) TonalixColors.PrimaryCyan else TonalixColors.TextSecondary,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
                    )
                }
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            SystemTelemetryBadge(label = "DNS Ping", value = "${telemetry.pingDnsMs}ms", color = TonalixColors.AccentEmerald)
            Spacer(modifier = Modifier.width(12.dp))
            SystemTelemetryBadge(label = "Ads Hoy", value = "${telemetry.blockedAdsToday}", color = TonalixColors.PrimaryCyan)
            Spacer(modifier = Modifier.width(12.dp))
            SystemTelemetryBadge(label = "Filtro RAM", value = "${telemetry.memoryUsageFilterMb} MB", color = TonalixColors.TextSecondary)

            Spacer(modifier = Modifier.width(16.dp))

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF003842))
                    .border(1.dp, TonalixColors.PrimaryCyan, RoundedCornerShape(16.dp))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Lock, contentDescription = null, tint = TonalixColors.PrimaryCyan, modifier = Modifier.size(13.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = "Sesión Blindada", color = TonalixColors.PrimaryCyan, fontSize = 12.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun SystemTelemetryBadge(label: String, value: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(color))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = label, color = TonalixColors.TextMuted, fontSize = 11.sp)
        Spacer(modifier = Modifier.width(4.dp))
        Text(text = value, color = color, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun TonalixSettingsSidebar(
    selectedCategory: SettingsCategory,
    onSelectCategory: (SettingsCategory) -> Unit
) {
    Column(
        modifier = Modifier
            .width(260.dp)
            .fillMaxHeight()
            .background(TonalixColors.Surface)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Row(modifier = Modifier.padding(bottom = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(text = "CONFIGURACIÓN DEL SISTEMA", color = TonalixColors.TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.weight(1f))
                Text(text = "v4.8 PRO", color = TonalixColors.PrimaryCyan, fontSize = 9.sp, fontFamily = FontFamily.Monospace)
            }

            SettingsCategory.values().forEach { category ->
                val isSelected = category == selectedCategory
                SidebarCategoryItem(category = category, isSelected = isSelected, onClick = { onSelectCategory(category) })
                Spacer(modifier = Modifier.height(6.dp))
            }
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(TonalixColors.SurfaceCard)
                .border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(8.dp))
                .padding(12.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(7.dp).clip(CircleShape).background(TonalixColors.PrimaryCyan))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Modo Mando TV", color = TonalixColors.TextPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Usa el D-Pad del control remoto para navegar.", color = TonalixColors.TextMuted, fontSize = 10.sp, lineHeight = 13.sp)
            }
        }
    }
}

@Composable
private fun SidebarCategoryItem(
    category: SettingsCategory,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()

    val bgColor by animateColorAsState(
        targetValue = when {
            isSelected -> TonalixColors.PrimaryCyanGlow
            isFocused -> TonalixColors.SurfaceCardHover
            else -> Color.Transparent
        }, label = "bg"
    )

    val borderColor by animateColorAsState(
        targetValue = when {
            isSelected -> TonalixColors.PrimaryCyan
            isFocused -> TonalixColors.TextSecondary
            else -> Color.Transparent
        }, label = "border"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .focusable(interactionSource = interactionSource)
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = category.icon, contentDescription = null, tint = if (isSelected) TonalixColors.PrimaryCyan else TonalixColors.TextSecondary, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = category.title, color = if (isSelected) TonalixColors.TextPrimary else TonalixColors.TextSecondary, fontSize = 12.sp, fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal)
            Text(text = category.subtitle, color = if (isSelected) TonalixColors.PrimaryCyan else TonalixColors.TextMuted, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun PrivacyHeaderSection(isApplying: Boolean, onFlushCache: () -> Unit, onApplySettings: () -> Unit) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "AJUSTES / PRIVACIDAD Y SEGURIDAD", color = TonalixColors.TextMuted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(6.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text(text = "Protección de Privacidad, DNS Cifrado y Escudo Anti-Anuncios", color = TonalixColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedButton(onClick = onFlushCache, colors = ButtonDefaults.outlinedButtonColors(containerColor = TonalixColors.SurfaceCard), border = androidx.compose.foundation.BorderStroke(1.dp, TonalixColors.SurfaceBorder), shape = RoundedCornerShape(8.dp)) {
                    Text(text = "Purgar Caché DNS", color = TonalixColors.TextPrimary, fontSize = 11.sp)
                }
                Button(onClick = onApplySettings, enabled = !isApplying, colors = ButtonDefaults.buttonColors(containerColor = TonalixColors.PrimaryCyan), shape = RoundedCornerShape(8.dp)) {
                    Text(text = if (isApplying) "Aplicando..." else "Aplicar Ajustes", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun SecurityDetectionBanner(telemetry: PrivacyTelemetry, totalBlocked: Long) {
    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(TonalixColors.SurfaceCard).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(10.dp)).padding(14.dp)) {
        Column {
            Text(text = "ESTADO DEL CORTAFUEGOS & MOTOR DE PRIVACIDAD KERNEL", color = TonalixColors.TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SecurityMetricPill(title = "TOTAL BLOQUEADAS", value = "$totalBlocked", detail = "Sesión", modifier = Modifier.weight(1f))
                SecurityMetricPill(title = "ANUNCIOS HOY", value = "${telemetry.blockedAdsToday}", detail = "Neutralizados", modifier = Modifier.weight(1f))
                SecurityMetricPill(title = "TRACKERS OEM", value = "${telemetry.blockedTrackersCount}", detail = "Frenados", modifier = Modifier.weight(1f))
                SecurityMetricPill(title = "REGLAS", value = "${telemetry.activeRulesCount}", detail = "Activas", modifier = Modifier.weight(1f))
                SecurityMetricPill(title = "PING DNS", value = "${telemetry.pingDnsMs} ms", detail = "Anycast", modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun SecurityMetricPill(title: String, value: String, detail: String, modifier: Modifier = Modifier) {
    Box(modifier = modifier.clip(RoundedCornerShape(6.dp)).background(Color(0xFF0A0F14)).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(6.dp)).padding(8.dp)) {
        Column {
            Text(text = title, color = TonalixColors.TextMuted, fontSize = 8.sp, fontWeight = FontWeight.Bold)
            Text(text = value, color = TonalixColors.TextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Text(text = detail, color = TonalixColors.PrimaryCyan, fontSize = 9.sp)
        }
    }
}

@Composable
private fun DnsProvidersSection(selectedProvider: DnsProvider, onSelectProvider: (DnsProvider) -> Unit) {
    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(TonalixColors.SurfaceCard).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(10.dp)).padding(16.dp)) {
        Column {
            Text(text = "Servidor DNS Privado y Cifrado", color = TonalixColors.TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                DnsProviderCard(DnsProvider.ADGUARD_FILTER, selectedProvider == DnsProvider.ADGUARD_FILTER, { onSelectProvider(DnsProvider.ADGUARD_FILTER) }, Modifier.weight(1f))
                DnsProviderCard(DnsProvider.CLOUDFLARE_ZERO, selectedProvider == DnsProvider.CLOUDFLARE_ZERO, { onSelectProvider(DnsProvider.CLOUDFLARE_ZERO) }, Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                DnsProviderCard(DnsProvider.PI_HOLE_LOCAL, selectedProvider == DnsProvider.PI_HOLE_LOCAL, { onSelectProvider(DnsProvider.PI_HOLE_LOCAL) }, Modifier.weight(1f))
                DnsProviderCard(DnsProvider.NEXTDNS_CUSTOM, selectedProvider == DnsProvider.NEXTDNS_CUSTOM, { onSelectProvider(DnsProvider.NEXTDNS_CUSTOM) }, Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun DnsProviderCard(provider: DnsProvider, isSelected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    Box(modifier = modifier.clip(RoundedCornerShape(8.dp)).background(if (isSelected) Color(0xFF00222B) else if (isFocused) TonalixColors.SurfaceCardHover else Color(0xFF0A0F14)).border(1.dp, if (isSelected) TonalixColors.PrimaryCyan else TonalixColors.SurfaceBorder, RoundedCornerShape(8.dp)).focusable(interactionSource = interactionSource).clickable(onClick = onClick).padding(12.dp)) {
        Column {
            Text(text = provider.title, color = if (isSelected) TonalixColors.PrimaryCyan else TonalixColors.TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(text = "${provider.ipPrimary} (${provider.protocol})", color = TonalixColors.TextSecondary, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
        }
    }
}

@Composable
private fun AdBlockAndTelemetryShieldCard(adBlockGlobal: Boolean, onToggleAdBlock: (Boolean) -> Unit, telemetryOem: Boolean, onToggleTelemetryOem: (Boolean) -> Unit, smartTubeShield: Boolean, onToggleSmartTube: (Boolean) -> Unit, selectedLevel: TelemetryBlockingLevel, onSelectLevel: (TelemetryBlockingLevel) -> Unit, onUpdateRules: () -> Unit, isUpdatingRules: Boolean, activeRulesCount: Int) {
    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(TonalixColors.SurfaceCard).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(10.dp)).padding(16.dp)) {
        Column {
            Text(text = "Escudo de Filtrado Global y Bloqueo de Rastreadores", color = TonalixColors.TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Escudo AdBlock Global en Todo el Sistema", color = TonalixColors.TextPrimary, fontSize = 12.sp)
                Switch(checked = adBlockGlobal, onCheckedChange = onToggleAdBlock, colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = TonalixColors.PrimaryCyan))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Bloqueo Estricto de Telemetría OEM", color = TonalixColors.TextPrimary, fontSize = 12.sp)
                Switch(checked = telemetryOem, onCheckedChange = onToggleTelemetryOem, colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = TonalixColors.PrimaryCyan))
            }
        }
    }
}

@Composable
private fun ArmoredSessionAndLeaksCard(isolateSession: Boolean, onToggleIsolate: (Boolean) -> Unit, preventLeak: Boolean, onTogglePreventLeak: (Boolean) -> Unit, anonymizeMac: Boolean, onToggleAnonymizeMac: (Boolean) -> Unit, selectedEncryption: EncryptionLevel, onSelectEncryption: (EncryptionLevel) -> Unit) {
    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(TonalixColors.SurfaceCard).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(10.dp)).padding(16.dp)) {
        Column {
            Text(text = "Sesión Blindada & Criptografía de Memoria", color = TonalixColors.TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(14.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Aislamiento de Sesión Blindada", color = TonalixColors.TextPrimary, fontSize = 12.sp)
                Switch(checked = isolateSession, onCheckedChange = onToggleIsolate, colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = TonalixColors.PrimaryCyan))
            }
        }
    }
}

@Composable
private fun TonalixPrivacyDiagnosticsSidebar(telemetry: PrivacyTelemetry, isTestingLeak: Boolean, onRunLeakTest: () -> Unit, onResetDefaults: () -> Unit) {
    Column(modifier = Modifier.width(300.dp).fillMaxHeight().background(TonalixColors.Surface).padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(text = "DIAGNÓSTICO EN VIVO", color = TonalixColors.TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(14.dp))
            Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(TonalixColors.SurfaceCard).border(1.dp, TonalixColors.SurfaceBorder, RoundedCornerShape(8.dp)).padding(12.dp)) {
                Column {
                    Text(text = telemetry.dnsLeakStatus, color = TonalixColors.AccentEmerald, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = onRunLeakTest, enabled = !isTestingLeak, colors = ButtonDefaults.buttonColors(containerColor = TonalixColors.PrimaryCyan), modifier = Modifier.fillMaxWidth()) {
                        Text(text = if (isTestingLeak) "Auditando..." else "Ejecutar Test de Fugas", color = Color.Black, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        OutlinedButton(onClick = onResetDefaults, modifier = Modifier.fillMaxWidth()) {
            Text(text = "Restablecer Privacidad", color = TonalixColors.TextPrimary, fontSize = 11.sp)
        }
    }
}

@Composable
private fun TonalixBottomBar() {
    Row(modifier = Modifier.fillMaxWidth().height(44.dp).background(TonalixColors.Surface).border(1.dp, TonalixColors.SurfaceBorder).padding(horizontal = 24.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Text(text = "▲▼ Navegar | OK Seleccionar | Back Regresar", color = TonalixColors.TextMuted, fontSize = 11.sp)
        Text(text = "Android TV • DNS Anti-Ad Conectado", color = TonalixColors.AccentEmerald, fontSize = 11.sp)
    }
}
