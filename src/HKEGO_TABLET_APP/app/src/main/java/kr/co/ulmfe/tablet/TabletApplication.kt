package kr.co.ulmfe.tablet

import android.app.Application
import kr.co.ulmfe.tablet.push.PushNotificationManager

class TabletApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        PushNotificationManager.createChannels(this)
    }
}
