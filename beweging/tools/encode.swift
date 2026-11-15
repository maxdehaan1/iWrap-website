// iWrap motion kit — frame encoder.
// Reads PNG frames (optionally several sub-frame samples per frame, which are averaged = motion blur)
// and writes H.264 .mp4, ProRes 4444 .mov (with alpha), HEVC-with-alpha .mov, or an animated GIF.
//
//   encode <framesDir> <out> --fps 30 --codec h264|prores4444|hevcalpha|gif [--bitrate N] [--alpha straight|premult] [--gifdelay 0.04]
//   encode probe <movie> <seconds> <x> <y>
//
// Frame files are named  f<frame>_<sample>.png  (e.g. f00012_03.png); all samples of a frame are averaged.

import Foundation
import AVFoundation
import CoreGraphics
import ImageIO
import CoreVideo
import UniformTypeIdentifiers

func fail(_ s: String) -> Never {
    FileHandle.standardError.write((s + "\n").data(using: .utf8)!)
    exit(1)
}

func loadPremult(_ path: String) -> (Int, Int, [UInt8]) {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fail("cannot read \(path)") }
    let w = img.width, h = img.height
    var buf = [UInt8](repeating: 0, count: w * h * 4)
    var cs = img.colorSpace ?? CGColorSpaceCreateDeviceRGB()
    if cs.model != .rgb { cs = CGColorSpaceCreateDeviceRGB() }
    buf.withUnsafeMutableBytes { p in
        guard let ctx = CGContext(data: p.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                                  space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { fail("no context") }
        ctx.setBlendMode(.copy)
        ctx.interpolationQuality = .none
        ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    }
    return (w, h, buf)
}

/// Average of all sample files of one frame, as premultiplied RGBA8.
func averaged(_ files: [String]) -> (Int, Int, [UInt8]) {
    if files.count == 1 { return loadPremult(files[0]) }
    var acc: [UInt32] = []
    var W = 0, H = 0
    for f in files {
        let (w, h, px) = loadPremult(f)
        if acc.isEmpty { acc = [UInt32](repeating: 0, count: w * h * 4); W = w; H = h }
        if w != W || h != H { fail("size mismatch in \(f)") }
        acc.withUnsafeMutableBufferPointer { a in
            px.withUnsafeBufferPointer { p in
                for i in 0..<(W * H * 4) { a[i] &+= UInt32(p[i]) }
            }
        }
    }
    let n = UInt32(files.count), half = n / 2
    var out = [UInt8](repeating: 0, count: W * H * 4)
    out.withUnsafeMutableBufferPointer { o in
        acc.withUnsafeBufferPointer { a in
            for i in 0..<(W * H * 4) { o[i] = UInt8((a[i] &+ half) / n) }
        }
    }
    return (W, H, out)
}

func groupFrames(_ dir: String) -> [[String]] {
    let fm = FileManager.default
    guard let names = try? fm.contentsOfDirectory(atPath: dir) else { fail("cannot list \(dir)") }
    var groups: [Int: [String]] = [:]
    for n in names where n.hasSuffix(".png") && n.hasPrefix("f") {
        let core = n.dropFirst().dropLast(4)
        let parts = core.split(separator: "_")
        guard let fi = Int(parts[0]) else { continue }
        groups[fi, default: []].append(dir + "/" + n)
    }
    return groups.keys.sorted().map { groups[$0]!.sorted() }
}

func fillBuffer(_ pb: CVPixelBuffer, _ w: Int, _ h: Int, _ px: [UInt8], straight: Bool) {
    CVPixelBufferLockBaseAddress(pb, [])
    let base = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    let bpr = CVPixelBufferGetBytesPerRow(pb)
    px.withUnsafeBufferPointer { p in
        for y in 0..<h {
            let row = base + y * bpr
            var si = y * w * 4
            for x in 0..<w {
                var r = UInt32(p[si]), g = UInt32(p[si + 1]), b = UInt32(p[si + 2])
                let a = UInt32(p[si + 3])
                if straight && a > 0 && a < 255 {
                    r = min(255, (r * 255 + a / 2) / a); g = min(255, (g * 255 + a / 2) / a); b = min(255, (b * 255 + a / 2) / a)
                }
                let d = row + x * 4
                d[0] = UInt8(b); d[1] = UInt8(g); d[2] = UInt8(r); d[3] = UInt8(a)
                si += 4
            }
        }
    }
    CVPixelBufferUnlockBaseAddress(pb, [])
}

