
import AVFoundation
import AppKit
let src = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
let asset = AVAsset(url: src)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.maximumSize = CGSize(width: 1200, height: 1200)
let dur = CMTimeGetSeconds(asset.duration)
let times: [Double] = stride(from: 0.0, through: min(dur, 20.0), by: 0.5).map { $0 }
for (i,t) in times.enumerated() {
  let cm = CMTime(seconds: t, preferredTimescale: 600)
  do {
    let cg = try gen.copyCGImage(at: cm, actualTime: nil)
    let rep = NSBitmapImageRep(cgImage: cg)
    if let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.7]) {
      let path = "\(outDir)/f-\(String(format: "%03d", i)).jpg"
      try data.write(to: URL(fileURLWithPath: path))
      print("wrote", path)
    }
  } catch {
    print("err", t, error)
  }
}
print("done dur", dur)
