import Capacitor
import UIKit

class MyViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(SightWordSpeechPlugin())
    }
}
