# ==============================================================================
# SENTINEL-IOT: PYWEBVIEW NATIVE DESKTOP SHELL (SECTION 8.1)
# Version 2.4 - Enterprise Production Edition - FYP-II
# ==============================================================================

import sys
import os

try:
    import webview
except ImportError:
    print("PyWebView not installed. Run: pip install pywebview")
    sys.exit(1)

def launch():
    print("=" * 70)
    print("Launching Sentinel-IoT Autonomous XDR Native Desktop Console...")
    print("=" * 70)
    
    window = webview.create_window(
        title='Sentinel-IoT Autonomous XDR & Compliance Console',
        url='http://localhost:3000',
        width=1440,
        height=900,
        min_size=(1024, 768),
        background_color='#070D17',
        confirm_close=True
    )
    webview.start()

if __name__ == '__main__':
    launch()
