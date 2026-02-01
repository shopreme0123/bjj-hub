package com.yourbjj.android

import android.app.Application
import com.yourbjj.android.data.remote.SupabaseClient
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class YourBJJApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // Initialize Supabase
        SupabaseClient.initialize(this)
    }
}
