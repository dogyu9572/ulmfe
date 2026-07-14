package kr.co.ulmfe.tablet.push

import android.content.Context
import android.webkit.JavascriptInterface

class AndroidPushBridge(context: Context) {
    private val appContext = context.applicationContext

    @JavascriptInterface
    fun registerContext(contextJson: String) {
        PushRegistrationManager.registerContext(appContext, contextJson)
    }

    @JavascriptInterface
    fun unregisterContext() {
        PushRegistrationManager.unregisterContext(appContext)
    }

    @JavascriptInterface
    fun getDeviceId(): String = PushRegistrationManager.getDeviceId(appContext)
}
