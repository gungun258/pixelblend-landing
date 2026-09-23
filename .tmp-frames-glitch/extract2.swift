
import AVFoundation
import AppKit
let src = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
let asset = AVURLAsset(url: src)
print("tracks", asset.tracks.count, "dur", CMTimeGetSeconds(asset.duration))
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
gen.maximumSize = CGSize(width: 900, height: 900)
let dur = CMTimeGetSeconds(asset.duration)
guard dur > 0 && !dur.isNaN else { print("bad dur"); exit(1) }
var i = 0
for t in stride(from: 0.3, through: min(dur-0.2, 18.0), by: 0.7) {
  let cm = CMTimeMakeWithSeconds(t, preferredTimescale: 600)
  do {
    let (cg, _) = try gen.copyCGImage(at: cm, actualTime: nil)
    let img = NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height))
    guard let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
          let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.65]) else { continue }
    let path = "\(outDir)/g-\(String(format: "%03d", i)).jpg"
    try data.write(to: URL(fileURLWithPath: path))
    print("ok", i, t)
    i += 1
  } catch { print("fail", t, error.localizedDescription) }
}
