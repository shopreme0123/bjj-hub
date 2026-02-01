package com.yourbjj.android.data.remote

import android.content.Context
import com.yourbjj.android.BuildConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage

object SupabaseClient {
    private var client: SupabaseClient? = null

    fun initialize(context: Context) {
        if (client == null) {
            client = createSupabaseClient(
                supabaseUrl = BuildConfig.SUPABASE_URL,
                supabaseKey = BuildConfig.SUPABASE_ANON_KEY
            ) {
                install(Auth)
                install(Postgrest)
                install(Storage)
            }
        }
    }

    fun getInstance(): SupabaseClient {
        return client ?: throw IllegalStateException(
            "SupabaseClient must be initialized before use"
        )
    }

    val auth: Auth
        get() = getInstance().auth

    val postgrest: Postgrest
        get() = getInstance().postgrest

    val storage: Storage
        get() = getInstance().storage
}
