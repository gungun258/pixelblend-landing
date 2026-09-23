
import AVFoundation
import AppKit
let src = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
let asset = AVURLAsset(url: src)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.maximumSize = CGSize(width: 800, height: 800)
let dur = CMTimeGetSeconds(asset.duration)
var i = 0
for t in stride(from: 0.5, through: min(dur-0.3, 16.0), by: 1.0) {
  let cm = CMTimeMakeWithSeconds(t, preferredTimescale: 600)
  do {
    let cgImage = try gen.copyCGImage(at: cm, actualTime: nil)
    let rep = NSBitmapImageRep(cgImage: cgImage)
    let data = rep.representation(using: NSBitmapImageRep.FileType.jpeg, properties: [NSBitmapImageRep.PropertyKey.compressionFactor: 0.7])!
    try data.write(to: URL(fileURLWithPath: "\(outDir)/g-\(String(format: "%03d", i)).jpg"))
    print("ok", i)
    i += 1
  } catch { print("fail", t) }
}
