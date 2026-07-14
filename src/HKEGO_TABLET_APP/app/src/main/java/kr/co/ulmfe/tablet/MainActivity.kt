package kr.co.ulmfe.tablet

import android.annotation.SuppressLint
import android.Manifest
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.content.pm.PackageManager
import android.provider.MediaStore
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.ValueCallback
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.core.content.ContextCompat
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import kr.co.ulmfe.tablet.push.AndroidPushBridge
import kr.co.ulmfe.tablet.push.PushContract
import kr.co.ulmfe.tablet.push.PushRegistrationManager
import java.io.File
import java.io.IOException

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private val cookieManager: CookieManager by lazy { CookieManager.getInstance() }
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingCameraUri: Uri? = null
    private var pendingCameraFile: File? = null
    private var lastCapturedImageFile: File? = null
    private var jsAlertDialog: AlertDialog? = null
    private var jsAlertResult: JsResult? = null

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        handleFileChooserResult(result.resultCode, result.data)
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        pendingCameraUri = savedInstanceState
            ?.getString(STATE_PENDING_CAMERA_URI)
            ?.let(Uri::parse)
        pendingCameraFile = savedInstanceState
            ?.getString(STATE_PENDING_CAMERA_FILE)
            ?.let(::File)

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

            cookieManager.setAcceptCookie(true)
            cookieManager.setAcceptThirdPartyCookies(this, true)
            addJavascriptInterface(
                AndroidPushBridge(applicationContext),
                PushContract.JS_INTERFACE_NAME
            )

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean = handleNavigation(request.url)

                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    cookieManager.flush()
                }
            }
            webChromeClient = object : WebChromeClient() {
                override fun onJsAlert(
                    view: WebView,
                    url: String,
                    message: String,
                    result: JsResult
                ): Boolean {
                    showJsAlert(message, result)
                    return true
                }

                override fun onShowFileChooser(
                    webView: WebView,
                    filePathCallback: ValueCallback<Array<Uri>>,
                    fileChooserParams: FileChooserParams
                ): Boolean {
                    launchImageChooser(filePathCallback, fileChooserParams)
                    return true
                }
            }
        }

        setContentView(webView)
        registerBackPressedHandler()
        requestNotificationPermissionIfNeeded()
        refreshFcmTokenIfConfigured()

        val restored = savedInstanceState != null && webView.restoreState(savedInstanceState) != null
        if (!restored) {
            webView.loadUrl(getString(R.string.tablet_web_url))
        }
        handlePushIntent(intent, isColdStart = savedInstanceState == null)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handlePushIntent(intent, isColdStart = false)
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private fun showJsAlert(message: String, result: JsResult) {
        dismissJsAlert()

        if (isFinishing || isDestroyed) {
            result.confirm()
            return
        }

        jsAlertResult = result
        val dialog = AlertDialog.Builder(this)
            .setTitle(R.string.js_alert_title)
            .setMessage(message)
            .setPositiveButton(R.string.js_alert_confirm, null)
            .create()

        jsAlertDialog = dialog
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                confirmJsAlert(result)
                dialog.dismiss()
            }
        }
        dialog.setOnCancelListener {
            confirmJsAlert(result)
        }
        dialog.setOnDismissListener {
            confirmJsAlert(result)
        }
        dialog.show()
    }

    private fun confirmJsAlert(result: JsResult) {
        if (jsAlertResult !== result) {
            return
        }

        jsAlertResult = null
        jsAlertDialog = null
        result.confirm()
    }

    private fun dismissJsAlert() {
        val result = jsAlertResult
        val dialog = jsAlertDialog
        jsAlertResult = null
        jsAlertDialog = null
        result?.confirm()
        dialog?.setOnDismissListener(null)
        dialog?.dismiss()
    }

    private fun refreshFcmTokenIfConfigured() {
        if (FirebaseApp.getApps(this).isEmpty()) {
            return
        }

        FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
            PushRegistrationManager.updateToken(applicationContext, token)
        }
    }

    private fun handlePushIntent(pushIntent: Intent?, isColdStart: Boolean) {
        when (pushIntent?.getStringExtra(PushContract.EXTRA_TYPE)) {
            PushContract.TYPE_TEACHER_CALL -> {
                val path = pushIntent.getStringExtra(PushContract.EXTRA_PATH)
                    ?: PushContract.TEACHER_CALL_PATH
                resolveInternalPushUrl(path)?.let(webView::loadUrl)
            }

            PushContract.TYPE_TEACHER_MESSAGE -> {
                if (!isColdStart) {
                    webView.reload()
                }
            }
        }

        pushIntent?.removeExtra(PushContract.EXTRA_TYPE)
        pushIntent?.removeExtra(PushContract.EXTRA_PATH)
    }

    private fun resolveInternalPushUrl(path: String): String? {
        if (!path.startsWith('/')) {
            return null
        }

        val uri = Uri.parse("${PushContract.TABLET_ORIGIN}$path")
        return if (uri.scheme == "https" &&
            uri.host.equals(TABLET_HOST, ignoreCase = true)
        ) {
            uri.toString()
        } else {
            null
        }
    }

    private fun registerBackPressedHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    showExitConfirmation()
                }
            }
        })
    }

    private fun handleNavigation(uri: Uri): Boolean {
        val isInternalWebUrl = uri.scheme in setOf("http", "https") &&
            uri.host.equals(TABLET_HOST, ignoreCase = true)

        if (isInternalWebUrl) {
            return false
        }

        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            })
            true
        } catch (_: ActivityNotFoundException) {
            true
        }
    }

    private fun showExitConfirmation() {
        AlertDialog.Builder(this)
            .setTitle(R.string.exit_dialog_title)
            .setMessage(R.string.exit_dialog_message)
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(R.string.exit_dialog_confirm) { _, _ ->
                cookieManager.flush()
                finishAndRemoveTask()
            }
            .show()
    }

    private fun launchImageChooser(
        callback: ValueCallback<Array<Uri>>,
        fileChooserParams: WebChromeClient.FileChooserParams
    ) {
        cancelFileChooser()
        lastCapturedImageFile?.delete()
        lastCapturedImageFile = null
        filePathCallback = callback

        val galleryIntent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
            putExtra(
                Intent.EXTRA_ALLOW_MULTIPLE,
                fileChooserParams.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE
            )
        }
        val cameraIntent = createCameraIntent()
        val chooserIntent = Intent.createChooser(
            galleryIntent,
            getString(R.string.image_chooser_title)
        ).apply {
            cameraIntent?.let {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(it))
            }
        }

        try {
            fileChooserLauncher.launch(chooserIntent)
        } catch (_: ActivityNotFoundException) {
            cancelFileChooser()
        }
    }

    private fun createCameraIntent(): Intent? {
        val cameraDirectory = File(cacheDir, CAMERA_DIRECTORY).apply {
            if (!exists() && !mkdirs()) {
                return null
            }
        }
        val imageFile = try {
            File.createTempFile(CAMERA_FILE_PREFIX, CAMERA_FILE_SUFFIX, cameraDirectory)
        } catch (_: IOException) {
            return null
        }
        val imageUri = try {
            FileProvider.getUriForFile(
                this,
                "$packageName.fileprovider",
                imageFile
            )
        } catch (_: IllegalArgumentException) {
            imageFile.delete()
            return null
        }
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(MediaStore.EXTRA_OUTPUT, imageUri)
            clipData = ClipData.newRawUri("camera_image", imageUri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        }

        if (cameraIntent.resolveActivity(packageManager) == null) {
            imageFile.delete()
            return null
        }

        pendingCameraFile = imageFile
        pendingCameraUri = imageUri
        return cameraIntent
    }

    private fun handleFileChooserResult(resultCode: Int, data: Intent?) {
        val callback = filePathCallback
        filePathCallback = null

        if (callback == null) {
            clearPendingCameraFile()
            return
        }

        val selectedUris = when {
            resultCode != Activity.RESULT_OK -> null
            data?.data != null || data?.clipData != null ->
                WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            pendingCameraUri != null -> arrayOf(pendingCameraUri!!)
            else -> null
        }
        val usedCamera = resultCode == Activity.RESULT_OK &&
            data?.data == null &&
            data?.clipData == null &&
            selectedUris != null

        callback.onReceiveValue(selectedUris)

        if (usedCamera) {
            lastCapturedImageFile = pendingCameraFile
            pendingCameraFile = null
            pendingCameraUri = null
        } else {
            clearPendingCameraFile()
        }
    }

    private fun cancelFileChooser() {
        filePathCallback?.onReceiveValue(null)
        filePathCallback = null
        clearPendingCameraFile()
    }

    private fun clearPendingCameraFile() {
        pendingCameraFile?.delete()
        pendingCameraFile = null
        pendingCameraUri = null
    }

    override fun onSaveInstanceState(outState: Bundle) {
        webView.saveState(outState)
        pendingCameraUri?.let {
            outState.putString(STATE_PENDING_CAMERA_URI, it.toString())
        }
        pendingCameraFile?.let {
            outState.putString(STATE_PENDING_CAMERA_FILE, it.absolutePath)
        }
        super.onSaveInstanceState(outState)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        cookieManager.flush()
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        dismissJsAlert()
        cancelFileChooser()
        lastCapturedImageFile?.delete()
        lastCapturedImageFile = null
        cookieManager.flush()
        webView.stopLoading()
        webView.removeAllViews()
        webView.destroy()
        super.onDestroy()
    }

    private companion object {
        const val TABLET_HOST = "ulmfe-tablet.hk-test.co.kr"
        const val CAMERA_DIRECTORY = "camera_images"
        const val CAMERA_FILE_PREFIX = "capture_"
        const val CAMERA_FILE_SUFFIX = ".jpg"
        const val STATE_PENDING_CAMERA_URI = "pending_camera_uri"
        const val STATE_PENDING_CAMERA_FILE = "pending_camera_file"
    }
}
