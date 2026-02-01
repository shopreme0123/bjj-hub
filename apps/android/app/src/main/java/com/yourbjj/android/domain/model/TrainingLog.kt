package com.yourbjj.android.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TrainingLog(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    val date: String,
    @SerialName("start_time")
    val startTime: String? = null,
    @SerialName("end_time")
    val endTime: String? = null,
    @SerialName("duration_minutes")
    val durationMinutes: Int? = null,
    val condition: Int? = null,
    @SerialName("sparring_rounds")
    val sparringRounds: Int? = null,
    val content: String? = null,
    val notes: String? = null,
    val techniques: List<String>? = null,
    @SerialName("video_urls")
    val videoUrls: List<String>? = null,
    @SerialName("created_at")
    val createdAt: String? = null,
    @SerialName("updated_at")
    val updatedAt: String? = null
)