func tag(_ pb: CVPixelBuffer, alpha: String?) {
    CVBufferSetAttachment(pb, kCVImageBufferColorPrimariesKey, kCVImageBufferColorPrimaries_ITU_R_709_2, .shouldPropagate)
    CVBufferSetAttachment(pb, kCVImageBufferTransferFunctionKey, kCVImageBufferTransferFunction_ITU_R_709_2, .shouldPropagate)
    CVBufferSetAttachment(pb, kCVImageBufferYCbCrMatrixKey, kCVImageBufferYCbCrMatrix_ITU_R_709_2, .shouldPropagate)
    if let a = alpha {
        CVBufferSetAttachment(pb, kCVImageBufferAlphaChannelModeKey,
                              a == "straight" ? kCVImageBufferAlphaChannelMode_StraightAlpha : kCVImageBufferAlphaChannelMode_PremultipliedAlpha,
                              .shouldPropagate)
    }
}

func writeVideo(groups: [[String]], out: String, fps: Int, codec: String, bitrate: Int, alphaMode: String) {
    let (w, h, _) = loadPremult(groups[0][0])
    let url = URL(fileURLWithPath: out)
    try? FileManager.default.removeItem(at: url)
    let isMP4 = (codec == "h264")
    guard let writer = try? AVAssetWriter(outputURL: url, fileType: isMP4 ? .mp4 : .mov) else { fail("cannot create writer") }
    var settings: [String: Any] = [AVVideoWidthKey: w, AVVideoHeightKey: h]
    var comp: [String: Any] = [:]
    var hasAlpha = false
    switch codec {
    case "h264":
        settings[AVVideoCodecKey] = AVVideoCodecType.h264
        comp[AVVideoAverageBitRateKey] = bitrate
        comp[AVVideoProfileLevelKey] = AVVideoProfileLevelH264HighAutoLevel
        comp[AVVideoMaxKeyFrameIntervalKey] = fps
        comp[AVVideoExpectedSourceFrameRateKey] = fps
    case "prores4444":
        settings[AVVideoCodecKey] = AVVideoCodecType.proRes4444
        hasAlpha = true
    case "hevcalpha":
        settings[AVVideoCodecKey] = AVVideoCodecType.hevcWithAlpha
        comp[AVVideoQualityKey] = 0.82
        hasAlpha = true
    default: fail("unknown codec \(codec)")
    }
    if !comp.isEmpty { settings[AVVideoCompressionPropertiesKey] = comp }
    settings[AVVideoColorPropertiesKey] = [
        AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
        AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
        AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2
    ]
    let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
    input.expectsMediaDataInRealTime = false
    let attrs: [String: Any] = [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: w, kCVPixelBufferHeightKey as String: h,
        kCVPixelBufferIOSurfacePropertiesKey as String: [String: Any]()
    ]
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attrs)
    guard writer.canAdd(input) else { fail("cannot add input") }
    writer.add(input)
    guard writer.startWriting() else { fail("startWriting: \(String(describing: writer.error))") }
    writer.startSession(atSourceTime: .zero)
    let straight = hasAlpha && alphaMode == "straight"
    for (i, files) in groups.enumerated() {
        autoreleasepool {
            let (fw, fh, px) = averaged(files)
            if fw != w || fh != h { fail("frame \(i) has a different size") }
            var pbo: CVPixelBuffer?
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pbo)
            guard let pb = pbo else { fail("no pixel buffer") }
            fillBuffer(pb, w, h, px, straight: straight)
            tag(pb, alpha: hasAlpha ? alphaMode : nil)
            while !input.isReadyForMoreMediaData { usleep(2000) }
            if !adaptor.append(pb, withPresentationTime: CMTime(value: Int64(i), timescale: Int32(fps))) {
                fail("append failed at \(i): \(String(describing: writer.error))")
            }
        }
    }
    input.markAsFinished()
    writer.endSession(atSourceTime: CMTime(value: Int64(groups.count), timescale: Int32(fps)))
    let sem = DispatchSemaphore(value: 0)
    writer.finishWriting { sem.signal() }
    sem.wait()
    if writer.status != .completed { fail("writer failed: \(String(describing: writer.error))") }
    let size = (try? FileManager.default.attributesOfItem(atPath: out)[.size] as? Int) ?? 0
    print("\(out)  \(w)x\(h)  \(groups.count) frames @\(fps)  \(String(format: "%.2f", Double(size) / 1_048_576)) MB")
}

