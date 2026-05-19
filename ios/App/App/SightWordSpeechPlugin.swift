import AVFoundation
import Capacitor

@objc(SightWordSpeechPlugin)
public class SightWordSpeechPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SightWordSpeechPlugin"
    public let jsName = "SightWordSpeech"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise)
    ]

    private let synthesizer = AVSpeechSynthesizer()

    @objc func speak(_ call: CAPPluginCall) {
        guard let value = call.getString("value")?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            call.reject("A word is required.")
            return
        }

        DispatchQueue.main.async {
            if self.synthesizer.isSpeaking {
                self.synthesizer.stopSpeaking(at: .immediate)
            }

            let utterance = AVSpeechUtterance(string: value)
            utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
            utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.85
            utterance.pitchMultiplier = 1.08

            self.synthesizer.speak(utterance)
            call.resolve()
        }
    }
}