func writeGIF(groups: [[String]], out: String, delay: Double, first: Double, last: Double) {
    let url = URL(fileURLWithPath: out)
    try? FileManager.default.removeItem(at: url)
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.gif.identifier as CFString, groups.count, nil) else { fail("no gif dest") }
    CGImageDestinationSetProperties(dest, [kCGImagePropertyGIFDictionary as String: [kCGImagePropertyGIFLoopCount as String: 0]] as CFDictionary)
    func props(_ d: Double) -> CFDictionary {
        return [kCGImagePropertyGIFDictionary as String: [kCGImagePropertyGIFDelayTime as String: d, kCGImagePropertyGIFUnclampedDelayTime as String: d]] as CFDictionary
    }
    for (gi, files) in groups.enumerated() {
        let fprops = props(gi == 0 && first > 0 ? first : (gi == groups.count - 1 && last > 0 ? last : delay))
        autoreleasepool {
            var (w, h, px) = averaged(files)
            let cs = CGColorSpace(name: CGColorSpace.sRGB)!
            px.withUnsafeMutableBytes { p in
                let ctx = CGContext(data: p.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs,
                                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
                if let img = ctx.makeImage() { CGImageDestinationAddImage(dest, img, fprops) }
            }
        }
    }
    if !CGImageDestinationFinalize(dest) { fail("gif finalize failed") }
    let size = (try? FileManager.default.attributesOfItem(atPath: out)[.size] as? Int) ?? 0
    print("\(out)  \(groups.count) frames  \(String(format: "%.2f", Double(size) / 1_048_576)) MB")
}

func probe(_ path: String, _ t: Double, _ x: Int, _ y: Int) {
    let asset = AVURLAsset(url: URL(fileURLWithPath: path))
    guard let track = asset.tracks(withMediaType: .video).first else { fail("no video track") }
    let fd = track.formatDescriptions.first.map { $0 as! CMFormatDescription }
    if let fd = fd {
        let ext = CMFormatDescriptionGetExtensions(fd) as? [String: Any] ?? [:]
        let keys = ["AlphaChannelMode", "ContainsAlphaChannel", "CVImageBufferColorPrimaries", "CVImageBufferTransferFunction", "CVImageBufferYCbCrMatrix", "Depth", "FormatName"]
        var s = ""
        for k in keys { if let v = ext[k] { s += "\(k)=\(v) " } }
        let dim = CMVideoFormatDescriptionGetDimensions(fd)
        print("track: \(dim.width)x\(dim.height) fps=\(track.nominalFrameRate) dur=\(String(format: "%.3f", asset.duration.seconds)) \(s)")
    }
    // raw decode
    guard let reader = try? AVAssetReader(asset: asset) else { fail("no reader") }
    let outp = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
    reader.add(outp)
    reader.timeRange = CMTimeRange(start: CMTime(seconds: t, preferredTimescale: 600), duration: CMTime(seconds: 0.2, preferredTimescale: 600))
    reader.startReading()
    if let sb = outp.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(sb) {
        CVPixelBufferLockBaseAddress(pb, .readOnly)
        let base = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
        let bpr = CVPixelBufferGetBytesPerRow(pb)
        let p = base + y * bpr + x * 4
        let am = CVBufferGetAttachment(pb, kCVImageBufferAlphaChannelModeKey, nil)?.takeUnretainedValue()
        print("raw BGRA @(\(x),\(y)) -> R=\(p[2]) G=\(p[1]) B=\(p[0]) A=\(p[3])  alphaModeAttachment=\(String(describing: am))")
        CVPixelBufferUnlockBaseAddress(pb, .readOnly)
    }
    // what an AVFoundation-based player would composite: image generator -> draw over white
    let gen = AVAssetImageGenerator(asset: asset)
    gen.requestedTimeToleranceBefore = .zero; gen.requestedTimeToleranceAfter = .zero
    if let img = try? gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil) {
        var buf = [UInt8](repeating: 255, count: img.width * img.height * 4)
        buf.withUnsafeMutableBytes { q in
            let ctx = CGContext(data: q.baseAddress, width: img.width, height: img.height, bitsPerComponent: 8, bytesPerRow: img.width * 4,
                                space: img.colorSpace ?? CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.setFillColor(red: 1, green: 1, blue: 1, alpha: 1)
            ctx.fill(CGRect(x: 0, y: 0, width: img.width, height: img.height))
            ctx.draw(img, in: CGRect(x: 0, y: 0, width: img.width, height: img.height))
        }
        let i = (y * img.width + x) * 4
        print("generator: alphaInfo=\(img.alphaInfo.rawValue) over white @(\(x),\(y)) -> R=\(buf[i]) G=\(buf[i+1]) B=\(buf[i+2])")
    }
}


/// Decode one frame (raw BGRA as stored) and save it as PNG; optionally print semi-transparent pixels of one row.
func grab(_ path: String, _ t: Double, _ out: String, scanY: Int?) {
    let asset = AVURLAsset(url: URL(fileURLWithPath: path))
    guard let track = asset.tracks(withMediaType: .video).first, let reader = try? AVAssetReader(asset: asset) else { fail("cannot open \(path)") }
    let outp = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
    reader.add(outp)
    reader.timeRange = CMTimeRange(start: CMTime(seconds: t, preferredTimescale: 600), duration: CMTime(seconds: 0.5, preferredTimescale: 600))
    reader.startReading()
    guard let sb = outp.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(sb) else { fail("no frame at \(t)") }
    CVPixelBufferLockBaseAddress(pb, .readOnly)
    let w = CVPixelBufferGetWidth(pb), h = CVPixelBufferGetHeight(pb), bpr = CVPixelBufferGetBytesPerRow(pb)
    let base = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    var rgba = [UInt8](repeating: 0, count: w * h * 4)
    for y in 0..<h { for x in 0..<w { let p = base + y * bpr + x * 4; let i = (y * w + x) * 4; rgba[i] = p[2]; rgba[i+1] = p[1]; rgba[i+2] = p[0]; rgba[i+3] = p[3] } }
    if let sy = scanY {
        var n = 0
        for x in stride(from: 0, to: w, by: 4) {
            let i = (sy * w + x) * 4
            if rgba[i+3] > 20 && rgba[i+3] < 235 && n < 6 { print("  x=\(x): R=\(rgba[i]) G=\(rgba[i+1]) B=\(rgba[i+2]) A=\(rgba[i+3])"); n += 1 }
        }
    }
    CVPixelBufferUnlockBaseAddress(pb, .readOnly)
    let cs = CGColorSpaceCreateDeviceRGB()
    rgba.withUnsafeMutableBytes { q in
        // stored values are written as-is with "last" (straight) alpha so nothing is re-multiplied
        let prov = CGDataProvider(data: Data(bytes: q.baseAddress!, count: w * h * 4) as CFData)!
        let img = CGImage(width: w, height: h, bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: w * 4, space: cs,
                          bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue), provider: prov, decode: nil, shouldInterpolate: false, intent: .defaultIntent)!
        let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: out) as CFURL, UTType.png.identifier as CFString, 1, nil)!
        CGImageDestinationAddImage(dest, img, nil)
        CGImageDestinationFinalize(dest)
    }
    print("grabbed \(w)x\(h) -> \(out)")
}

// ---------------------------------------------------------------- main
var args = Array(CommandLine.arguments.dropFirst())
if args.first == "grab" {
    grab(args[1], Double(args[2]) ?? 0, args[3], scanY: args.count > 4 ? Int(args[4]) : nil)
    exit(0)
}
if args.first == "probe" {
    probe(args[1], Double(args[2]) ?? 0, Int(args[3]) ?? 0, Int(args[4]) ?? 0)
    exit(0)
}
guard args.count >= 2 else { fail("usage: encode <framesDir> <out> [--fps 30] [--codec h264|prores4444|hevcalpha|gif]") }
let dir = args[0], outPath = args[1]
var fps = 30, codec = "h264", bitrate = 12_000_000, alphaMode = "straight", gifDelay = 0.04, gifFirst = 0.0, gifLast = 0.0
var i = 2
while i < args.count - 1 {
    switch args[i] {
    case "--fps": fps = Int(args[i + 1]) ?? 30
    case "--codec": codec = args[i + 1]
    case "--bitrate": bitrate = Int(args[i + 1]) ?? bitrate
    case "--alpha": alphaMode = args[i + 1]
    case "--gifdelay": gifDelay = Double(args[i + 1]) ?? gifDelay
    case "--giffirst": gifFirst = Double(args[i + 1]) ?? 0
    case "--giflast": gifLast = Double(args[i + 1]) ?? 0
    default: fail("unknown option \(args[i])")
    }
    i += 2
}
let groups = groupFrames(dir)
if groups.isEmpty { fail("no frames in \(dir)") }
if codec == "gif" { writeGIF(groups: groups, out: outPath, delay: gifDelay, first: gifFirst, last: gifLast) }
else { writeVideo(groups: groups, out: outPath, fps: fps, codec: codec, bitrate: bitrate, alphaMode: alphaMode) }
